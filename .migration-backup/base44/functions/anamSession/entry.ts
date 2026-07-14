import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ANAM_API = 'https://api.anam.ai/v1';
const ANAM_COST_PER_MIN = 0.12;

// Map companion names to Anam voice IDs (so the video avatar uses the correct gender voice)
const ANAM_VOICE_MAP = {
  zac: '91b4ce0f-4fc0-11f1-84b0-52bacf74fa75', // Male CARTESIA voice
};

// Video session pricing: 1 credit = $5 = 1 minute. 15/30/60 min = $75/$150/$300
const SESSION_PRICES = { 15: 75.00, 30: 150.00, 60: 300.00 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('ANAM_API_KEY');
    if (!apiKey) return Response.json({ error: 'Anam API key not configured' }, { status: 500 });

    const body = await req.json();
    const { companion_name, personality, avatar_id: preferredAvatarId, twin, duration } = body;

    if (!companion_name || !personality) {
      return Response.json({ error: 'companion_name and personality are required' }, { status: 400 });
    }

    // --- Subscription & Intimacy Layer ---
    const subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    const sub = subs[0];

    if (!sub) {
      return Response.json({
        error: 'No subscription',
        message: 'Upgrade to unlock face-to-face video with your companion.',
        upgrade_required: true,
      }, { status: 402 });
    }

    const used = sub.video_minutes_used || 0;
    const limit = sub.video_minutes_limit || 0;

    // Enforce video minute limits for tier-based access
    if (limit > 0 && used >= limit && !body.duration) {
      return Response.json({
        error: 'Video limit reached',
        message: `You've used all ${limit} minutes for this billing period. Upgrade for more.`,
        upgrade_required: true,
      }, { status: 402 });
    }

    let effectivePersonality = personality;
    let sessionMaxDuration = null;
    let intimacyActive = sub.intimacy_package || false;

    // Credit-based intimacy session (10/30/60 min at $4/$8/$15)
    if (!intimacyActive && body.duration) {
      const sessionPrice = SESSION_PRICES[body.duration];
      const balance = sub.credit_balance || 0;

      if (!sessionPrice) {
        return Response.json({
          error: 'Invalid duration',
          message: 'Select a valid session duration (15, 30, or 60 minutes).',
          duration_required: true,
          credit_balance: balance,
        }, { status: 400 });
      }

      if (balance < sessionPrice) {
        return Response.json({
          error: 'Insufficient credit',
          message: `You need A$${sessionPrice.toFixed(2)} for a ${body.duration}-minute session. You have A$${balance.toFixed(2)} in credit.`,
          upgrade_required: true,
          credit_balance: balance,
          session_price: sessionPrice,
        }, { status: 402 });
      }

      intimacyActive = true;
      sessionMaxDuration = body.duration * 60;
      const newBalance = balance - sessionPrice;

      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        credit_balance: newBalance,
        video_minutes_used: used + body.duration,
        intimacy_sessions_completed: (sub.intimacy_sessions_completed || 0) + 1,
      });

      // Create SessionLog for admin cost tracking
      const anamCost = body.duration * ANAM_COST_PER_MIN;
      try {
        await base44.asServiceRole.entities.SessionLog.create({
          duration_minutes: body.duration,
          anam_cost: anamCost,
          revenue: sessionPrice,
          profit: sessionPrice - anamCost,
          companion_name,
          session_type: 'intimacy',
        });
      } catch (e) {
        // Best-effort logging
      }

      // Low balance email notification
      if (newBalance < 75.00) {
        try {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Your GLIMR credit is running low',
            body: `Hi ${user.full_name || 'there'},\n\nYour intimate session with ${companion_name} just started, and your remaining credit balance is A$${newBalance.toFixed(2)}.\n\nThat's not enough for another session. Top up anytime to keep the connection going:\nhttps://glimr.com.au/pricing\n\nWith warmth,\nThe GLIMR Team`,
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

    // --- Create Anam session token ---
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // 1. Find an available avatar — use preferred if provided, else list Anam avatars
    let avatarId = preferredAvatarId;
    let voiceId = null;
    let llmId = null;

    if (!avatarId) {
      // Try listing personas first — they contain avatarId, voiceId, llmId together
      try {
        const personasRes = await fetch(`${ANAM_API}/personas`, { headers });
        const personasData = await personasRes.json();
        const personasList = personasData.data || [];
        const personaName = twin ? `${companion_name} Twin` : companion_name;
        const matchingPersona = personasList.find((p) => p.name === personaName);
        if (matchingPersona) {
          avatarId = matchingPersona.avatarId || matchingPersona.avatar_id;
          voiceId = matchingPersona.voiceId || matchingPersona.voice_id;
          llmId = matchingPersona.llmId || matchingPersona.llm_id;
        }
        // Do NOT fall back to another companion's persona — that would show the wrong face
      } catch (e) {
        // Continue to avatar listing
      }
    }

    // If still no avatar, list avatars directly
    if (!avatarId) {
      const avatarsRes = await fetch(`${ANAM_API}/avatars`, { headers });
      const avatarsData = await avatarsRes.json();
      const avatarsList = avatarsData.data || [];
      const firstAvatar = avatarsList.find((a) => a.id);
      avatarId = firstAvatar?.id;
    }

    if (!avatarId) {
      return Response.json({
        error: 'No avatars available',
        message: 'No Anam avatars found. Create one at lab.anam.ai.'
      }, { status: 500 });
    }

    // If still no llmId, list LLMs and pick first
    if (!llmId) {
      try {
        const llmsRes = await fetch(`${ANAM_API}/llms`, { headers });
        const llmsData = await llmsRes.json();
        const llmsList = llmsData.data || [];
        if (llmsList.length > 0) {
          llmId = llmsList[0].id;
        }
      } catch (e) {
        // LLM may be optional with Anam default
      }
    }

    // Use companion voice map if no voice was resolved from personas
    if (!voiceId && ANAM_VOICE_MAP[companion_name.toLowerCase()]) {
      voiceId = ANAM_VOICE_MAP[companion_name.toLowerCase()];
    }

    // 2. Create session token
    const personaConfig = {
      name: twin ? `${companion_name} Twin` : companion_name,
      avatarId,
      systemPrompt: effectivePersonality,
    };
    if (voiceId) personaConfig.voiceId = voiceId;
    if (llmId) personaConfig.llmId = llmId;

    const tokenBody = { personaConfig };
    if (sessionMaxDuration) {
      tokenBody.sessionOptions = { maxDuration: sessionMaxDuration };
    }

    const tokenRes = await fetch(`${ANAM_API}/auth/session-token`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tokenBody),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.sessionToken) {
      return Response.json({
        error: 'Failed to create Anam session',
        details: tokenData,
      }, { status: 500 });
    }

    // Fetch updated balance after any credit deduction
    const updatedSubs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    const remainingBalance = updatedSubs[0]?.credit_balance ?? 0;

    return Response.json({
      sessionToken: tokenData.sessionToken,
      session_duration_seconds: sessionMaxDuration,
      credit_balance: remainingBalance,
      low_balance_warning: remainingBalance < 6.00,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});