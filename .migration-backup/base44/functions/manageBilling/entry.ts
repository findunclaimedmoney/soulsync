import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    const sub = subs[0];

    if (!sub || !sub.stripe_customer_id) {
      return Response.json({ error: 'No active billing account found' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
    const origin = req.headers.get('origin') || 'https://glimr.com.au';

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/pricing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});