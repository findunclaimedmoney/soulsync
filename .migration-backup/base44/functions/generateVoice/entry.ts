import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Map companion IDs to specific ElevenLabs voice IDs (British/Australian accents only)
const ELEVENLABS_VOICE_MAP = {
  zac: 'onwK4e9ZLuTAKqWW03F9',       // Daniel — Deep, British, middle-aged male
  jess: 'ThT5KcBeYPX3keUQqHPh',      // Dorothy — Pleasant, young, British female
  mia: 'Xb7hH8MSUJpSbSDYk0k2',       // Alice — Confident, British female
  luna: 'pFZP5JQG7iQjIQuC4Bku',      // Lily — Raspy, calm, British female
  sophie: 'XB0fDUnXU5powFXDhCwa',    // Charlotte — Warm, English-Swedish female
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { text, companion_id, voice_id } = body;

    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    // Track free voice message usage
    let subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }
    if (subs.length > 0) {
      const sub = subs[0];
      const freeRemaining = (sub.free_voice_messages || 0) - (sub.free_voice_messages_used || 0);
      if (freeRemaining > 0) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          free_voice_messages_used: (sub.free_voice_messages_used || 0) + 1,
        });
      }
    }

    const elevenVoiceId = voice_id || ELEVENLABS_VOICE_MAP[companion_id];
    if (!elevenVoiceId) {
      return Response.json({ error: 'No ElevenLabs voice mapped for this companion' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: 'ElevenLabs API error', details: errorText }, { status: 502 });
    }

    const audioBytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < audioBytes.length; i += chunkSize) {
      binary += String.fromCharCode(...audioBytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    return Response.json({ url: dataUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});