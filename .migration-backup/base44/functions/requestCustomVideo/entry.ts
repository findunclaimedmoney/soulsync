import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { brief } = body;
    if (!brief || !brief.trim()) {
      return Response.json({ error: 'Please describe what you want in your video.' }, { status: 400 });
    }

    // Find the companion profile for this user
    const companions = await base44.entities.HumanCompanion.filter({ created_by_id: user.id });
    if (!companions || companions.length === 0) {
      return Response.json({ error: 'No companion profile found.' }, { status: 404 });
    }
    const companion = companions[0];

    // Find the user's subscription to check/deduct credits
    const subs = await base44.asServiceRole.entities.Subscription.filter({
      $or: [
        { owner_user_id: user.id },
        { created_by_id: user.id }
      ]
    });
    const subscription = subs && subs.length > 0 ? subs[0] : null;

    const CREDIT_COST = 5;
    const USD_VALUE = 25;

    if (subscription) {
      const balance = subscription.credit_balance || 0;
      if (balance < CREDIT_COST) {
        return Response.json({
          error: `You need ${CREDIT_COST} credits ($${USD_VALUE}) for a custom video. You have ${balance} credit${balance === 1 ? '' : 's'}. Top up on the Pricing page.`
        }, { status: 402 });
      }
      // Deduct credits
      await base44.asServiceRole.entities.Subscription.update(subscription.id, {
        credit_balance: balance - CREDIT_COST
      });
    }

    // Create the video request
    const videoRequest = await base44.entities.VideoRequest.create({
      companion_id: companion.id,
      companion_name: companion.display_name,
      request_type: 'premium_custom',
      brief: brief.trim(),
      credits_charged: CREDIT_COST,
      usd_value: USD_VALUE,
      status: 'pending'
    });

    return Response.json({
      success: true,
      message: 'Custom video request submitted! 5 credits deducted. Our team will be in touch.',
      request_id: videoRequest.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});