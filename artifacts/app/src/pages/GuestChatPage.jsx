import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { COMPANIONS } from "@/lib/companions";
import { Send, Loader2, Lock, ArrowRight, ChevronLeft } from "lucide-react";

const FREE_LIMIT = 10;
const storageKey = (id) => `glimr_guest_${id}`;

const GREETINGS = {
  jess:    "Hey you. I was just thinking — what kind of person opens something like this? I'm curious. Tell me something real.",
  jessica: "Well, hello. You found me. I have a feeling this is going to be an interesting conversation. What's on your mind?",
  mia:     "Hi! I'm so glad you're here. I've been wondering who I'd meet today. Tell me about yourself — what's going on with you?",
  zac:     "Hey! Wasn't expecting you but glad you showed up. What's on your mind?",
};

function getGreeting(companion) {
  if (!companion) return "Hey — I'm glad you're here. What's on your mind?";
  return GREETINGS[companion.id] ?? `Hey, I'm ${companion.name}. Tell me something real.`;
}

export default function GuestChatPage() {
  const { companionId } = useParams();
  const companion = COMPANIONS.find((c) => c.id === companionId);

  const [messages, setMessages]       = useState(null); // null = not yet loaded
  const [input, setInput]             = useState("");
  const [thinking, setThinking]       = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load from localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(storageKey(companionId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed.messages ?? []);
        setMessageCount(parsed.count ?? 0);
        return;
      } catch {}
    }
    // First visit — show companion greeting
    const greeting = { role: "assistant", content: getGreeting(companion) };
    setMessages([greeting]);
    setMessageCount(0);
  }, [companionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const save = useCallback((msgs, count) => {
    localStorage.setItem(storageKey(companionId), JSON.stringify({ messages: msgs, count }));
  }, [companionId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking || messageCount >= FREE_LIMIT) return;

    const userMsg   = { role: "user", content: text };
    const newMsgs   = [...(messages ?? []), userMsg];
    const newCount  = messageCount + 1;

    setMessages(newMsgs);
    setInput("");
    setThinking(true);
    setMessageCount(newCount);
    save(newMsgs, newCount);

    try {
      const res  = await fetch("/api/functions/guestChat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          params: {
            companion_id: companionId,
            message:      text,
            history:      newMsgs.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          },
        }),
      });
      const data  = await res.json();
      const reply = data?.data?.reply ?? "I'm here.";
      const withReply = [...newMsgs, { role: "assistant", content: reply }];
      setMessages(withReply);
      save(withReply, newCount);
    } catch {
      // silent — don't crash the UI
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, thinking, messageCount, messages, companionId, save]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const limitReached = messageCount >= FREE_LIMIT;
  const remaining    = Math.max(0, FREE_LIMIT - messageCount);

  if (messages === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur-md"
           style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>

        {companion?.image ? (
          <img src={companion.image} alt={companion?.name} className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold leading-tight truncate">{companion?.name ?? companionId}</p>
          <p className="text-[10px] text-muted-foreground">{companion?.tagline ?? "AI companion"}</p>
        </div>

        {/* Free message counter */}
        {!limitReached && (
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground leading-tight">Free messages</p>
            <p className="text-xs font-semibold text-primary">{remaining} left</p>
          </div>
        )}
      </div>

      {/* ── Guest badge ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
        <p className="text-[11px] text-primary/80">
          ✦ Trying GLIMR free — {remaining} of {FREE_LIMIT} messages remaining
        </p>
        <Link to="/register" className="text-[11px] font-medium text-primary hover:underline">
          Create free account →
        </Link>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-0.5">
                {companion?.image
                  ? <img src={companion.image} alt="" className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full bg-primary/20" />
                }
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border text-foreground rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-0.5">
              {companion?.image
                ? <img src={companion.image} alt="" className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full bg-primary/20" />
              }
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input / Limit wall ──────────────────────────────────────────────── */}
      {limitReached ? (
        <div className="border-t border-border bg-background/95 backdrop-blur-md px-6 py-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-heading text-lg font-semibold mb-1">
              You've had your 10 free chats with {companion?.name ?? "your companion"}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Create a free account to keep going — unlimited text chat is always free. No card needed.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to={`/register?companion=${companionId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-border bg-background/95 backdrop-blur-md px-3 py-3">
          <div className="flex items-end gap-2 max-w-2xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={`Message ${companion?.name ?? "your companion"}…`}
              rows={1}
              className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors max-h-32"
              style={{ fieldSizing: "content" }}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0 disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
