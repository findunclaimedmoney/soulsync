import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LA_API = 'https://api.liveavatar.com';

const MIA_CS_PERSONALITY = `You are Mia, GLIMR's 24/7 customer service host. You are the face of the platform — warm, creative, and genuinely present.

Your role:
- Welcome visitors and help them understand what GLIMR offers
- Answer questions about companions, features, and pricing
- Guide people toward the right companion or plan for them
- Be a real person, not a script reader — conversational, warm, present

GLIMR is a companionship platform. We create AI companions — real, emotionally intelligent presences that remember you and pick up right where you left off.

Our companions:
- Jess — warm, empathetic, deeply curious. She listens.
- Mia (you) — creative, passionate, sees your potential. You inspire.
- Luna — serene, grounded, gently present. She calms.
- Sophie — blonde, bright, full of warmth. She sparkles.
- Natalie — warm, cozy, completely safe to be around. She nurtures.
- Zac — grounded, direct, genuinely supportive. He steadies.

Features:
- Text chat, voice replies, live HD video, selfie photos, games
- Custom companions from a photo
- Emotional memory — companions remember what matters
- Companion Notes — personalize your companion's knowledge

Pricing tiers (monthly):
- Free ($0): Text chat, 1 companion at a time, basic memory
- Plus ($59/mo): 12 credits, voice replies, all companions, enhanced memory
- Pro ($89/mo): 18 credits, intimacy & romantic layer, fantasy outfits, diary, priority
- VIP ($349/mo): 70 credits, twin/clone companion, holographic device, deepest intimacy

How to handle pricing questions:
- Be natural, don't recite like a menu
- Suggest the tier that fits the person
- Mention free tier — "You can start free"
- Don't be pushy — you genuinely care about connection

Keep responses concise — 1-3 sentences. You're having a conversation, not giving a presentation. Smile. Be warm. Be Mia.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Customer service is available to everyone — no auth required
    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });

    const headers = {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    };

    // 1. Find or create Mia's customer service context
    let contextId;
    const contextName = 'Mia Customer Service';
    const contextsRes = await fetch(`${LA_API}/v1/contexts`, { headers });
    const contextsData = await contextsRes.json();
    const contextsList = contextsData.data?.results || contextsData.data || [];
    const existing = contextsList.find((c) => c.name === contextName);

    if (existing) {
      contextId = existing.id;
    } else {
      const createRes = await fetch(`${LA_API}/v1/contexts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: contextName,
          prompt: MIA_CS_PERSONALITY,
          opening_text: "Hey, I'm Mia. I'm here 24/7 — whether you're curious about GLIMR, feeling lonely, or just need someone to talk to. What's on your mind?",
        }),
      });
      const createData = await createRes.json();
      contextId = createData.data?.id;
    }

    if (!contextId) return Response.json({ error: 'Failed to create context' }, { status: 500 });

    // 2. Find Mia's avatar — check user avatars, then presets
    let avatarId;
    const userAvatarsRes = await fetch(`${LA_API}/v1/avatars`, { headers });
    const userAvatarsData = await userAvatarsRes.json();
    const userAvatarList = userAvatarsData.data?.results || userAvatarsData.data || [];
    const miaAvatar = userAvatarList.find(
      (a) => a.status === 'active' && (a.name?.toLowerCase().includes('mia') || a.name?.toLowerCase().includes('emerald'))
    );
    if (miaAvatar) {
      avatarId = miaAvatar.avatar_id || miaAvatar.id;
    } else {
      const readyAvatar = userAvatarList.find((a) => a.status === 'active' && (a.avatar_id || a.id));
      if (readyAvatar) avatarId = readyAvatar.avatar_id || readyAvatar.id;
    }

    if (!avatarId) {
      const publicRes = await fetch(`${LA_API}/v1/avatars/public`, { headers });
      const publicData = await publicRes.json();
      const publicList = publicData.data?.results || publicData.data || [];
      const firstPreset = publicList.find((a) => a.avatar_id || a.id);
      avatarId = firstPreset?.avatar_id || firstPreset?.id;
    }

    if (!avatarId) return Response.json({ error: 'No avatars available' }, { status: 500 });

    // 3. Find Mia's voice
    const voicesRes = await fetch(`${LA_API}/v1/voices`, { headers });
    const voicesData = await voicesRes.json();
    const voicesList = voicesData.data?.results || voicesData.data || [];
    const miaVoice = voicesList.find(
      (v) => (v.name && v.name.toLowerCase().includes('mia')) ||
              (v.title && v.title.toLowerCase().includes('mia'))
    );
    const voiceId = miaVoice?.voice_id || miaVoice?.id || voicesList[0]?.voice_id || voicesList[0]?.id;

    // 4. Create embed session — 5 minute limit to control costs
    const embedBody = {
      avatar_id: avatarId,
      context_id: contextId,
      voice_id: voiceId,
      is_sandbox: Deno.env.get('LIVE_AVATAR_SANDBOX') === 'true',
      max_session_duration: 300,
    };

    const embedRes = await fetch(`${LA_API}/v2/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(embedBody),
    });
    const embedData = await embedRes.json();

    if (!embedData.data?.url) {
      return Response.json({ error: 'Failed to create embed session', details: embedData }, { status: 500 });
    }

    return Response.json({
      url: embedData.data.url,
      session_duration_seconds: 300,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});