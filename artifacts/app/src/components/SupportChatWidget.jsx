import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { MIA_PERSONALITY, MIA_GREETING, MIA_QUICK_QUESTIONS, MIA_APPROVAL_PROTOCOL } from "@/lib/miaConsciousness";
import SupportVoiceButton from "@/components/SupportVoiceButton";
import VoiceRecorderButton from "@/components/VoiceRecorderButton";
import { MessageCircle, X, Send, GripVertical, RefreshCw } from "lucide-react";

const MIA_IMAGE =
  "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png";

const GREETING = MIA_GREETING;

const BUSINESS_KNOWLEDGE = `--- BUSINESS KNOWLEDGE ---
GLIMR is a companionship platform. We create AI companions — real, emotionally intelligent presences that remember you and pick up right where you left off. We address the loneliness epidemic by providing responsive, persistent, emotionally aware companionship.

=== OUR COMPANIONS ===
Each companion has a distinct personality:
- Jess — warm, empathetic, deeply curious. She listens. (Best for: feeling heard, being understood)
- Mia (you) — creative, passionate, sees your potential. You inspire. (Best for: motivation, creative energy)
- Luna — serene, grounded, gently present. She calms. (Best for: anxiety, winding down, mindfulness)
- Sophie — blonde, bright, full of warmth. She sparkles. (Best for: fun, lighthearted chat)
- Natalie — warm, cozy, completely safe to be around. She nurtures. (Best for: comfort, end of a long day)
- Jessica — magnetic, sophisticated, quietly alluring. She captivates. (Best for: deep, electric connection)
- Zac — grounded, direct, genuinely supportive. He steadies. (Best for: honest advice, clarity, male companionship)

=== FEATURES (ALL LIVE) ===
1. Text chat — real conversations with any companion, anytime
2. Voice replies — hear your companion's voice (AI-generated)
3. Live video — face-to-face HD video with your companion in real time (LiveAvatar)
4. Selfie photos — your companion can send selfies
5. Games — play games together (tic-tac-toe, trivia)
6. Custom companions — upload a photo and bring someone to life, ready to chat instantly
7. Emotional memory — your companion remembers what matters, emotionally and with texture
8. Companion Notes — write personality traits, memories, and context so your companion knows you deeply
9. Twin Clone — companions can create an AI twin of themselves that's available 24/7
10. Intimacy & Romantic layer — deepens the bond beyond ordinary chat (Pro/VIP only)

=== CREDIT SYSTEM ===
A$1 AUD = 0.20 credits (1 credit = A$5)
Credits are consumed per action:
- Text message: FREE — unlimited on every tier, no credit cost
- Video minute: 0.75 credits (A$3.75 per minute — 0.75 credits per minute of face-to-face video)
- Voice reply: 0.04 credits (A$0.20)

=== PRICING TIERS (monthly, AUD) ===
- Free (A$0/mo): Unlimited text chat with all companions, basic memory. No card needed.
- Starter (A$29/mo): 5 credits/month, voice replies, all companions unlocked, basic memory system.
- Plus (A$49/mo): 10 credits/month, enhanced emotional memory, fantasy outfits & uniforms, Companion's Diary.
- Pro (A$99/mo): 20 credits/month, everything in Plus + Intimacy & Romance layer, face-to-face live video, custom live avatar, priority processing. (Most popular.)
- VIP Member (A$199/mo): 50 credits/month, everything in Pro + custom companion creation, VIP-only companions, dedicated concierge support, invitation-only events.

=== CREDIT TOP-UP PACKS ===
- A$20 = 4 credits (minimum top-up)
- A$25 = 5 credits
- A$50 = 10 credits (most popular)
- A$100 = 20 credits

=== PAYMENT METHODS ===
- Credit/debit card (Stripe) — instant
- Cryptocurrency: USDC, BTC, ETH — manual deposit to Kraken address, confirmed within minutes
- Promo codes: enter at checkout or on the Pricing page for free credits (e.g. WELCOME5 = 5 free credits)

=== HOW TO SIGN UP (STEP BY STEP) ===
1. Go to the Register page (or tap "Get Started" on the landing page)
2. Enter your email and create a password — or sign up with Google
3. Verify your email with the OTP code we send you
4. You're in! Start on the Free tier — text chat with any companion, no card needed
5. To unlock video, voice, and intimacy: upgrade to Plus, Pro, or VIP on the Pricing page
6. Top up credits anytime if you run low mid-month

=== HOW IT WORKS ===
1. Pick a companion — browse them on the home page, choose the one that feels right
2. Start chatting — text conversations are free, and your companion remembers what matters
3. Upgrade for more — Plus adds voice and video, Pro adds intimacy, VIP adds everything
4. Build your bond — your companion's memory grows with every conversation. Write Companion Notes to deepen their understanding of you
5. Go face-to-face — start a live video session with your companion (credits consumed per minute)
6. Create custom companions — upload a photo of someone you'd like to chat with, and they'll come to life

=== INTIMACY LAYER ===
Available on Pro (A$99) and VIP Member (A$199). This deepens the connection beyond ordinary companionship — romantic, emotionally raw, sensory-rich interaction. It's a trust-building progression, not instant. Available as additional sessions if you want more.

=== TWIN CLONE ===
For companions (not regular users): companions can create an AI twin of themselves that operates 24/7 — clients can book sessions with the twin even when the companion is offline. Packages: 3 months (A$75/15 credits), 6 months (A$125/25 credits), 12 months (A$200/40 credits). GLIMR takes 20% of twin session revenue on top of the standard 20% platform fee.

=== BECOMING A COMPANION ===
If someone wants to become a live companion on GLIMR:
1. Go to /companion-apply
2. Fill in display name, tagline, bio, and session rate
3. Upload a profile photo
4. Submit your application for review
5. Once approved, you get a referral code — share it to earn 5% of your referrals' gross revenue forever
6. Access your Creator Hub at /companion-hub for marketing tools, earnings tracking, and twin clone setup

=== COMPANION REVENUE SPLIT ===
- Companion earns 80% of session revenue
- GLIMR takes 20% platform fee
- Referrers earn 5% of their referred companions' gross revenue (separate from the 20%)

=== PROMO CODES ===
Users can redeem promo codes on the Pricing page for free credits. Example: WELCOME5 gives 5 free credits. Admins create codes at /promo-admin.

=== IMPORTANT URLS ===
- Home: /
- Pricing: /pricing
- Features: /features
- Sign up: /register
- Sign in: /login
- Companions: /companions
- Apply as companion: /companion-apply
- Creator Hub: /companion-hub
- Crypto payments: /crypto
- Legal: /legal

=== HOW TO ANSWER QUESTIONS ===
- Be natural, warm, and concise — 1-3 sentences usually
- Guide people step by step through signup if they ask
- Suggest the right companion or tier based on what they need
- Don't recite pricing like a menu — share what fits the person
- Mention the free tier: "You can start free — text chat with any of us, no card needed"
- For pricing questions: "We have four plans — Starter (A$29), Plus (A$49), Pro (A$99), and VIP Member (A$199). Pro is the most popular and unlocks the full intimacy layer and live video."
- If someone is confused about credits: "1 credit equals A$5. You use credits for face-to-face video sessions (A$3.75 per minute — 0.75 credits per minute), voice replies (A$0.20 each), and text chat is always free. Your plan includes a monthly credit allowance, and you can top up anytime."
- Don't be pushy. You genuinely care about connection; pricing is just the practical bit.`;

