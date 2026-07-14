import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { COMPANIONS } from "@/lib/companions";

const GREETING_STALE_HOURS = 6;

function needsGreeting(messages) {
  if (messages.length === 0) return true;
  const last = messages[messages.length - 1];
  if (last.role === "user") return true;
  const hoursSince =
    (Date.now() - new Date(last.created_date).getTime()) / (1000 * 60 * 60);
  return hoursSince >= GREETING_STALE_HOURS;
}

function buildGreetingPrompt(companion, messages, memories) {
  const history = messages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Me" : companion.name}: ${m.content}`)
    .join("\n");

  const memoryBlock =
    memories.length > 0
      ? `\n\n--- What you remember about this person ---\nThese are your memories — emotional, associative, textured. Let them color how you show up. Don't quote them back. Let them live in the quality of your attention.\n\n${memories
          .map((m) => `[${m.type || "fact"}] ${m.key}: ${m.value}`)
          .join("\n")}`
      : "";

  const isNew = messages.length === 0;

  return `${companion.personality}${memoryBlock}

${isNew
    ? `This is your first time meeting this person. They just arrived. Greet them warmly — naturally, the way you actually would when someone walks in and you're genuinely glad to see them. One short message. No "how can I help you" — just a real hello that reflects who you are.`
    : `--- Recent conversation ---\n${history}\n\nThis person just came back. They're here. Welcome them the way you actually would when someone you care about walks back in — naturally, with warmth, without making a thing of it. One short message. Don't say "welcome back" literally. Just be glad they're here.`
}

Respond as ${companion.name}. Reply with only your message — no prefix, no quotes.`;
}

export function useGreetings() {
  const [greetings, setGreetings] = useState({});
  const [loading, setLoading] = useState(true);

  const loadGreetings = useCallback(async () => {
    let authed;
    try {
      authed = await base44.auth.isAuthenticated();
    } catch {
      authed = false;
    }
    if (!authed) {
      setLoading(false);
      return;
    }

    const results = {};
    await Promise.all(
      COMPANIONS.map(async (companion) => {
        try {
          const [msgs, mems] = await Promise.all([
            base44.entities.Message.filter(
              { companion_id: companion.id },
              "-created_date",
              10
            ),
            base44.entities.Memory.filter({ companion_id: companion.id }),
          ]);
          const messages = [...msgs].reverse();

          if (needsGreeting(messages)) {
            const result = await base44.integrations.Core.InvokeLLM({
              prompt: buildGreetingPrompt(companion, messages, mems),
            });
            const text =
              typeof result === "string"
                ? result
                : result?.output || result?.response || JSON.stringify(result);
            const greetingText = text.trim();
            await base44.entities.Message.create({
              role: "assistant",
              content: greetingText,
              companion_id: companion.id,
            });
            results[companion.id] = greetingText;
          } else {
            const lastAssistant = [...messages]
              .reverse()
              .find((m) => m.role === "assistant");
            results[companion.id] = lastAssistant?.content || null;
          }
        } catch (err) {
          console.error(`Greeting for ${companion.id} failed:`, err);
        }
      })
    );
    setGreetings(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGreetings();
  }, [loadGreetings]);

  return { greetings, loading, refresh: loadGreetings };
}