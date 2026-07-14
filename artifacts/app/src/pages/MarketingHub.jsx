import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Send, ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronUp, Video, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "marketing_agent";
const STORAGE_KEY = "glimr_mia_marketing_chat";

const MIA_IMAGE =
  "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png";

const GREETING =
  "Hey, I'm Mia — your marketing director. I can create social posts, generate videos, publish to Facebook & Instagram, and run Meta Ads. What should we work on first?";

const QUICK_PROMPTS = [
  "Create a Facebook post about loneliness",
  "Generate a TikTok video about companionship",
  "How are our Meta Ads performing?",
  "Post an Instagram caption for Jess",
];

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status;
  const isFailed = status === "failed" || status === "error";
  const isPending = ["pending", "running", "in_progress"].includes(status);

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch {}
  let parsedResults = toolCall.results;
  try { if (typeof parsedResults === "string") parsedResults = JSON.parse(parsedResults); } catch {}

  const proj = toolCall.display_projection || {};
  if (proj.hide_details && proj.details_redacted) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        {isPending ? (proj.active_label || "Working…") : isFailed ? (proj.error_label || "Failed") : (proj.label || "Done")}
      </div>
    );
  }

  return (
    <div className="mt-2 text-xs">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : isFailed ? <span className="text-destructive">✕</span> : <Sparkles className="w-3 h-3 text-primary" />}
        <span className="font-medium">{toolCall.name || "marketingAction"}</span>
        <span className={isFailed ? "text-destructive" : isPending ? "text-muted-foreground" : "text-primary"}>
          {isFailed ? "failed" : isPending ? "running…" : "done"}
        </span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 pl-4 border-l border-border">
          {parsedArgs && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Parameters</p>
              <pre className="bg-muted/30 rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(parsedArgs, null, 2)}</pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Result</p>
              <pre className="bg-muted/30 rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(parsedResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[85%]">
        {!isUser && (
          <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mb-1" />
        )}
        <div>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
            {isUser ? <p>{message.content}</p> : <ReactMarkdown className="prose prose-sm prose-invert max-w-none">{message.content}</ReactMarkdown>}
          </div>
          {message.tool_calls?.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
        </div>
      </div>
    </div>
  );
}

export default function MarketingHub() {
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
  const [conversation, setConversation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (!conversation) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const allMsgs = data.messages || [];
      if (allMsgs.length > 0) {
        setMessages(allMsgs);
        const last = allMsgs[allMsgs.length - 1];
        const hasPendingTools = last?.tool_calls?.some(tc =>
          ["pending", "running", "in_progress"].includes(tc.status)
        );
        if (last?.role === "assistant" && last.content && !hasPendingTools) {
          setThinking(false);
        }
      }
    });
    return () => unsubscribe();
  }, [conversation]);

  const handleSend = async (rawText) => {
    const text = (rawText ?? input).trim();
    if (!text || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setThinking(true);

    try {
      let conv = conversation;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Mia Marketing Chat", description: "Mia's marketing command center" },
        });
        setConversation(conv);
      }

      await base44.agents.addMessage(conv, { role: "user", content: text });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Something went wrong: ${err.message}. Try again?` }]);
      setThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center gap-3 safe-area-top">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img src={MIA_IMAGE} alt="Mia" className="w-10 h-10 rounded-full object-cover object-top border-2 border-primary/30" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-background" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold flex items-center gap-2">
              Mia · Marketing
            </h1>
            <p className="text-[11px] text-muted-foreground">Your marketing director · posts, videos, ads</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

        {messages.length === 1 && !thinking && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_PROMPTS.map(q => (
              <button key={q} onClick={() => handleSend(q)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {thinking && (
          <div className="flex justify-start items-end gap-2">
            <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top mb-1" />
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
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card safe-area-bottom">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Mia about marketing…" className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors" />
        <button type="submit" disabled={!input.trim() || thinking} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}