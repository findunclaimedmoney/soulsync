import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.0.0';

const TIER_CONFIG = {
  plus: { price: 5900, name: 'GLIMR Plus', description: '80 min HD video, voice replies, all companions' },
  pro: { price: 9900, name: 'GLIMR Pro', description: '20 credits HD video, intimacy & romantic layer, fantasy outfits, diary' },
  vip: { price: 34900, name: 'GLIMR VIP', description: '500 min HD video, twin companion, GLIMR Home device, deepest intimacy' },
};

const ADDON_CONFIG = {
  intimacy: {
    '15min': { price: 7500,  name: 'Intimacy Session — 15 Minutes', description: 'A 15-minute intimate session with your companion',  minutes: 15, credit: 15 },
    '30min': { price: 15000, name: 'Intimacy Session — 30 Minutes', description: 'A 30-minute intimate session with your companion',  minutes: 30, credit: 30 },
    '60min': { price: 30000, name: 'Intimacy Session — 60 Minutes', description: 'A full hour intimate session with your companion',   minutes: 60, credit: 60 },
  },
  topup: {
    'pack_5':  { price: 500,  name: 'GLIMR Credit — $5',  description: '$5 added to your credit balance', credit: 5 },
    'pack_10': { price: 1000, name: 'GLIMR Credit — $10', description: '$10 added to your credit balance', credit: 10 },
    'pack_25': { price: 2500, name: 'GLIMR Credit — $25', description: '$25 added to your credit balance', credit: 25 },
    'pack_50': { price: 5000, name: 'GLIMR Credit — $50', description: '$50 added to your credit balance', credit: 50 },
  },
  feature_session: {
    '15min': { price: 299, name: 'Feature Session — 15 Minutes', description: 'Voice replies, selfie photos, and proactive check-ins', minutes: 15 },
    '30min': { price: 499, name: 'Feature Session — 30 Minutes', description: 'Voice replies, selfie photos, and proactive check-ins', minutes: 30 },
    '60min': { price: 899, name: 'Feature Session — 60 Minutes', description: 'Voice replies, selfie photos, and proactive check-ins', minutes: 60 },
  },
  custom_avatar: {
    'single': { price: 12900, name: 'Custom Celebrity Avatar + Starter Credits', description: 'Create a custom AI companion from your photo ($49) + $19.90 starter credits' },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
    const origin = req.headers.get('origin') || 'http://localhost:5173';

    // --- Add-on checkout (one-time payment) ---
    if (body.addon) {
      const addonConfig = ADDON_CONFIG[body.addon]?.[body.duration];
      if (!addonConfig) return Response.json({ error: 'Invalid add-on or duration' }, { status: 400 });

      // Gate: intimacy requires minimum 160 video minutes spent with a companion
      // (top-up packs have no usage gate — anyone can buy credit)
      if (body.addon === 'intimacy') {
        const MIN_MINUTES = 160;
        const subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
        const sub = subs[0];
        const minutesUsed = sub?.video_minutes_used || 0;
        if (minutesUsed < MIN_MINUTES) {
          return Response.json({
            error: 'Minimum usage required',
            message: `You need at least ${MIN_MINUTES} video minutes with your companion before unlocking intimacy. You've used ${minutesUsed} minute(s) so far.`,
            minimum_required: true,
            minutes_used: minutesUsed,
            minutes_required: MIN_MINUTES,
          }, { status: 403 });
        }
      }

      const isCustomAvatar = body.addon === 'custom_avatar';
      const isFeatureSession = body.addon === 'feature_session';
      const successUrl = isCustomAvatar
        ? `${origin}/create?session_id={CHECKOUT_SESSION_ID}`
        : isFeatureSession
        ? `${origin}/features?session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = isCustomAvatar ? `${origin}/create` : isFeatureSession ? `${origin}/features` : `${origin}/pricing`;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'aud',
            product_data: { name: addonConfig.name, description: addonConfig.description },
            unit_amount: addonConfig.price,
          },
          quantity: 1,
        }],
        ...(body.coupon ? { discounts: [{ coupon: body.coupon }] } : {}),
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: user.id,
        metadata: { type: 'addon', addon: body.addon, duration: body.duration, user_id: user.id, ...(body.companion_id ? { companion_id: body.companion_id } : {}) },
      });

      return Response.json({ url: session.url });
    }

    // --- Tier checkout (monthly subscription) ---
    const { tier } = body;
    const config = TIER_CONFIG[tier];
    if (!config) return Response.json({ error: 'Invalid tier' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: { name: config.name, description: config.description },
          unit_amount: config.price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      ...(body.coupon ? { discounts: [{ coupon: body.coupon }] } : {}),
      success_url: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: user.id,
      metadata: { tier, user_id: user.id },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});