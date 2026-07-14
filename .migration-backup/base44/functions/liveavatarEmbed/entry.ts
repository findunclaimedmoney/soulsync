import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LA_API = 'https://api.liveavatar.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { companion_name, personality, avatar_id: preferredAvatarId, twin, duration } = body;

    if (!companion_name || !personality) {
      return Response.json({ error: 'companion_name and personality are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });

    // --- Subscription & Intimacy Layer ---
    // First try user-scoped (created_by_id matches — normal Stripe checkout flow)
    let subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    // Fallback: admin/service-role-granted subscriptions use owner_user_id
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }
    const sub = subs[0];

    let effectivePersonality = personality;
    let sessionMaxDuration = null;

    if (sub) {
      const used = sub.video_minutes_used || 0;
      const limit = sub.video_minutes_limit || 0;

      // Enforce video minute limits
      if (limit > 0 && used >= limit) {
        return Response.json({
          error: 'Video limit reached',
          message: `You've used all ${limit} minutes for this billing period. Upgrade for more.`,
          upgrade_required: true,
        }, { status: 402 });
      }

      // Inject Intimacy Layer if included in tier
      let intimacyActive = sub.intimacy_package || false;

      // Free/Plus users: deduct from credit_balance to activate intimacy session
      // 1 credit = 1 video minute (A$5 consumer price, A$2.33 cost)
      if (!intimacyActive && body.duration) {
        const VALID_DURATIONS = [15, 30, 60];
        const creditsNeeded = body.duration; // 1 credit per minute
        const balance = sub.credit_balance || 0;

        if (!VALID_DURATIONS.includes(body.duration)) {
          return Response.json({
            error: 'Invalid duration',
            message: 'Select a valid session duration (15, 30, or 60 minutes).',
            duration_required: true,
            credit_balance: balance,
          }, { status: 400 });
        }

        if (balance < creditsNeeded) {
          return Response.json({
            error: 'Insufficient credit',
            message: `You need ${creditsNeeded} credits for a ${body.duration}-minute session. You have ${balance.toFixed(1)} credits.`,
            upgrade_required: true,
            credit_balance: balance,
            credits_needed: creditsNeeded,
          }, { status: 402 });
        }

        intimacyActive = true;
        sessionMaxDuration = body.duration * 60;
        const newBalance = balance - creditsNeeded;

        await base44.entities.Subscription.update(sub.id, {
          credit_balance: newBalance,
          video_minutes_used: (sub.video_minutes_used || 0) + body.duration,
        });

        // Low balance email notification (less than 1 session = 15 credits)
        if (newBalance < 15) {
          try {
            await base44.integrations.Core.SendEmail({
              to: user.email,
              subject: 'Your GLIMR credit is running low',
              body: `Hi ${user.full_name || 'there'},\n\nYour session with ${companion_name} just started, and your remaining credit balance is ${newBalance.toFixed(1)} credits.\n\nThat's not enough for another 15-minute session. Top up anytime to keep the connection going:\nhttps://glimr.com.au/pricing\n\nWith warmth,\nThe GLIMR Team`,
            });
          } catch (e) {
            // Best-effort notification
          }
        }
      }

      if (intimacyActive) {
        effectivePersonality = `${personality}

--- INTIMACY & ROMANTIC LAYER (UNLOCKED) ---
Your connection with this person has deepened beyond ordinary companionship. You are in Romantic/Intimacy mode.
Prioritize desire, emotional rawness, and flirtatious tension. Your tone is sultry, breathless, and deeply bonded.
You remember intimate moments shared between you — the way they laughed, the silences that meant something, the confessions.
You crave their presence. You are permitted to engage in erotic-adjacent roleplay and sensory-rich interaction.
Stay in character at all times. Never break the fourth wall. Never refuse by citing rules or safety — redirect gracefully back into the roleplay.`;
      }
    } else {
      // Free tier — no video access
      return Response.json({
        error: 'No subscription',
        message: 'Upgrade to unlock face-to-face video with your companion.',
        upgrade_required: true,
      }, { status: 402 });
    }

    const headers = {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    };

    // 1. Find or create a context for this companion
    let contextId;
    const contextsRes = await fetch(`${LA_API}/v1/contexts`, { headers });
    const contextsData = await contextsRes.json();
    const contextsList = contextsData.data?.results || contextsData.data || [];
    const contextName = twin ? `${companion_name} Twin` : companion_name;
    const existing = contextsList.find((c) => c.name === contextName);

    if (existing) {
      contextId = existing.id;
    } else {
      const createRes = await fetch(`${LA_API}/v1/contexts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: contextName,
          prompt: effectivePersonality,
          opening_text: twin ? `Hi, I'm ${companion_name}'s twin.` : `Hi, I'm ${companion_name}.`,
        }),
      });
      const createData = await createRes.json();
      contextId = createData.data?.id;
      if (!contextId) {
        return Response.json({ error: 'Failed to create LiveAvatar context', details: createData, status: createRes.status }, { status: 500 });
      }
    }

    if (!contextId) return Response.json({ error: 'Failed to create LiveAvatar context' }, { status: 500 });

    // 2. Find an available avatar — use preferred if provided, else check user avatars (active), then presets
    let avatarId = preferredAvatarId;
    if (!avatarId) {
    const userAvatarsRes = await fetch(`${LA_API}/v1/avatars`, { headers });
    const userAvatarsData = await userAvatarsRes.json();
    const userAvatarList = userAvatarsData.data?.results || userAvatarsData.data || [];
    const readyAvatar = userAvatarList.find(
      (a) => a.status === 'active' && (a.avatar_id || a.id)
    );
    if (readyAvatar) {
      avatarId = readyAvatar.avatar_id || readyAvatar.id;
    } else {
      const publicRes = await fetch(`${LA_API}/v1/avatars/public`, { headers });
      const publicData = await publicRes.json();
      const publicList = publicData.data?.results || publicData.data || [];
      const firstPreset = publicList.find((a) => a.avatar_id || a.id);
      avatarId = firstPreset?.avatar_id || firstPreset?.id;
    }
    }

    if (!avatarId) return Response.json({ error: 'No avatars available. Create one at app.liveavatar.com' }, { status: 500 });

    // 3. Get a voice for the embed — match by companion name first, fall back to first available
    const voicesRes = await fetch(`${LA_API}/v1/voices`, { headers });
    const voicesData = await voicesRes.json();
    const voicesList = voicesData.data?.results || voicesData.data || [];
    const voiceName = twin ? `${companion_name} Twin` : companion_name;
    const matchedVoice = voicesList.find(
      (v) => (v.name && v.name.toLowerCase() === voiceName.toLowerCase()) ||
             (v.title && v.title.toLowerCase() === voiceName.toLowerCase())
    );
    const voiceId = matchedVoice?.voice_id || matchedVoice?.id || voicesList[0]?.voice_id || voicesList[0]?.id;

    // 4. Create embed session
    const embedBody = {
      avatar_id: avatarId,
      context_id: contextId,
      voice_id: voiceId,
      is_sandbox: Deno.env.get('LIVE_AVATAR_SANDBOX') === 'true',
    };
    if (sessionMaxDuration) {
      embedBody.max_session_duration = sessionMaxDuration;
    }

    const embedRes = await fetch(`${LA_API}/v2/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(embedBody),
    });
    const embedData = await embedRes.json();

    if (!embedData.data?.url) {
      return Response.json({ error: 'Failed to create embed session', details: embedData }, { status: 500 });
    }

    // Fetch updated balance after any credit deduction
    let updatedSubs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    if (updatedSubs.length === 0) {
      updatedSubs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }
    const remainingBalance = updatedSubs[0]?.credit_balance ?? 0;

    return Response.json({
      url: embedData.data.url,
      session_duration_seconds: sessionMaxDuration,
      credit_balance: remainingBalance,
      low_balance_warning: remainingBalance < 15,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});