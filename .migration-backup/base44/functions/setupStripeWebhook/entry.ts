import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    const keyPrefix = stripeKey ? stripeKey.substring(0, 8) : 'NOT SET';
    const isLiveKey = stripeKey ? stripeKey.startsWith('sk_live_') : false;
    const isTestKey = stripeKey ? stripeKey.startsWith('sk_test_') : false;

    // Get account details
    const acctRes = await fetch('https://api.stripe.com/v1/account', {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    const acct = await acctRes.json();

    return Response.json({
      key_prefix: keyPrefix,
      is_live_key: isLiveKey,
      is_test_key: isTestKey,
      mode: isLiveKey ? 'LIVE' : isTestKey ? 'TEST' : 'UNKNOWN',
      account: {
        id: acct.id,
        business_name: acct.business_name?.name || acct.settings?.dashboard?.display_name,
        email: acct.email,
        country: acct.country,
        default_currency: acct.default_currency,
        charges_enabled: acct.charges_enabled,
        payouts_enabled: acct.payouts_enabled,
        details_submitted: acct.details_submitted,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});