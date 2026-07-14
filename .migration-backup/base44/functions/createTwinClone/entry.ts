import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LA_API = 'https://api.liveavatar.com';

// Twin clone packages — price includes creation cost + GLIMR's margin
// 1 credit = $5 USD
const TWIN_PACKAGES = {
  3: { credits: 15, usd: 75 },
  6: { credits: 25, usd: 125 },
  12: { credits: 40, usd: 200 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url, package_months } = body;

    // Validate package
    if (!TWIN_PACKAGES[package_months]) {
      return Response.json({ error: 'Invalid package. Choose 3, 6, or 12 months.' }, { status: 400 });
    }

    if (!image_url) {
      return Response.json({ error: 'Please upload a photo for your twin.' }, { status: 400 });
    }

    // Find the companion profile
    const companions = await base44.entities.HumanCompanion.filter({ created_by_id: user.id });
    if (!companions || companions.length === 0) {
      return Response.json({ error: 'No companion profile found.' }, { status: 404 });
    }
    const companion = companions[0];

    // Check for existing active twin
    const existingTwins = await base44.entities.TwinClone.filter({
      companion_id: companion.id,
      status: { $in: ['pending', 'active'] }
    });
    if (existingTwins && existingTwins.length > 0) {
      return Response.json({ error: 'You already have an active or pending twin. Manage it from your dashboard.' }, { status: 409 });
    }

    const pkg = TWIN_PACKAGES[package_months];

    // Check and deduct credits
    const subs = await base44.asServiceRole.entities.Subscription.filter({
      $or: [
        { owner_user_id: user.id },
        { created_by_id: user.id }
      ]
    });
    const subscription = subs && subs.length > 0 ? subs[0] : null;

    if (subscription) {
      const balance = subscription.credit_balance || 0;
      if (balance < pkg.credits) {
        return Response.json({
          error: `You need ${pkg.credits} credits ($${pkg.usd}) for the ${package_months}-month twin package. You have ${balance} credit${balance === 1 ? '' : 's'}. Top up on the Pricing page.`
        }, { status: 402 });
      }
      await base44.asServiceRole.entities.Subscription.update(subscription.id, {
        credit_balance: balance - pkg.credits
      });
    }

    // Create the twin record
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + package_months);

    const twin = await base44.entities.TwinClone.create({
      companion_id: companion.id,
      companion_name: companion.display_name,
      image_url,
      package_months,
      credits_charged: pkg.credits,
      usd_value: pkg.usd,
      revenue_share_percent: 20,
      activated_date: now.toISOString(),
      expires_date: expires.toISOString(),
      status: 'pending',
      avatar_status: 'processing'
    });

    // Submit to LiveAvatar API for avatar creation
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (apiKey) {
      try {
        const createRes = await fetch(`${LA_API}/v1/avatars`, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'IMAGE',
            name: `${companion.display_name} - Twin`,
            image_url,
          }),
        });
        const createData = await createRes.json();
        const avatarId = createData.data?.id || createData.data?.avatar_id;
        if (avatarId) {
          await base44.entities.TwinClone.update(twin.id, {
            avatar_id: avatarId
          });
        }
      } catch (e) {
        // Best-effort — twin record created, avatar can be linked later via check action
      }
    }

    return Response.json({
      success: true,
      message: `Twin clone created! ${pkg.credits} credits deducted. Your twin avatar is processing — it'll be live within 24 hours. GLIMR takes 20% of twin session revenue.`,
      twin_id: twin.id,
      package_months,
      expires_date: expires.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});