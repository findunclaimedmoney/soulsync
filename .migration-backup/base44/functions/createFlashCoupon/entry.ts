import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    let coupon;
    try {
      coupon = await stripe.coupons.retrieve('FLASH50');
    } catch (e) {
      coupon = await stripe.coupons.create({
        id: 'FLASH50',
        percent_off: 50,
        duration: 'once',
        redeem_by: Math.floor(endOfDay.getTime() / 1000),
        max_redemptions: 100,
        name: 'Flash Sale 50% Off - Today Only',
      });
    }

    return Response.json({
      success: true,
      coupon_id: coupon.id,
      percent_off: coupon.percent_off,
      redeem_by: coupon.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});