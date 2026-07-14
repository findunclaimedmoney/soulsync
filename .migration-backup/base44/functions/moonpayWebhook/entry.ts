import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIER_CONFIG = {
  plus: { minutes: 80, intimacy: false, twin: false },
  pro: { minutes: 160, intimacy: true, twin: false },
  vip: { minutes: 500, intimacy: true, twin: true },
};
const ADDON_PRICES = {
  intimacy: { '15min': 4, '30min': 8, '60min': 15 },
  topup: { 'pack_5': 5, 'pack_10': 10, 'pack_25': 25, 'pack_50': 50 },
};

async function verifySignature(body, signatureHeader, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signatureHeader;
}

async function applyBenefit(base44, order) {
  const subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: order.created_by_id });
  if (order.order_type === 'tier') {
    const cfg = TIER_CONFIG[order.reference];
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    const payload = {
      tier: order.reference,
      video_minutes_limit: cfg.minutes,
      video_minutes_used: 0,
      intimacy_package: cfg.intimacy,
      twin_enabled: cfg.twin,
      current_period_end: periodEnd,
    };
    if (subs.length) await base44.asServiceRole.entities.Subscription.update(subs[0].id, payload);
    else await base44.asServiceRole.entities.Subscription.create(payload);
  } else {
    const credit = order.order_type === 'topup' ? order.usd_amount : (ADDON_PRICES[order.order_type]?.[order.reference] || 0);
    if (subs.length) {
      await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
        credit_balance: (subs[0].credit_balance || 0) + credit,
      });
    } else {
      await base44.asServiceRole.entities.Subscription.create({
        tier: 'free', video_minutes_limit: 0, video_minutes_used: 0, credit_balance: credit,
      });
    }
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('Moonpay-Signature-V2') || req.headers.get('X-Moonpay-Signature');
    const webhookSecret = Deno.env.get('MOONPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature || !await verifySignature(body, signature, webhookSecret)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const base44 = createClientFromRequest(req);

    // Only handle transaction updates
    if (event.type !== 'transaction_updated') {
      return Response.json({ received: true, ignored: true });
    }

    const txn = event.data;
    if (!txn || !txn.walletAddress) {
      return Response.json({ received: true, ignored: true });
    }

    // Find the matching crypto order by deposit address
    const orders = await base44.asServiceRole.entities.CryptoOrder.filter({
      deposit_address: txn.walletAddress,
      status: 'pending',
    });

    if (orders.length === 0) {
      return Response.json({ received: true, message: 'No matching pending order' });
    }

    const order = orders[0];

    if (txn.status === 'completed') {
      await applyBenefit(base44, order);
      await base44.asServiceRole.entities.CryptoOrder.update(order.id, {
        status: 'paid',
        paid_date: new Date().toISOString(),
      });

      // Send welcome email for tier purchases
      if (order.order_type === 'tier') {
        try {
          const user = await base44.asServiceRole.entities.User.get(order.created_by_id);
          if (user) {
            await base44.functions.invoke('sendWelcomeEmail', { to_email: user.email, to_name: user.full_name || '' });
          }
        } catch (e) { console.error('Welcome email failed:', e); }
      }
    } else if (txn.status === 'failed' || txn.status === 'cancelled') {
      await base44.asServiceRole.entities.CryptoOrder.update(order.id, { status: 'expired' });
    }

    return Response.json({ received: true, status: txn.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});