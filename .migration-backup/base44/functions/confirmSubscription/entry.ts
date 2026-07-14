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
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Verify the Stripe checkout session belongs to the authenticated user.
    // Reject if no user_id is embedded in the session (prevents sessions with
    // missing metadata from being replayed by a different user).
    const sessionUserId = session.metadata?.user_id || session.client_reference_id;
    if (!sessionUserId || sessionUserId !== user.id) {
      return Response.json({ error: 'This payment session does not belong to your account' }, { status: 403 });
    }

    // Find existing subscription — check created_by_id first, then owner_user_id fallback
    let subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }

    // ── Idempotency: if the webhook already processed this session, just return current balance ──
    const alreadyProcessed = subs[0]?.processed_session_ids?.includes(session_id);
    if (alreadyProcessed) {
      const sub = subs[0];
      return Response.json({
        credit_added: 0,
        new_balance: sub.credit_balance || 0,
        already_processed: true,
      });
    }

    // ── Add-on confirmation (one-time payment) ──
    if (session.metadata?.type === 'addon') {
      const addon = session.metadata.addon;
      const duration = session.metadata.duration;

      // Custom avatar creation — trigger avatar processing, add starter credits
      if (addon === 'custom_avatar') {
        const companionId = session.metadata?.companion_id;
        if (!companionId) return Response.json({ error: 'Missing companion ID' }, { status: 400 });

        const companion = await base44.entities.CustomCompanion.get(companionId);
        if (!companion) return Response.json({ error: 'Companion not found' }, { status: 404 });

        // Only trigger avatar creation if not already active
        if (companion.avatar_status !== 'active') {
          await base44.entities.CustomCompanion.update(companionId, { avatar_status: 'processing' });
          try {
            const avatarRes = await base44.functions.invoke('createLiveAvatar', {
              image_url: companion.image_url,
              companion_name: companion.name,
              companion_id: companionId,
            });
            if (avatarRes.data?.avatar_id) {
              await base44.entities.CustomCompanion.update(companionId, { avatar_id: avatarRes.data.avatar_id });
            }
          } catch (avatarErr) {
            console.error('Avatar creation failed:', avatarErr);
          }
        }

        // Add starter credits (if not already added by webhook)
        const STARTER_CREDIT = 19.90;
        if (subs.length > 0) {
          const sub = subs[0];
          const newBalance = (sub.credit_balance || 0) + STARTER_CREDIT;
          await base44.entities.Subscription.update(sub.id, {
            credit_balance: newBalance,
            stripe_customer_id: session.customer?.toString() || sub.stripe_customer_id,
            processed_session_ids: [...(sub.processed_session_ids || []), session_id],
          });
          return Response.json({ companion_id: companionId, companion_name: companion.name, credit_added: STARTER_CREDIT, new_balance: newBalance });
        } else {
          await base44.entities.Subscription.create({
            tier: 'free',
            video_minutes_limit: 0,
            video_minutes_used: 0,
            credit_balance: STARTER_CREDIT,
            stripe_customer_id: session.customer?.toString() || null,
            processed_session_ids: [session_id],
          });
          return Response.json({ companion_id: companionId, companion_name: companion.name, credit_added: STARTER_CREDIT, new_balance: STARTER_CREDIT });
        }
      }

      // Standard add-on credit grant
      const creditToAdd = CREDIT_AMOUNTS[addon]?.[duration] || 0;
      if (creditToAdd === 0) {
        return Response.json({ error: 'Unknown add-on or duration' }, { status: 400 });
      }

      if (subs.length > 0) {
        const sub = subs[0];
        const newBalance = (sub.credit_balance || 0) + creditToAdd;
        await base44.entities.Subscription.update(sub.id, {
          credit_balance: newBalance,
          stripe_customer_id: session.customer?.toString() || sub.stripe_customer_id,
          processed_session_ids: [...(sub.processed_session_ids || []), session_id],
        });
        return Response.json({ addon, credit_added: creditToAdd, new_balance: newBalance });
      } else {
        await base44.entities.Subscription.create({
          tier: 'free',
          video_minutes_limit: 0,
          video_minutes_used: 0,
          credit_balance: creditToAdd,
          stripe_customer_id: session.customer?.toString() || null,
          processed_session_ids: [session_id],
        });
        return Response.json({ addon, credit_added: creditToAdd, new_balance: creditToAdd });
      }
    }

    // ── Tier confirmation (monthly subscription) ──
    const tier = session.metadata?.tier;
    const config = TIER_CONFIG[tier];
    if (!config) return Response.json({ error: 'Invalid tier in session' }, { status: 400 });

    const periodEnd = session.expires_at
      ? new Date(session.expires_at * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (subs.length > 0) {
      const sub = subs[0];
      await base44.entities.Subscription.update(sub.id, {
        tier,
        video_minutes_limit: config.minutes,
        video_minutes_used: 0,
        intimacy_package: config.intimacy,
        twin_enabled: config.twin,
        stripe_customer_id: session.customer?.toString() || sub.stripe_customer_id,
        stripe_subscription_id: session.subscription?.toString() || sub.stripe_subscription_id,
        current_period_end: periodEnd,
        processed_session_ids: [...(sub.processed_session_ids || []), session_id],
      });
    } else {
      await base44.entities.Subscription.create({
        tier,
        video_minutes_limit: config.minutes,
        video_minutes_used: 0,
        intimacy_package: config.intimacy,
        twin_enabled: config.twin,
        stripe_customer_id: session.customer?.toString() || null,
        stripe_subscription_id: session.subscription?.toString() || null,
        current_period_end: periodEnd,
        processed_session_ids: [session_id],
      });
    }

    // Send welcome email after successful tier upgrade
    try {
      await base44.functions.invoke('sendWelcomeEmail', {
        to_email: user.email,
        to_name: user.full_name || '',
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
    }

    return Response.json({ tier, minutes: config.minutes, intimacy: config.intimacy });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});