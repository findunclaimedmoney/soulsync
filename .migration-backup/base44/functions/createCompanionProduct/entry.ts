import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const body = await req.json();
    const { name, price_usd, companion_id } = body;
    if (!name || !price_usd) return Response.json({ error: 'name and price_usd are required' }, { status: 400 });

    const stripeKey = Deno.env.get('STRIPE_API_KEY');
    if (!stripeKey) return Response.json({ error: 'Stripe API key not configured' }, { status: 500 });

    // Create Stripe product
    const productResp = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name,
        description: `Companion subscription for ${name}`,
      }),
    });
    const product = await productResp.json();
    if (product.error) return Response.json({ error: product.error.message }, { status: 400 });

    // Create recurring monthly price
    const priceResp = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product: product.id,
        unit_amount: String(Math.round(price_usd * 100)),
        currency: 'usd',
        'recurring[interval]': 'month',
      }),
    });
    const price = await priceResp.json();
    if (price.error) return Response.json({ error: price.error.message }, { status: 400 });

    // Update companion config with stripe_price_id
    if (companion_id) {
      const configs = await base44.asServiceRole.entities.CompanionConfig.filter({ companion_id });
      if (configs[0]) {
        await base44.asServiceRole.entities.CompanionConfig.update(configs[0].id, { stripe_price_id: price.id });
      }
    }

    return Response.json({
      success: true,
      product_id: product.id,
      price_id: price.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});