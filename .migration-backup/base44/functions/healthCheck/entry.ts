import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const checks = [];

    // 1. Database
    try {
      await base44.asServiceRole.entities.User.list(1);
      checks.push({ name: 'Database', status: 'ok', message: 'Connected' });
    } catch (e) {
      checks.push({ name: 'Database', status: 'error', message: e.message });
    }

    // 2. Function Runtime — call a lightweight existing function
    // A 401/403 means the function IS alive (correctly enforcing auth) — that's OK.
    try {
      const fnRes = await base44.functions.invoke('getSubscription', {});
      if (fnRes?.data && !fnRes.data?.error) {
        checks.push({ name: 'Function Runtime', status: 'ok', message: 'Functions responding' });
      } else {
        checks.push({ name: 'Function Runtime', status: 'warning', message: 'Function returned unexpected response' });
      }
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('401') || msg.includes('403')) {
        checks.push({ name: 'Function Runtime', status: 'ok', message: 'Functions responding' });
      } else {
        checks.push({ name: 'Function Runtime', status: 'error', message: msg });
      }
    }

    // 3. LiveAvatar API
    try {
      const laKey = Deno.env.get('LIVEAVATAR_API_KEY');
      if (!laKey) {
        checks.push({ name: 'LiveAvatar API', status: 'error', message: 'API key not configured' });
      } else {
        const laRes = await fetch('https://api.liveavatar.com/v1/contexts', {
          headers: { 'X-API-KEY': laKey },
        });
        if (laRes.ok) {
          const sandbox = Deno.env.get('LIVE_AVATAR_SANDBOX') === 'true';
          checks.push({
            name: 'LiveAvatar API',
            status: sandbox ? 'warning' : 'ok',
            message: sandbox ? 'Connected (sandbox mode)' : 'Connected',
          });
        } else {
          checks.push({ name: 'LiveAvatar API', status: 'error', message: `API returned ${laRes.status}` });
        }
      }
    } catch (e) {
      checks.push({ name: 'LiveAvatar API', status: 'error', message: e.message });
    }

    // 4. Stripe
    try {
      const stripeKey = Deno.env.get('STRIPE_API_KEY');
      if (!stripeKey) {
        checks.push({ name: 'Stripe', status: 'error', message: 'API key not configured' });
      } else {
        const stripeRes = await fetch('https://api.stripe.com/v1/balance', {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        if (stripeRes.ok) {
          checks.push({ name: 'Stripe', status: 'ok', message: 'Connected' });
        } else {
          checks.push({ name: 'Stripe', status: 'error', message: `API returned ${stripeRes.status}` });
        }
      }
    } catch (e) {
      checks.push({ name: 'Stripe', status: 'error', message: e.message });
    }

    // 5. Gmail Connector
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('gmail');
      if (conn?.accessToken) {
        checks.push({ name: 'Gmail', status: 'ok', message: 'Connected' });
      } else {
        checks.push({ name: 'Gmail', status: 'warning', message: 'Not connected' });
      }
    } catch (e) {
      checks.push({ name: 'Gmail', status: 'warning', message: 'Not connected' });
    }

    // 6. OpenAI / LLM
    try {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      checks.push({
        name: 'OpenAI (LLM)',
        status: openaiKey ? 'ok' : 'warning',
        message: openaiKey ? 'API key configured' : 'API key not set — chat may fail',
      });
    } catch (e) {
      checks.push({ name: 'OpenAI (LLM)', status: 'warning', message: 'Could not verify' });
    }

    // 7. ElevenLabs (TTS)
    try {
      const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
      checks.push({
        name: 'ElevenLabs (Voice)',
        status: elevenKey ? 'ok' : 'warning',
        message: elevenKey ? 'API key configured' : 'API key not set — voice may fail',
      });
    } catch (e) {
      checks.push({ name: 'ElevenLabs (Voice)', status: 'warning', message: 'Could not verify' });
    }

    const hasError = checks.some((c) => c.status === 'error');
    const hasWarning = checks.some((c) => c.status === 'warning');
    const overall = hasError ? 'error' : hasWarning ? 'warning' : 'ok';

    return Response.json({
      overall,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});