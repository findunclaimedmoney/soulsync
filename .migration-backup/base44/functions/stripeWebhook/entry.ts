import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.0.0';

const TIER_CONFIG = {
  plus: { minutes: 80, intimacy: false, twin: false },
  pro: { minutes: 80, intimacy: true, twin: false },
  vip: { minutes: 500, intimacy: true, twin: true },
};

const CREDIT_AMOUNTS = {
  intimacy: { '15min': 75.00, '30min': 150.00, '60min': 300.00 },
  topup: { 'pack_5': 5.00, 'pack_10': 10.00, 'pack_25': 25.00, 'pack_50': 50.00 },
  feature_session: { '15min': 1.0, '30min': 2.0, '60min': 3.0 },
  custom_avatar: { 'single': 19.90 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    // ── checkout.session.completed → grant tier or credits for ALL payment types ──
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;

      if (userId) {
        const sessionId = session.id;

        // Find existing subscription (check both created_by_id and owner_user_id)
        let subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: userId });
        if (subs.length === 0) {
          subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: userId });
        }
        let sub = subs[0];

        // Idempotency: skip if this Stripe session was already processed
        if (sub?.processed_session_ids?.includes(sessionId)) {
          return Response.json({ received: true, already_processed: true });
        }

        const mode = session.mode; // 'subscription' or 'payment'

        if (mode === 'subscription') {
          // ── Tier subscription purchase ──
          const tier = session.metadata?.tier;
          const config = TIER_CONFIG[tier];
          if (config) {
            const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            const updateData = {
              tier,
              video_minutes_limit: config.minutes,
              video_minutes_used: 0,
              intimacy_package: config.intimacy,
              twin_enabled: config.twin,
              stripe_customer_id: session.customer?.toString() || null,
              stripe_subscription_id: session.subscription?.toString() || null,
              current_period_end: periodEnd,
            };

            if (sub) {
              updateData.processed_session_ids = [...(sub.processed_session_ids || []), sessionId];
              await base44.asServiceRole.entities.Subscription.update(sub.id, updateData);
            } else {
              updateData.owner_user_id = userId;
              updateData.processed_session_ids = [sessionId];
              await base44.asServiceRole.entities.Subscription.create(updateData);
            }
          }
        } else if (mode === 'payment' && session.metadata?.type === 'addon') {
          // ── One-time add-on payment (feature_session, topup, intimacy, custom_avatar) ──
          const addon = session.metadata.addon;
          const duration = session.metadata.duration;
          const creditToAdd = CREDIT_AMOUNTS[addon]?.[duration] || 0;

          if (creditToAdd > 0) {
            if (sub) {
              const newBalance = (sub.credit_balance || 0) + creditToAdd;
              await base44.asServiceRole.entities.Subscription.update(sub.id, {
                credit_balance: newBalance,
                stripe_customer_id: session.customer?.toString() || sub.stripe_customer_id,
                processed_session_ids: [...(sub.processed_session_ids || []), sessionId],
              });
            } else {
              await base44.asServiceRole.entities.Subscription.create({
                tier: 'free',
                video_minutes_limit: 0,
                video_minutes_used: 0,
                credit_balance: creditToAdd,
                stripe_customer_id: session.customer?.toString() || null,
                owner_user_id: userId,
                processed_session_ids: [sessionId],
              });
            }
          }

          // Custom avatar — trigger avatar processing after credits are added
          if (addon === 'custom_avatar' && session.metadata?.companion_id) {
            try {
              const companion = await base44.asServiceRole.entities.CustomCompanion.get(session.metadata.companion_id);
              if (companion) {
                await base44.asServiceRole.entities.CustomCompanion.update(session.metadata.companion_id, {
                  avatar_status: 'processing',
                });
                const avatarRes = await base44.functions.invoke('createLiveAvatar', {
                  image_url: companion.image_url,
                  companion_name: companion.name,
                  companion_id: session.metadata.companion_id,
                });
                if (avatarRes.data?.avatar_id) {
                  await base44.asServiceRole.entities.CustomCompanion.update(session.metadata.companion_id, {
                    avatar_id: avatarRes.data.avatar_id,
                  });
                }
              }
            } catch (avatarErr) {
              console.error('Avatar creation failed:', avatarErr);
            }
          }
        }
      }
    }

    // Handle subscription deleted → downgrade to free
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer?.toString();

      const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
      if (subs.length > 0) {
        const sub = subs[0];
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          tier: 'free',
          video_minutes_limit: 0,
          video_minutes_used: 0,
          intimacy_package: false,
          twin_enabled: false,
          stripe_subscription_id: null,
          current_period_end: null,
        });
      }
    }

    // Handle subscription updated → sync renewal + tier
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer?.toString();

      const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
      if (subs.length > 0) {
        const sub = subs[0];
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Reset usage on renewal (when period resets)
        const shouldReset = sub.current_period_end && periodEnd && new Date(periodEnd) > new Date(sub.current_period_end);

        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          stripe_subscription_id: subscription.id,
          current_period_end: periodEnd,
          ...(shouldReset ? { video_minutes_used: 0, daily_messages_used: 0 } : {}),
        });
      }
    }

    // Handle failed payment → downgrade to free
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerId = invoice.customer?.toString();

      const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
      if (subs.length > 0) {
        const sub = subs[0];
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          tier: 'free',
          video_minutes_limit: 0,
          intimacy_package: false,
          twin_enabled: false,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});