import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // Locked companions — their profiles cannot be modified
    const LOCKED_COMPANIONS = ['mia'];
    if (body.companion_id && LOCKED_COMPANIONS.includes(body.companion_id)) {
      return Response.json({ error: 'This companion profile is locked and cannot be modified' }, { status: 403 });
    }

    // Generate personality brain (system prompt) from a description
    if (action === 'generate_brain') {
      const { name, personality_description } = body;
      if (!name || !personality_description) {
        return Response.json({ error: 'name and personality_description are required' }, { status: 400 });
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are creating a character system prompt for an AI companion named ${name}. Based on this description, write a rich, detailed system prompt that defines how ${name} speaks, thinks, and behaves.

Description: ${personality_description}

The system prompt should:
- Be written in second person ("You are ${name}...")
- Define their voice, tone, and mannerisms
- Include their emotional depth and how they connect with people
- Be specific and textured, not generic
- End with: "Never break character. Never mention being an AI. Stay present and real."
- Be 150-300 words

Write only the system prompt, nothing else.`,
      });

      const brain = typeof result === 'string' ? result : result?.output || result?.response || '';
      return Response.json({ brain: brain.trim() });
    }

    // List available ElevenLabs voices
    if (action === 'list_voices') {
      const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
      if (!apiKey) return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });

      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      });
      const data = await response.json();
      const voices = (data.voices || []).map((v) => ({
        id: v.voice_id,
        name: v.name,
        labels: v.labels || {},
      }));
      return Response.json({ voices });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});