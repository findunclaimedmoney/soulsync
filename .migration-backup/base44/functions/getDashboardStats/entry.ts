import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const allSubs = await base44.asServiceRole.entities.Subscription.filter({}, '-created_date', 500);

    // Tier counts
    const tierCounts = { free: 0, plus: 0, pro: 0, vip: 0 };
    const intimacyCount = { free: 0, plus: 0, pro: 0, vip: 0 };
    const twinCount = { free: 0, plus: 0, pro: 0, vip: 0 };
    let totalMinutesUsed = 0;
    let totalMinutesLimit = 0;

    for (const sub of allSubs) {
      const tier = tierCounts.hasOwnProperty(sub.tier) ? sub.tier : 'free';
      tierCounts[tier]++;
      if (sub.intimacy_package) intimacyCount[tier]++;
      if (sub.twin_enabled) twinCount[tier]++;
      totalMinutesUsed += sub.video_minutes_used || 0;
      totalMinutesLimit += sub.video_minutes_limit || 0;
    }

    const paidSubs = allSubs.filter(s => s.tier && s.tier !== 'free');
    const intimacySubs = allSubs.filter(s => s.intimacy_package);

    // Growth: group by day for last 14 days
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const growthData = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = now - i * dayMs;
      const date = new Date(dayStart);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const subsOnDay = allSubs.filter(s => {
        if (!s.created_date) return false;
        return new Date(s.created_date).toISOString().slice(0, 10) === dateStr;
      });

      growthData.push({
        date: dayLabel,
        new_signups: subsOnDay.length,
        total_paid: allSubs.filter(s => s.tier !== 'free' && s.created_date && new Date(s.created_date).getTime() <= dayStart).length,
      });
    }

    // Usage per tier
    const usageByTier = {};
    for (const tier of ['plus', 'pro', 'vip']) {
      const tierSubs = allSubs.filter(s => s.tier === tier);
      const used = tierSubs.reduce((sum, s) => sum + (s.video_minutes_used || 0), 0);
      const limit = tierSubs.reduce((sum, s) => sum + (s.video_minutes_limit || 0), 0);
      usageByTier[tier] = {
        users: tierSubs.length,
        minutes_used: Math.round(used),
        minutes_limit: limit,
        avg_usage: tierSubs.length > 0 ? Math.round(used / tierSubs.length) : 0,
        intimacy_count: tierSubs.filter(s => s.intimacy_package).length,
      };
    }

    // Session cost tracking
    const sessionLogs = await base44.asServiceRole.entities.SessionLog.filter({}, '-created_date', 500);
    let totalAnamCost = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    const sessionBreakdown = { 15: { count: 0, cost: 0, revenue: 0, profit: 0 }, 30: { count: 0, cost: 0, revenue: 0, profit: 0 }, 60: { count: 0, cost: 0, revenue: 0, profit: 0 } };

    for (const log of sessionLogs) {
      totalAnamCost += log.anam_cost || 0;
      totalRevenue += log.revenue || 0;
      totalProfit += log.profit || 0;
      const dur = log.duration_minutes;
      if (sessionBreakdown[dur]) {
        sessionBreakdown[dur].count++;
        sessionBreakdown[dur].cost += log.anam_cost || 0;
        sessionBreakdown[dur].revenue += log.revenue || 0;
        sessionBreakdown[dur].profit += log.profit || 0;
      }
    }

    // Credit balance totals across all users
    const totalCreditBalance = allSubs.reduce((sum, s) => sum + (s.credit_balance || 0), 0);
    const totalCreditsUsed = allSubs.reduce((sum, s) => sum + (s.credits_used || 0), 0);

    return Response.json({
      totals: {
        total_users: allSubs.length,
        paid_users: paidSubs.length,
        free_users: tierCounts.free,
        intimacy_users: intimacySubs.length,
        twin_users: allSubs.filter(s => s.twin_enabled).length,
      },
      credit_stats: {
        total_balance: parseFloat(totalCreditBalance.toFixed(2)),
        total_used: parseFloat(totalCreditsUsed.toFixed(2)),
        users_with_credits: allSubs.filter(s => (s.credit_balance || 0) > 0).length,
      },
      tier_counts: tierCounts,
      intimacy_by_tier: intimacyCount,
      twin_by_tier: twinCount,
      usage_by_tier: usageByTier,
      growth: growthData,
      total_minutes_used: Math.round(totalMinutesUsed),
      total_minutes_allocated: totalMinutesLimit,
      cost_tracking: {
        total_sessions: sessionLogs.length,
        total_anam_cost: parseFloat(totalAnamCost.toFixed(2)),
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_profit: parseFloat(totalProfit.toFixed(2)),
        breakdown: sessionBreakdown,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});