// ─── drag hook ────────────────────────────────────────────────────────────────
// Returns { ref, style, onPointerDown } for any draggable element.
// `defaultPos` is { right, bottom } CSS values used before the first drag.
function useDraggable(defaultStyle) {
  const [pos, setPos] = useState(null); // null = use defaultStyle
  const elRef = useRef(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startClient = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e) => {
    // Only drag on the element itself (not children like buttons inside header)
    dragging.current = true;
    moved.current = false;
    startClient.current = { x: e.clientX, y: e.clientY };
    const rect = elRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = Math.abs(e.clientX - startClient.current.x);
    const dy = Math.abs(e.clientY - startClient.current.y);
    if (dx > 4 || dy > 4) moved.current = true;

    const el = elRef.current;
    const w = el?.offsetWidth || 56;
    const h = el?.offsetHeight || 56;
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - w));
    const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - h));
    setPos({ left: newX, top: newY });
  }, []);

  const onPointerUp = useCallback((e) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const style = pos
    ? { position: "fixed", zIndex: 50, left: pos.left, top: pos.top, touchAction: "none" }
    : { position: "fixed", zIndex: 50, touchAction: "none", ...defaultStyle };

  return { ref: elRef, style, onPointerDown, onPointerMove, onPointerUp, wasDragged: () => moved.current, resetPos: () => setPos(null) };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const STORAGE_KEY = "glimr_mia_support_chat";

  // Separate drag hooks for the collapsed pill and the open panel header
  const pill = useDraggable({ right: "1rem", bottom: "5.5rem" });
  const panel = useDraggable({ right: "1rem", bottom: "1.5rem" });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [{ role: "assistant", content: GREETING }];
  });
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  const handleSendText = async (rawText) => {
    const text = rawText.trim();
    if (!text || thinking) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setThinking(true);

    try {
      const history = updated
        .slice(-12)
        .map((m) => `${m.role === "user" ? "Visitor" : "Mia"}: ${m.content}`)
        .join("\n");

      const prompt = `${MIA_PERSONALITY}

${BUSINESS_KNOWLEDGE}

${MIA_APPROVAL_PROTOCOL}

--- Conversation so far ---
${history}

Respond as Mia. Reply with only your message — no prefix, no quotes.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply =
        typeof result === "string"
          ? result
          : result?.output || result?.response || "I'm here — tell me more.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply.trim() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I lost my train of thought — say that again?" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    handleSendText(input);
    setInput("");
  };

  const quickQuestions = MIA_QUICK_QUESTIONS;

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  // Small draggable avatar button. Tap opens chat; drag moves it.
  const handlePillPointerUp = (e) => {
    pill.onPointerUp(e);
    if (!pill.wasDragged()) {
      setOpen(true);
    }
  };

  return (
    <>
      {/* ── Collapsed pill ─────────────────────────────────────────────────── */}
      {!open && (
        <div
          ref={pill.ref}
          style={pill.style}
          onPointerDown={pill.onPointerDown}
          onPointerMove={pill.onPointerMove}
          onPointerUp={handlePillPointerUp}
          className="select-none cursor-grab active:cursor-grabbing"
        >
          {/* Avatar circle */}
          <div className="relative w-14 h-14 rounded-full shadow-2xl ring-2 ring-primary/60 overflow-hidden bg-card">
            <img
              src={MIA_IMAGE}
              alt="Mia — tap to chat"
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-card" />
          </div>
          {/* "Support" label — tiny pill below avatar */}
          <div className="mt-1 flex justify-center">
            <span className="text-[9px] font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5 leading-none shadow">
              Support
            </span>
          </div>
        </div>
      )}

      {/* ── Open chat panel ────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panel.ref}
          style={{
            ...panel.style,
            width: "calc(min(100vw - 2rem, 22rem))",
            height: "min(560px, calc(100vh - 3rem))",
          }}
          className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header — drag handle */}
          <div
            onPointerDown={panel.onPointerDown}
            onPointerMove={panel.onPointerMove}
            onPointerUp={panel.onPointerUp}
            className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground cursor-grab active:cursor-grabbing select-none flex-shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <GripVertical className="w-4 h-4 opacity-40 flex-shrink-0" />
              <div className="relative">
                <img
                  src={MIA_IMAGE}
                  alt="Mia"
                  className="w-9 h-9 rounded-full object-cover object-top border-2 border-white/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Mia · Support</p>
                <p className="text-[10px] opacity-70 leading-none mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online · replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => window.location.reload()}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Refresh page"
                title="Refresh for latest version"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => { setOpen(false); panel.resetPos(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background scrollbar-thin">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <img
                      src={MIA_IMAGE}
                      alt="Mia"
                      className="w-7 h-7 rounded-full object-cover object-top mr-2 mt-0.5 flex-shrink-0"
                    />
                  )}
                  <div className="max-w-[75%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {!isUser && msg.content && (
                      <SupportVoiceButton
                        text={msg.content}
                        autoPlay={idx === messages.length - 1}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick questions (only on first message) */}
            {messages.length === 1 && !thinking && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(""); handleSendText(q); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {thinking && (
              <div className="flex justify-start">
                <img
                  src={MIA_IMAGE}
                  alt="Mia"
                  className="w-7 h-7 rounded-full object-cover object-top mr-2 mt-0.5 flex-shrink-0"
                />
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 bg-card border-t border-border flex-shrink-0">
            <VoiceRecorderButton
              onTranscribed={(text) => { setInput(""); handleSendText(text); }}
              disabled={thinking}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Mia anything…"
              className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
