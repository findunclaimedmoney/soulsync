import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ASSET_CONFIG = {
  USDC: { krakenAsset: 'USDC' },
  BTC: { krakenAsset: 'XBT' },
  ETH: { krakenAsset: 'ETH' },
};
const TIER_CONFIG = {
  plus: { minutes: 80, intimacy: false, twin: false },
  pro: { minutes: 160, intimacy: true, twin: false },
  vip: { minutes: 500, intimacy: true, twin: true },
};
const ADDON_PRICES = {
  intimacy: { '15min': 75, '30min': 150, '60min': 300 },
  topup: { 'pack_5': 5, 'pack_10': 10, 'pack_25': 25, 'pack_50': 50 },
};

let _nonceSeq = 0;
async function krakenRequest(path, params, apiKey, apiSecret) {
  _nonceSeq++;
  const nonce = (Date.now() * 1000 + _nonceSeq).toString();
  const body = new URLSearchParams({ nonce, ...params }).toString();
  const sha256buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce + body));
  const pathBytes = new TextEncoder().encode(path);
  const combined = new Uint8Array(pathBytes.length + sha256buf.byteLength);
  combined.set(pathBytes, 0);
  combined.set(new Uint8Array(sha256buf), pathBytes.length);
  const cleanSecret = apiSecret.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const secretB64 = cleanSecret + '='.repeat((4 - (cleanSecret.length % 4)) % 4);
  const keyBytes = Uint8Array.from(atob(secretB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, combined);
  const sigb64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  const res = await fetch('https://api.kraken.com' + path, {
    method: 'POST',
    headers: { 'API-Key': apiKey, 'API-Sign': sigb64, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return res.json();
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

function findMatchingDeposit(deposits, order) {
  return deposits.find((d) => {
    if (d.status !== 'Success') return false;
    const amt = parseFloat(d.amount);
    if (!amt || Math.abs(amt - order.crypto_amount) / order.crypto_amount > 0.005) return false;
    const depTime = new Date(d.time * 1000).getTime();
    const orderTime = new Date(order.created_date).getTime() - 60000;
    return depTime >= orderTime;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = (Deno.env.get('KRAKEN_API_KEY') || '').trim();
    const apiSecret = (Deno.env.get('KRAKEN_PRIVATE_KEY') || '').trim();
    if (!apiKey || !apiSecret) return Response.json({ error: 'Kraken keys not configured' }, { status: 500 });

    const pending = await base44.asServiceRole.entities.CryptoOrder.filter({ status: 'pending' });
    const now = Date.now();

    const assets = [...new Set(pending.map((o) => o.crypto_asset))];
    const depositsByAsset = {};
    for (const asset of assets) {
      const cfg = ASSET_CONFIG[asset];
      const res = await krakenRequest('/0/private/DepositStatus', { asset: cfg.krakenAsset }, apiKey, apiSecret);
      depositsByAsset[asset] = res.result || [];
    }

    let processed = 0;
    for (const order of pending) {
      if (now - new Date(order.created_date).getTime() > 24 * 3600000) {
        await base44.asServiceRole.entities.CryptoOrder.update(order.id, { status: 'expired' });
        continue;
      }
      const deposits = depositsByAsset[order.crypto_asset] || [];
      if (findMatchingDeposit(deposits, order)) {
        await applyBenefit(base44, order);
        await base44.asServiceRole.entities.CryptoOrder.update(order.id, { status: 'paid', paid_date: new Date().toISOString() });
        processed++;
      }
    }

    return Response.json({ processed, checked: pending.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});