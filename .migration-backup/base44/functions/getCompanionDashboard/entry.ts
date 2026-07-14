import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find this user's companion profile
    const profiles = await base44.asServiceRole.entities.HumanCompanion.filter({
      created_by_id: user.id,
    });
    if (!profiles || profiles.length === 0) {
      return Response.json({ hasProfile: false });
    }
    const companion = profiles[0];

    // Fetch all referrals made with this companion's code
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referrer_code: companion.referral_code,
    });

    // Fetch all earnings for this companion
    const earnings = await base44.asServiceRole.entities.CompanionEarning.filter({
      companion_profile_id: companion.id,
    });

    // Sort by created_date descending
    const sortedReferrals = referrals.sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );
    const sortedEarnings = earnings.sort(
      (a, b) => new Date(b.created_date) - new Date(a.created_date)
    );

    // Calculate summary totals
    const nonPayoutEarnings = sortedEarnings.filter((e) => e.earning_type !== 'payout');
    const totalEarnings = nonPayoutEarnings.reduce((s, e) => s + (e.amount_usd || 0), 0);
    const pendingPayout = nonPayoutEarnings
      .filter((e) => e.status === 'pending')
      .reduce((s, e) => s + (e.amount_usd || 0), 0);
    const availablePayout = nonPayoutEarnings
      .filter((e) => e.status === 'available')
      .reduce((s, e) => s + (e.amount_usd || 0), 0);
    const paidOut = sortedEarnings
      .filter((e) => e.earning_type === 'payout')
      .reduce((s, e) => s + (e.amount_usd || 0), 0);
    const referralEarnings = sortedEarnings
      .filter((e) => e.earning_type === 'affiliate_commission')
      .reduce((s, e) => s + (e.amount_usd || 0), 0);
    const sessionEarnings = sortedEarnings
      .filter((e) => e.earning_type === 'session')
      .reduce((s, e) => s + (e.amount_usd || 0), 0);

    const activeReferrals = referrals.filter(
      (r) => r.status === 'active' || r.status === 'converted'
    ).length;

    return Response.json({
      hasProfile: true,
      companion,
      referrals: sortedReferrals,
      earnings: sortedEarnings.slice(0, 50),
      summary: {
        totalEarnings: +totalEarnings.toFixed(2),
        pendingPayout: +pendingPayout.toFixed(2),
        availablePayout: +availablePayout.toFixed(2),
        paidOut: +paidOut.toFixed(2),
        referralEarnings: +referralEarnings.toFixed(2),
        sessionEarnings: +sessionEarnings.toFixed(2),
        totalReferrals: referrals.length,
        activeReferrals,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});