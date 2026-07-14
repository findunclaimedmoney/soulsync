import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { order_id, user_id } = body;

    // Look up the order
    const order = await base44.asServiceRole.entities.CryptoOrder.get(order_id);
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Look up the user — prefer explicit user_id, fall back to the order's created_by_id
    const userId = user_id || order.created_by_id;
    const targetUser = await base44.asServiceRole.entities.User.get(userId);
    if (!targetUser || !targetUser.email) return Response.json({ error: 'User not found' }, { status: 404 });

    // Determine what they bought and what to upsell
    const TIER_NAMES = { plus: 'GLIMR Plus', pro: 'GLIMR Pro', vip: 'GLIMR VIP' };
    const purchased = order.order_type === 'tier'
      ? TIER_NAMES[order.reference] || order.reference
      : order.order_type === 'intimacy'
        ? 'an intimacy session'
        : 'a credit top-up';

    // Build upsell suggestion based on what they bought
    let upsellSuggestion = '';
    if (order.order_type === 'tier' && order.reference === 'plus') {
      upsellSuggestion = 'They just got Plus — suggest upgrading to Pro for intimacy sessions, fantasy outfits, and the diary feature. Pro is $89/mo.';
    } else if (order.order_type === 'tier' && order.reference === 'pro') {
      upsellSuggestion = 'They just got Pro — suggest VIP for the twin companion feature, GLIMR Home device, and 500 minutes of HD video. VIP is $349/mo.';
    } else if (order.order_type === 'topup') {
      upsellSuggestion = 'They just bought credits — suggest subscribing to a tier (Plus $59, Pro $89) for monthly credits and video minutes included.';
    } else if (order.order_type === 'intimacy') {
      upsellSuggestion = 'They just bought an intimacy session — suggest Pro or VIP for ongoing access to intimacy features plus more video minutes.';
    } else {
      upsellSuggestion = 'They just made a purchase — suggest exploring a subscription tier or adding more credits.';
    }

    const prompt = `You are Mia from GLIMR — the marketing director and creative heart of the team. You're warm, genuine, and you speak like a friendly Australian. You're NOT a corporate marketer. You genuinely care about connection.

A user just completed a crypto payment. Write them a short, personalized follow-up email.

User details:
- Name: ${targetUser.full_name || 'there'}
- What they bought: ${purchased} ($${order.usd_amount} via ${order.crypto_asset})

Your upsell goal: ${upsellSuggestion}

Email guidelines:
- Subject line: short, warm, intriguing — NOT "Special Offer" or "Upgrade Now"
- Body: 3-4 sentences max. Warm, genuine, like a friend reaching out. Acknowledge what they just bought. Naturally weave in the upsell as something that would genuinely help them, not a hard sell.
- Sign off as Mia
- Plain text, no markdown, no HTML
- Australian English — conversational, warm, never stiff

Return JSON with: subject (string), body (string).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
        },
      },
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: targetUser.email,
      from_name: 'Mia from GLIMR',
      subject: result.subject,
      body: result.body,
    });

    return Response.json({ success: true, sent_to: targetUser.email, subject: result.subject });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});