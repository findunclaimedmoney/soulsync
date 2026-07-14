import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const couponId = body.coupon_id || 'WELCOME50';
    const percentOff = body.percent_off || 50;
    const duration = body.duration || 'forever';
    const maxRedemptions = body.max_redemptions || 0;
    const name = body.name || '50% Off Any Package — Welcome Promo';

    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

    // Try to retrieve existing coupon first
    let coupon;
    try {
      coupon = await stripe.coupons.retrieve(couponId);
      // Already exists
      return Response.json({
        success: true,
        coupon_id: coupon.id,
        percent_off: coupon.percent_off,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        redeem_by: coupon.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
        message: 'Coupon already exists',
      });
    } catch (e) {
      // Doesn't exist — create it
      const couponData = {
        id: couponId,
        percent_off: percentOff,
        duration: duration,
        name: name,
      };
      if (maxRedemptions > 0) couponData.max_redemptions = maxRedemptions;
      coupon = await stripe.coupons.create(couponData);

      return Response.json({
        success: true,
        coupon_id: coupon.id,
        percent_off: coupon.percent_off,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        redeem_by: coupon.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
        message: 'Promo coupon created — 50% off any paid signup package',
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});