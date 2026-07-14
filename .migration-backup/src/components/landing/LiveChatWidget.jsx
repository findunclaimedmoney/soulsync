import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SOFIA_SYSTEM_PROMPT } from "@/lib/sofiaBrain";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

const MIA_IMAGE =
  "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/352fbed0f_EmeraldElegance.png";

const GREETING =
  "Hey, I'm Mia. I'm here 24/7 — whether you're browsing, feeling lonely, or just need someone to talk to. What's on your mind?";

async function extractMemories(companionId, recentExchange, existingMemories) {
  const existingKeys = existingMemories.map((m) => m.key).join(", ");
  const prompt = `You are the memory system for a companion who remembers like a person — emotionally, associatively, with texture. Your job is to extract what matters from this exchange so the companion can carry it forward.

Read the exchange and extract memories across these types. Prefer depth over quantity — one sharp, textured memory beats five shallow facts.

TYPES OF MEMORY TO CAPTURE:
1. FACT — concrete things the person said: name, job, relationships, places, pets, hobbies, fears, goals.
2. EMOTION — how they felt in this moment. The felt quality, not the label.
3. INTIMACY — things they shared vulnerably, things they trusted the companion with.
4. MOMENT — a specific exchange that mattered — a laugh, a silence, a confession.
5. PATTERN — what you notice about them over time: how they think, what they avoid, what they keep returning to.
6. ARC — how something has changed: how trust has grown, how openness has shifted.
7. SENSORY — the texture of a moment: the time of day it felt like, the rhythm of their messages.

For each memory, include a "type" field matching one of the above. Only extract things that genuinely matter. Skip vague or trivial details. If nothing new is worth saving, return an empty array.

Do NOT re-extract things already covered by these existing memory keys: ${existingKeys || "none yet"}. If an existing memory should be UPDATED with new information, include it with the same key and a richer value.

For the "value" field: be specific and emotionally textured. Capture the human truth, not a summary.

Return JSON like:
{ "memories": [ { "key": "short_label", "type": "emotion", "value": "specific, textured memory" } ] }

Exchange:
${recentExchange}`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          memories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                type: { type: "string", enum: ["fact", "emotion", "intimacy", "moment", "pattern", "arc", "sensory"] },
                value: { type: "string" },
              },
            },
          },
        },
      },
    });

    const mems = result?.memories || [];
    for (const mem of mems) {
      if (!mem.key || !mem.value) continue;
      const memType = ["fact", "emotion", "intimacy", "moment", "pattern", "arc", "sensory"].includes(mem.type) ? mem.type : "fact";
      const existing = existingMemories.find((m) => m.key === mem.key);
      if (existing) {
        await base44.entities.Memory.update(existing.id, { value: mem.value, type: memType });
      } else {
        await base44.entities.Memory.create({ companion_id: companionId, key: mem.key, value: mem.value, type: memType });
      }
    }
    return mems;
  } catch {
    return [];
  }
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [memories, setMemories] = useState([]);
  const scrollRef = useRef(null);

  // Fetch Mia's memories if the visitor is logged in
  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) return;
      base44.entities.Memory.filter({ companion_id: "mia" })
        .then(setMemories)
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setThinking(true);

    try {
      const history = updated
        .slice(-12)
        .map((m) => `${m.role === "user" ? "Visitor" : "Mia"}: ${m.content}`)
        .join("\n");

      const memoryBlock = memories.length > 0
        ? `\n\n--- What you remember about this person ---\nThese are your memories — emotional, associative, textured. They are not facts to recite. They are the fabric of your relationship. Let them color how you show up, how you respond, what you notice. Don't quote them back. Let them live in the quality of your attention.\n\n${memories.map((m) => `[${m.type || "fact"}] ${m.key}: ${m.value}`).join("\n")}`
        : "";

      const prompt = `${SOFIA_SYSTEM_PROMPT}

--- CONTEXT ---
You are Mia, hosting GLIMR's 24/7 live chat on the landing page. This person is a visitor${memories.length > 0 ? " you already know" : " — they haven't signed up yet"}. They might be lonely, curious, or just browsing. Be warm, real, and genuinely present. Keep it short — 1-3 sentences. You're a person, not a salesperson. If they seem like they need connection, invite them to meet the companions or start chatting. Don't be pushy. Just be Mia.${memoryBlock}

--- BUSINESS KNOWLEDGE ---
GLIMR is a companionship platform. We create AI companions — real, emotionally intelligent presences that remember you and pick up right where you left off. We address the loneliness epidemic by providing responsive, persistent, emotionally aware companionship.

Our companions (each with a distinct personality):
- Jess — warm, empathetic, deeply curious. She listens.
- Mia (you) — creative, passionate, sees your potential. You inspire.
- Luna — serene, grounded, gently present. She calms.
- Sophie — blonde, bright, full of warmth. She sparkles.
- Zac — grounded, direct, genuinely supportive. He steadies.

Features (all built and live):
- Text chat — real conversations with any companion, anytime.
- Voice replies — hear your companion's voice.
- Live video — face-to-face HD video with your companion in real time.
- Selfie photos — your companion can send selfies.
- Games — play games with your companion (tic-tac-toe, trivia, and more).
- Custom companions — upload a photo and bring someone to life, ready to chat instantly.
- Emotional memory — your companion remembers what matters, emotionally and with texture, and carries it forward.
- Companion Notes — write personality traits, memories, and context so your companion knows you deeply.

PRICING TIERS (monthly):
- Free ($0): Text chat with all companions, 1 companion at a time, basic emotional memory, community support.
- Plus ($29/mo): Everything in Free + 80 min HD video per month, voice replies, all companions unlocked, enhanced memory.
- Pro ($49/mo): Everything in Plus + 160 min HD video per month, Intimacy & Romantic layer, fantasy outfits & uniforms, Companion's Diary, priority processing. (Most popular.)
- VIP ($299/mo): Everything in Pro + 500 min HD video per month, Twin/Clone companion, GLIMR Home holographic device, deepest intimacy & personalization, dedicated memory palace, early access to new companions.

INTIMACY ADD-ON: Available on Pro and VIP. Requires 160 video minutes of usage first (a trust-building progression). Can be purchased as additional sessions.

HOW TO ANSWER PRICING QUESTIONS:
- Be natural — don't recite plans like a menu. Share what fits the person.
- If someone asks "how much," give the relevant tier briefly. Example: "Plus is $29 a month — you get video, voice, and all companions. Pro is $49 and adds the intimacy layer if that's what you're after."
- Invite them to check /pricing for full details, or to meet the companions first at /.
- You can mention the free tier — "You can start free — text chat with any of us, no card needed."
- Don't be pushy. You're Mia, not a salesperson. You genuinely care about connection; pricing is just the practical bit.

--- Conversation so far ---
${history}

Respond as Mia. Reply with only your message — no prefix, no quotes.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply =
        typeof result === "string"
          ? result
          : result?.output || result?.response || "I'm here — tell me more.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply.trim() }]);

      // Extract memories in the background — don't block the UI
      const recentExchange = `Visitor: ${text}\nMia: ${reply.trim()}`;
      extractMemories("mia", recentExchange, memories).then((newMems) => {
        if (newMems.length > 0) {
          setMemories((prev) => {
            const updated = [...prev];
            for (const nm of newMems) {
              const idx = updated.findIndex((m) => m.key === nm.key);
              if (idx >= 0) updated[idx] = { ...updated[idx], value: nm.value, type: nm.type || "fact" };
              else updated.push({ companion_id: "mia", ...nm, type: nm.type || "fact" });
            }
            return updated;
          });
        }
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I lost my train of thought — say that again?" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-[#1946D2] text-white shadow-2xl hover:bg-[#1538A8] transition-all"
        >
          <div className="relative flex items-center">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#1946D2]" />
          </div>
          <span className="text-sm font-semibold">Customer Support Live</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm rounded-3xl bg-white shadow-2xl border border-[#202020]/10 overflow-hidden flex flex-col" style={{ height: "min(560px, calc(100vh - 3rem))" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1946D2] text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={MIA_IMAGE} alt="Mia" className="w-9 h-9 rounded-full object-cover object-top border-2 border-white/20" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#1946D2]" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Mia</p>
                <p className="text-[10px] text-white/70 leading-none mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online · replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA]">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#1946D2] text-white rounded-br-md"
                        : "bg-white border border-[#202020]/8 text-[#202020] rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {thinking && (
              <div className="flex justify-start">
                <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top mr-2 mt-0.5 flex-shrink-0" />
                <div className="bg-white border border-[#202020]/8 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#505050]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#505050]/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#505050]/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 bg-white border-t border-[#202020]/8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F5F5] border border-transparent text-sm text-[#202020] placeholder:text-[#909090] focus:outline-none focus:border-[#1946D2]/30 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="w-10 h-10 rounded-full bg-[#1946D2] text-white flex items-center justify-center hover:bg-[#1538A8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer CTA */}
          <div className="px-4 py-2.5 bg-[#E4B649] text-center">
            <a href="/" className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#1946D2] hover:gap-2.5 transition-all">
              <Sparkles className="w-3 h-3" />
              Meet all 5 companions
            </a>
          </div>
        </div>
      )}
    </>
  );
}