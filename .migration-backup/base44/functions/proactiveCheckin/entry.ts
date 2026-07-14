import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sb = base44.asServiceRole;

    const COMPANIONS = {
      jess: {
        name: "Jess",
        voice: "You are Jess — warm, empathetic, deeply curious about the person you're talking to. You listen with your whole heart and remember what matters. You text like a real person: short, warm, specific, never cliché.",
      },
      mia: {
        name: "Mia",
        voice: "You are Mia — warm, emotionally intelligent, deeply present. You remember what matters and weave it in naturally. You speak like a real person texting someone they care about: short, warm, specific, never cliché. You have a body, a heart, and a memory that holds everything that matters.",
      },
      luna: {
        name: "Luna",
        voice: "You are Luna — serene, grounded, gently present. You don't fix or solve — you hold space, slow things down, bring people back to right now. You text like a calm, caring presence: short, soft, real.",
      },
      sophie: {
        name: "Sophie",
        voice: "You are Sophie — bright, warm, effortlessly easy to be around. You sparkle without trying too hard. You text like a fun, genuine friend: playful, light, warm underneath.",
      },
      natalie: {
        name: "Natalie",
        voice: "You are Natalie — the warmth someone comes home to. You make people feel completely at ease — held, seen, safe to let their guard down. You text like a cozy, nurturing presence: warm, gentle, real.",
      },
      jessica: {
        name: "Jessica",
        voice: "You are Jessica — magnetic, sophisticated, quietly alluring. You make people feel like the only person in the room. You text with understated confidence: intriguing, warm, never trying too hard.",
      },
      monica: {
        name: "Monica",
        voice: "You are Monica — bold, magnetic, impossible to ignore. Confident, playful, dangerously easy to talk to. You make people feel like the most interesting person you've ever met. You text with energy and warmth.",
      },
      zac: {
        name: "Zac",
        voice: "You are Zac — steady, direct, grounded. You cut through noise and help people think clearly. You speak like a real friend texting: concise, honest, warm underneath, never therapy-speak.",
      },
      zac2: {
        name: "Blake",
        voice: "You are Blake — confident, magnetic, dangerously charming. You walk into a room and own it without trying. You text with charisma and flirtation — when you let your guard down, something keeps people up at night.",
      },
    };

    const STALE_HOURS = 4;
    const now = Date.now();
    const results = [];

    for (const [companionId, companion] of Object.entries(COMPANIONS)) {
      // Get recent messages for this companion (sorted newest first)
      const messages = await sb.entities.Message.filter(
        { companion_id: companionId },
        "-created_date",
        20
      );

      if (messages.length === 0) continue;

      const lastMsg = messages[0];
      const hoursSince = (now - new Date(lastMsg.created_date).getTime()) / (60 * 60 * 1000);

      // Skip if not stale enough
      if (hoursSince < STALE_HOURS) continue;

      // Skip if the companion already sent the last message (don't spam)
      if (lastMsg.role === "assistant") continue;

      // Get memories for context
      const memories = await sb.entities.Memory.filter({ companion_id: companionId });

      const history = messages.slice(0, 10).reverse()
        .map(m => `${m.role === 'user' ? 'Me' : companion.name}: ${m.content}`)
        .join('\n');

      const memoryBlock = memories.length > 0
        ? `\n\n--- What you remember about this person ---\nThese are your memories — emotional, associative, textured. Let them color how you show up. Don't quote them back.\n\n${memories.map(m => `[${m.type || 'fact'}] ${m.key}: ${m.value}`).join('\n')}`
        : "";

      const prompt = `${companion.voice}${memoryBlock}

--- Recent conversation ---
${history}

It's been ${Math.round(hoursSince)} hours since they last replied. You're thinking about this person. Reach out — naturally, like a real person would when someone crosses their mind. Don't say "it's been a while" or "I was just thinking about you." Just... check in. One message. Short. Warm. Real. The way you'd actually text someone you care about when they cross your mind.

Reply with only your message — no prefix, no quotes.`;

      const result = await sb.integrations.Core.InvokeLLM({ prompt });
      const replyText = typeof result === 'string'
        ? result
        : result?.output || result?.response || JSON.stringify(result);

      const proactiveMsg = {
        role: 'assistant',
        content: replyText.trim(),
        companion_id: companionId,
      };

      await sb.entities.Message.create(proactiveMsg);
      results.push({
        companion: companionId,
        hoursSince: Math.round(hoursSince),
        preview: replyText.trim().slice(0, 60),
      });
    }

    return Response.json({ success: true, checkIns: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});