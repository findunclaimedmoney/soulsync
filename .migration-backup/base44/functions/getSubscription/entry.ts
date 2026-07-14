import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Free users get 10 messages; paid tiers are unlimited
const MONTHLY_MESSAGE_LIMITS = {
  free: 10,
  plus: 0,
  pro: 0,
  vip: 0,
};

const TIER_MONTHLY_CREDITS = {
  free: 0,
  plus: 12,
  pro: 20,
  vip: 70,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // First try user-scoped (created_by_id matches current user — normal Stripe checkout flow)
    let subs = await base44.entities.Subscription.filter({ created_by_id: user.id });

    // Fallback: admin-granted subscriptions are created by the service role,
    // so created_by_id won't match — check owner_user_id instead
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }

    if (subs.length === 0) {
      return Response.json({
        tier: 'free',
        monthly_credits: TIER_MONTHLY_CREDITS.free,
        credits_used: 0,
        credit_balance: 0,
        video_minutes_used: 0,
        video_minutes_limit: 0,
        intimacy_package: false,
        intimacy_sessions_completed: 0,
        twin_enabled: false,
        remaining: 0,
        messages_used: 0,
        messages_limit: MONTHLY_MESSAGE_LIMITS.free,
        messages_remaining: MONTHLY_MESSAGE_LIMITS.free,
        free_voice_messages: 0,
        free_voice_messages_used: 0,
      });
    }

    const sub = subs[0];
    const used = sub.video_minutes_used || 0;
    const limit = sub.video_minutes_limit || 0;
    const tier = sub.tier || 'free';

    const monthlyUsed = sub.daily_messages_used || 0;
    const monthlyLimit = MONTHLY_MESSAGE_LIMITS[tier] ?? 0;

    return Response.json({
      tier,
      monthly_credits: sub.monthly_credits ?? TIER_MONTHLY_CREDITS[tier] ?? 0,
      credits_used: sub.credits_used || 0,
      credit_balance: sub.credit_balance || 0,
      video_minutes_used: used,
      video_minutes_limit: limit,
      intimacy_package: sub.intimacy_package || false,
      intimacy_sessions_completed: sub.intimacy_sessions_completed || 0,
      twin_enabled: sub.twin_enabled || false,
      remaining: Math.max(0, limit - used),
      messages_used: monthlyUsed,
      messages_limit: monthlyLimit,
      messages_remaining: monthlyLimit > 0 ? Math.max(0, monthlyLimit - monthlyUsed) : -1,
      free_voice_messages: sub.free_voice_messages || 0,
      free_voice_messages_used: sub.free_voice_messages_used || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});