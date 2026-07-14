import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { text } = body;

    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });
    if (text.length > 500) return Response.json({ error: 'Text too long (max 500 chars)' }, { status: 400 });

    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID');
    if (!voiceId) return Response.json({ error: 'ElevenLabs voice ID not configured' }, { status: 500 });

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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