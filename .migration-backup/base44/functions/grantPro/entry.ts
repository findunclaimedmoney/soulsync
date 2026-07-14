import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_CONFIG = {
  plus: { minutes: 80, intimacy: false, twin: false },
  pro: { minutes: 160, intimacy: true, twin: false },
  vip: { minutes: 500, intimacy: true, twin: true },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const { tier, target_user_id } = await req.json();
    const cfg = TIER_CONFIG[tier];
    if (!cfg) return Response.json({ error: 'Invalid tier' }, { status: 400 });

    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    const payload = {
      tier,
      video_minutes_limit: cfg.minutes,
      video_minutes_used: 0,
      intimacy_package: cfg.intimacy,
      twin_enabled: cfg.twin,
      current_period_end: periodEnd,
      monthly_credits: tier === 'plus' ? 12 : tier === 'pro' ? 18 : tier === 'vip' ? 70 : 0,
      credits_used: 0,
      credit_balance: tier === 'plus' ? 12 : tier === 'pro' ? 18 : tier === 'vip' ? 70 : 0,
    };

    // Use service role so we can grant to a specific user (manual payments, admin overrides)
    const targetId = target_user_id || user.id;
    const existing = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: targetId });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(existing[0].id, { ...payload, owner_user_id: targetId });
    } else {
      await base44.asServiceRole.entities.Subscription.create({ ...payload, owner_user_id: targetId });
    }

    return Response.json({ success: true, tier, target_user_id: targetId, ...cfg });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});