import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import {
  LayoutDashboard, MessageSquare, Megaphone, Wrench, Users,
  TrendingUp, Crown, Heart, Zap, UserCheck, PiggyBank, Coins,
  Send, Loader2, Sparkles, ChevronDown, ChevronUp, ArrowLeft,
  Upload, Download, Image, Type, Wand2, RefreshCw, Copy, Check,
  ExternalLink, Tag, BarChart2, Settings, Link2, Instagram, Facebook,
} from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",   label: "Overview",   icon: LayoutDashboard },
  { id: "orders",     label: "Orders",     icon: PiggyBank },
  { id: "mia",        label: "Mia",         icon: MessageSquare },
  { id: "marketing",  label: "Marketing",   icon: Megaphone },
  { id: "tools",      label: "Tools",       icon: Wrench },
  { id: "users",      label: "Users",       icon: Users },
];

const TIER_COLORS = { free: "#6b7280", starter: "#3b82f6", plus: "#8b5cf6", pro: "#e8a866", vip: "#d4a574" };

const MIA_IMAGE = "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png";
const MIA_GREETING = "Hey — I'm Mia, your marketing director. I can write social posts, plan campaigns, draft emails, and help you grow GLIMR. What are we working on?";
const MIA_QUICK_PROMPTS = [
  "Write a Facebook post about Jess",
  "Draft a welcome email for new users",
  "Create an Instagram caption about connection",
  "Give me 5 TikTok hook ideas for GLIMR",
];
const STORAGE_KEY = "glimr_admin_mia_chat";

// ─── Small components ─────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, accent = "bg-primary/10" }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="text-2xl font-bold font-heading">{value ?? "—"}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
  </div>
);

const Pill = ({ children, onClick, active }) => (
  <button
    onClick={onClick}
    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
    }`}
  >
    {children}
  </button>
);

// ─── MIA CHAT ─────────────────────────────────────────────────────────────────

function MiaChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) return p; }
    } catch {}
    return [{ role: "assistant", content: MIA_GREETING }];
  });
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [conversation, setConversation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, thinking]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {} }, [messages]);

  useEffect(() => {
    if (!conversation) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const msgs = data.messages || [];
      if (msgs.length > 0) {
        setMessages(msgs);
        const last = msgs[msgs.length - 1];
        const pending = last?.tool_calls?.some(tc => ["pending", "running", "in_progress"].includes(tc.status));
        if (last?.role === "assistant" && last.content && !pending) setThinking(false);
      }
    });
    return () => unsub();
  }, [conversation]);

  const send = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setThinking(true);
    try {
      let conv = conversation;
      if (!conv) {
        conv = await base44.agents.createConversation({ agent_name: "marketing_agent", metadata: { name: "Mia Admin Chat" } });
        setConversation(conv);
      }
      await base44.agents.addMessage(conv, { role: "user", content: text });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Something went wrong: ${err.message}` }]);
      setThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin min-h-0">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isUser && <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mb-1" />}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                  {isUser ? <p>{msg.content}</p> : <ReactMarkdown className="prose prose-sm prose-invert max-w-none">{msg.content}</ReactMarkdown>}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 1 && !thinking && (
          <div className="flex flex-wrap gap-2 pt-1">
            {MIA_QUICK_PROMPTS.map(q => <Pill key={q} onClick={() => send(q)}>{q}</Pill>)}
          </div>
        )}
        {thinking && (
          <div className="flex justify-start items-end gap-2">
            <img src={MIA_IMAGE} alt="Mia" className="w-7 h-7 rounded-full object-cover object-top mb-1" />
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 120, 240].map(d => <span key={d} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card flex-shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Mia…" className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors" />
        <button type="submit" disabled={!input.trim() || thinking} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getDashboardStats", {})
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>;
  if (!stats) return <div className="text-center text-muted-foreground py-20 text-sm">Could not load stats — admin access required.</div>;

  const tierData = Object.entries(stats.tier_counts || {}).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1), users: count, fill: TIER_COLORS[tier] ?? "#6b7280",
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={stats.totals?.total_users} accent="bg-primary/10" />
        <StatCard icon={UserCheck} label="Paid subscribers" value={stats.totals?.paid_users} sub={`${stats.totals?.free_users ?? 0} on free`} accent="bg-blue-500/10" />
        <StatCard icon={TrendingUp} label="Today's signups" value={stats.today_signups ?? 0} accent="bg-emerald-500/10" />
        <StatCard icon={Crown} label="VIP / Pro" value={(stats.tier_counts?.vip ?? 0) + (stats.tier_counts?.pro ?? 0)} sub="Premium tier" accent="bg-amber-500/10" />
      </div>

      {/* Visit stats */}
      {stats.visit_stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BarChart2} label="Total visits" value={stats.visit_stats.total} accent="bg-violet-500/10" />
          <StatCard icon={TrendingUp} label="Today's visits" value={stats.visit_stats.today} accent="bg-sky-500/10" />
          <StatCard icon={Sparkles} label="Conversions" value={stats.visit_stats.conversions} sub="Visits → signups" accent="bg-emerald-500/10" />
          <StatCard icon={Zap} label="Conv. rate" value={`${stats.visit_stats.conv_rate}%`} sub="Visits that signed up" accent="bg-amber-500/10" />
        </div>
      )}

      {/* Source + page breakdown */}
      {stats.visit_stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-sm font-semibold mb-3">Traffic by Source</h2>
            <div className="space-y-2">
              {Object.entries(stats.visit_stats.by_source ?? {}).sort((a,b) => b[1]-a[1]).map(([src, count]) => (
                <div key={src} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 capitalize">{src}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((count / stats.visit_stats.total) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{count}</span>
                </div>
              ))}
              {Object.keys(stats.visit_stats.by_source ?? {}).length === 0 && <p className="text-xs text-muted-foreground">No visits recorded yet</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-sm font-semibold mb-3">Traffic by Page</h2>
            <div className="space-y-2">
              {Object.entries(stats.visit_stats.by_page ?? {}).sort((a,b) => b[1]-a[1]).map(([page, count]) => (
                <div key={page} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 capitalize">{page}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.round((count / stats.visit_stats.total) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{count}</span>
                </div>
              ))}
              {Object.keys(stats.visit_stats.by_page ?? {}).length === 0 && <p className="text-xs text-muted-foreground">No visits recorded yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold mb-1">Growth (14 days)</h2>
          <p className="text-xs text-muted-foreground mb-4">New signups per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.growth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="new_signups" name="Signups" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tier pie */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-base font-semibold mb-1">Tier Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Users across subscription levels</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={tierData} dataKey="users" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {tierData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-tier table */}
      <div className="rounded-2xl border border-border bg-card p-6 overflow-x-auto">
        <h2 className="font-heading text-base font-semibold mb-4">Per-Tier Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Tier", "Users", "% of total", "Credits held"].map(h => (
                <th key={h} className="pb-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.tier_counts || {}).map(([tier, count]) => (
              <tr key={tier} className="border-b border-border/50 last:border-0">
                <td className="py-3 capitalize font-medium">{tier}</td>
                <td className="py-3">{count}</td>
                <td className="py-3">{stats.totals?.total_users > 0 ? Math.round((count / stats.totals.total_users) * 100) : 0}%</td>
                <td className="py-3">{stats.credits_by_tier?.[tier]?.toFixed(0) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MARKETING ────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "from-purple-500 to-pink-500" },
  { id: "facebook",  label: "Facebook",  color: "from-blue-600 to-blue-500" },
  { id: "story",     label: "Story",     color: "from-orange-500 to-pink-400" },
  { id: "tiktok",    label: "TikTok",    color: "from-black to-gray-700" },
  { id: "twitter",   label: "X / Twitter", color: "from-gray-800 to-gray-700" },
  { id: "email",     label: "Email",     color: "from-primary to-primary/70" },
];

const COMPANIONS_FOR_UTM = [
  { id: "general",  label: "General (no companion)" },
  { id: "jess",     label: "Jess" },
  { id: "mia",      label: "Mia" },
  { id: "zac",      label: "Zac" },
  { id: "jessica",  label: "Jessica" },
  { id: "luna",     label: "Luna" },
  { id: "monica",   label: "Monica" },
];

const LANDING_PAGES = [
  { label: "Home",        path: "/" },
  { label: "Jess",        path: "/jess" },
  { label: "Mia",         path: "/mia" },
  { label: "Zac",         path: "/zac" },
  { label: "Jessica",     path: "/jessica" },
  { label: "Luna",        path: "/luna" },
  { label: "Monica",      path: "/monica" },
  { label: "All companions", path: "/companions" },
  { label: "Pricing",     path: "/pricing" },
];

function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground hover:text-foreground"} ${className}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Marketing() {
  const BASE_URL = "https://glimr.com.au";

  // ── UTM Link Builder state ──────────────────────────────────────────────────
  const [utmPage,     setUtmPage]     = useState("/");
  const [utmSource,   setUtmSource]   = useState("instagram");
  const [utmCampaign, setUtmCampaign] = useState("");

  const utmLink = (() => {
    const p = new URLSearchParams();
    p.set("utm_source",   utmSource);
    p.set("utm_medium",   "social");
    if (utmCampaign.trim()) p.set("utm_campaign", utmCampaign.trim().toLowerCase().replace(/\s+/g, "_"));
    return `${BASE_URL}${utmPage}?${p.toString()}`;
  })();

  // ── Post Kit generator state ────────────────────────────────────────────────
  const [platform,   setPlatform]   = useState("instagram");
  const [companion,  setCompanion]  = useState("general");
  const [topic,      setTopic]      = useState("");
  const [campaign,   setCampaign]   = useState("");
  const [generating, setGenerating] = useState(false);
  const [kit,        setKit]        = useState(null); // { caption, image_prompt, image_size }

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setKit(null);
    try {
      const res = await base44.functions.invoke("generateCaption", { topic, platform, companion });
      const caption   = res.data?.caption    ?? "";
      const imgPrompt = res.data?.image_prompt ?? "";
      const imgSize   = res.data?.image_size   ?? "";

      // Build the UTM link for this post
      const p = new URLSearchParams();
      p.set("utm_source", platform === "story" ? "instagram" : platform);
      p.set("utm_medium", "social");
      if (campaign.trim()) p.set("utm_campaign", campaign.trim().toLowerCase().replace(/\s+/g, "_"));
      const page = companion !== "general" ? `/${companion}` : "/";
      const link = `${BASE_URL}${page}?${p.toString()}`;

      setKit({ caption, image_prompt: imgPrompt, image_size: imgSize, link });
    } catch (err) {
      setKit({ caption: `Error: ${err.message}`, image_prompt: "", image_size: "", link: "" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Campaign Review",  href: "/campaign-review",    icon: BarChart2 },
          { label: "Promo Codes",      href: "/promo-admin",        icon: Tag },
          { label: "Marketing Stats",  href: "/marketing-dashboard", icon: TrendingUp },
          { label: "Companion Hub",    href: "/companion-hub",       icon: Users },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 hover:bg-card/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── UTM Link Builder ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-base font-semibold">Trackable Link Builder</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Paste these links into your Facebook/Instagram posts, bio, or video descriptions. Every click is recorded in Marketing Stats.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Destination page */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Destination page</label>
            <select
              value={utmPage}
              onChange={e => setUtmPage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
            >
              {LANDING_PAGES.map(p => (
                <option key={p.path} value={p.path}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Platform / source */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Platform (source)</label>
            <select
              value={utmSource}
              onChange={e => setUtmSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
            >
              {["instagram","facebook","tiktok","youtube","twitter","email","linktree","bio"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Campaign name */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Campaign name (optional)</label>
            <input
              type="text"
              value={utmCampaign}
              onChange={e => setUtmCampaign(e.target.value)}
              placeholder="e.g. mia_reel_jan"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Generated link */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
          <p className="flex-1 text-xs font-mono text-foreground break-all select-all">{utmLink}</p>
          <CopyButton text={utmLink} className="flex-shrink-0" />
        </div>

        {/* Shortcut links for all companions */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick companion links — Instagram bio / Facebook page</p>
          <div className="flex flex-wrap gap-2">
            {COMPANIONS_FOR_UTM.filter(c => c.id !== "general").map(c => {
              const p = new URLSearchParams({ utm_source: "instagram", utm_medium: "social" });
              const link = `${BASE_URL}/${c.id}?${p.toString()}`;
              return (
                <div key={c.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border bg-background text-xs text-muted-foreground">
                  <span>{c.label}</span>
                  <CopyButton text={link} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Social Post Kit Generator ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-base font-semibold">Social Post Kit</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Mia writes a ready-to-post caption, hashtags, image brief, and trackable link — one click.
        </p>

        {/* Platform */}
        <div className="flex flex-wrap gap-2">
          {SOCIAL_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                platform === p.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground bg-card"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Companion + campaign row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Feature companion</label>
            <select
              value={companion}
              onChange={e => setCompanion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
            >
              {COMPANIONS_FOR_UTM.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Campaign tag (for tracking)</label>
            <input
              type="text"
              value={campaign}
              onChange={e => setCampaign(e.target.value)}
              placeholder="e.g. mia_reel_jan"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">What's this post about?</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. 'Feeling alone on a Sunday', 'Jess remembers everything you tell her', 'Valentine's Day — no one should spend it alone'"
            className="w-full h-20 px-4 py-3 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        <button
          onClick={generate}
          disabled={!topic.trim() || generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Writing your post kit…" : "Generate post kit"}
        </button>

        {/* Results */}
        {kit && (
          <div className="space-y-3">
            {/* Caption */}
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Caption</p>
                <CopyButton text={kit.caption} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{kit.caption}</p>
            </div>

            {/* Image brief + size */}
            {kit.image_prompt && (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Image brief</p>
                  <CopyButton text={kit.image_prompt} />
                </div>
                <p className="text-sm text-foreground mb-1">{kit.image_prompt}</p>
                {kit.image_size && (
                  <p className="text-xs text-muted-foreground mt-1">📐 Recommended size: <span className="font-medium text-foreground">{kit.image_size}</span> — use the AI Image Generator in Tools to create it</p>
                )}
              </div>
            )}

            {/* Trackable link */}
            {kit.link && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Your trackable link</p>
                  <CopyButton text={kit.link} />
                </div>
                <p className="text-xs font-mono text-foreground break-all">{kit.link}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Paste this as your CTA link — every click is tracked in Marketing Stats</p>
              </div>
            )}

            {/* Full kit copy */}
            <button
              onClick={() => {
                const full = `${kit.caption}\n\n${kit.link}`;
                navigator.clipboard.writeText(full);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy caption + link together
            </button>
          </div>
        )}
      </div>

      {/* ── Marketing Videos ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-base font-semibold">Marketing Videos</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          AI-generated clips ready to post. Right-click → Save or tap Download to get the file. Use the Post Kit above to pair a caption + trackable link with each video.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              file: "glimr-late-night.mp4",
              title: "Late Night Reach",
              desc: "Bedside phone glow — perfect for late-night Story or Reel",
              format: "9:16 · Story / Reel",
              platform: "Instagram · TikTok",
            },
            {
              file: "glimr-companion-moment.mp4",
              title: "Companion Moment",
              desc: "Woman smiling at her phone by a rain window — warmth and connection",
              format: "9:16 · Story / Reel",
              platform: "Instagram · TikTok",
            },
            {
              file: "glimr-lifestyle-wide.mp4",
              title: "Cosy Lifestyle",
              desc: "Candles, tea, soft light — no faces, brand-safe for any platform",
              format: "16:9 · Feed / YouTube",
              platform: "Facebook · YouTube",
            },
            {
              file: "glimr-connection-hope.mp4",
              title: "Connection & Hope",
              desc: "Man on rooftop at golden hour — relief, hope, not alone",
              format: "9:16 · Story / Reel",
              platform: "Instagram · TikTok",
            },
          ].map(({ file, title, desc, format, platform }) => (
            <div key={file} className="rounded-xl border border-border bg-background overflow-hidden flex flex-col">
              <video
                src={`/marketing-videos/${file}`}
                className="w-full aspect-video object-cover bg-black"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div>
                  <p className="text-sm font-semibold leading-tight">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{format}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{platform}</span>
                </div>
                <a
                  href={`/marketing-videos/${file}`}
                  download={file}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download MP4
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Companion landing pages ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold mb-1">Companion Landing Pages</h2>
        <p className="text-xs text-muted-foreground mb-3">Direct-traffic links — use these when you can't add UTM params (e.g. stories swipe-up, printed QR codes)</p>
        <div className="flex flex-wrap gap-2">
          {LANDING_PAGES.map(({ label, path }) => (
            <a key={path} href={`${BASE_URL}${path}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              {label} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TOOLS ────────────────────────────────────────────────────────────────────

function Tools() {
  const [activeTool, setActiveTool] = useState("bg-remove");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imgResult, setImgResult] = useState(null);
  const [imgGenerating, setImgGenerating] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const processImage = async (action) => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise(resolve => {
        reader.onload = e => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      const res = await base44.functions.invoke("processImage", {
        action,
        image_base64: base64,
        mime_type: file.type,
      });
      if (res.data?.image_url || res.data?.result_base64) {
        setResult(res.data.image_url ?? `data:image/png;base64,${res.data.result_base64}`);
      } else {
        setResult(null);
        alert(res.data?.message ?? "Processing failed — check if REMOVE_BG_API_KEY is set.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setImgGenerating(true);
    setImgResult(null);
    try {
      const res = await base44.functions.invoke("generateMarketingImage", { prompt });
      setImgResult(res.data?.image_url);
    } catch (err) {
      alert(err.message);
    } finally {
      setImgGenerating(false);
    }
  };

  const TOOLS = [
    { id: "bg-remove",  label: "Background Remover", icon: Image,  desc: "Remove the background from any photo in one click" },
    { id: "ai-image",   label: "AI Image Generator", icon: Wand2,  desc: "Generate marketing visuals from a text prompt" },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Tool selector */}
      <div className="flex gap-3 flex-wrap">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setFile(null); setPreview(null); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${activeTool === t.id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Background Remover */}
      {activeTool === "bg-remove" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-heading text-base font-semibold">Background Remover</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Upload a photo and get back a clean transparent PNG. Requires REMOVE_BG_API_KEY.</p>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 10MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {file && (
            <button
              onClick={() => processImage("remove_background")}
              disabled={processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {processing ? "Removing background…" : "Remove Background"}
            </button>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-border bg-[repeating-conic-gradient(#808080_0%_25%,transparent_0%_50%)_0_0/16px_16px]">
                <img src={result} alt="Result" className="max-h-64 mx-auto object-contain" />
              </div>
              <a
                href={result}
                download="glimr_no_bg.png"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                <Download className="w-4 h-4" /> Download PNG
              </a>
            </div>
          )}
        </div>
      )}

      {/* AI Image Generator */}
      {activeTool === "ai-image" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-heading text-base font-semibold">AI Image Generator</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Generate marketing visuals with DALL-E. No AI face images — use real companion photos for those.</p>
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. 'Warm golden light, cosy living room with a phone glowing softly on a coffee table, cinematic, minimal'"
            className="w-full h-24 px-4 py-3 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors"
          />

          <button
            onClick={generateImage}
            disabled={!prompt.trim() || imgGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {imgGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {imgGenerating ? "Generating…" : "Generate Image"}
          </button>

          {imgResult && (
            <div className="space-y-3">
              <img src={imgResult} alt="Generated" className="w-full rounded-xl border border-border" />
              <a href={imgResult} download="glimr_ai_image.png" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors">
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────────

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────

const COMPANION_NAMES = { jess:"Jess", mia:"Mia", zac:"Zac", sophie:"Sophie", blake:"Blake", oliver:"Oliver", luna:"Luna", home:"Mia" };
const TIER_BADGE = { free:"bg-muted text-muted-foreground", starter:"bg-purple-500/20 text-purple-300", plus:"bg-blue-500/20 text-blue-300", pro:"bg-primary/20 text-primary", vip:"bg-amber-500/20 text-amber-300" };

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    base44.functions.invoke("getRecentOrders", {})
      .then(res => setOrders(res.data?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading && !orders) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  const total = orders?.reduce((s, o) => s + (o.amount_aud ?? 0), 0) ?? 0;

  return (
    <div className="p-6 space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={PiggyBank}  label="Total orders"   value={orders?.length ?? 0} accent="bg-primary/10" />
        <StatCard icon={Coins}      label="Revenue (AUD)"  value={`${(total / 100).toFixed(2)}`} accent="bg-emerald-500/10" />
        <StatCard icon={Crown}      label="Latest order"   value={orders?.[0]?.plan_label ?? "—"} sub={orders?.[0]?.email} accent="bg-amber-500/10" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">Order feed</h2>
        <button onClick={load} className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {(!orders || orders.length === 0) ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
            No orders yet — they'll appear here the moment someone pays.
          </div>
        ) : orders.map((o, i) => (
          <div key={o.id ?? i}
            className={`rounded-2xl border bg-card p-4 cursor-pointer transition-all ${selected === i ? "border-primary/40" : "border-border hover:border-border/80 hover:bg-muted/10"}`}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: name + email */}
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{o.name || o.email}</p>
                <p className="text-xs text-muted-foreground truncate">{o.email}</p>
              </div>
              {/* Centre: plan badge + companion */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${TIER_BADGE[o.tier] ?? TIER_BADGE.free}`}>
                  {o.plan_label ?? o.tier}
                </span>
                {o.companion_id && o.companion_id !== "home" && (
                  <span className="text-xs text-muted-foreground">via {COMPANION_NAMES[o.companion_id] ?? o.companion_id}</span>
                )}
              </div>
              {/* Right: amount + date */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">${((o.amount_aud ?? 0) / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {o.paid_at ? new Date(o.paid_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "—"}
                </p>
              </div>
            </div>

            {/* Expanded detail */}
            {selected === i && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground mb-1">Customer</p><p className="font-medium">{o.name || "—"}</p><p className="text-xs text-muted-foreground">{o.email}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-1">Package</p><p className="font-medium">{o.plan_label}</p><p className="text-xs text-muted-foreground">${((o.amount_aud ?? 0) / 100).toFixed(2)} AUD / month</p></div>
                  <div><p className="text-xs text-muted-foreground mb-1">Companion</p><p className="font-medium">{COMPANION_NAMES[o.companion_id] ?? o.companion_id ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-1">Ordered</p><p className="font-medium">{o.paid_at ? new Date(o.paid_at).toLocaleString("en-AU") : "—"}</p></div>
                </div>
                {/* Action checklist */}
                <div className="rounded-xl bg-background border border-border p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Action checklist</p>
                  <p className="text-xs text-emerald-400">✅ Subscription activated</p>
                  <p className="text-xs text-emerald-400">✅ Welcome email sent from {COMPANION_NAMES[o.companion_id] ?? "Mia"}</p>
                  <p className="text-xs text-emerald-400">✅ Order dispatch sent to your inbox</p>
                  {["pro","vip"].includes(o.tier) && <p className="text-xs text-amber-400">⚡ Create Anam avatar for this customer</p>}
                  {o.tier === "vip" && <p className="text-xs text-amber-400">⚡ Schedule personal onboarding call within 24h</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.functions.invoke("getRecentSignups", {})
      .then(res => setUsers(res.data?.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (users ?? []).filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tierBadge = (tier) => {
    const map = { vip: "bg-amber-500/20 text-amber-300", pro: "bg-primary/20 text-primary", plus: "bg-blue-500/20 text-blue-300", starter: "bg-purple-500/20 text-purple-300", free: "bg-muted text-muted-foreground" };
    return map[tier] ?? map.free;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or name…" className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors" />
        <button onClick={() => { setLoading(true); base44.functions.invoke("getRecentSignups", {}).then(r => setUsers(r.data?.users ?? [])).finally(() => setLoading(false)); }}
          className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["User", "Tier", "Credits", "Joined"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">No users found</td></tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{u.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${tierBadge(u.tier)}`}>{u.tier || "free"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{u.credit_balance ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined ? new Date(u.joined).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {users && <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">{filtered.length} of {users.length} users</div>}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function AdminHub() {
  const [tab, setTab] = useState("overview");
  const active = TABS.find(t => t.id === tab);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-base font-semibold leading-none">GLIMR Admin</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">{active?.label}</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to app</Link>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-none pb-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col overflow-hidden">
        {tab === "overview"  && <Overview />}
        {tab === "orders"    && <OrdersTab />}
        {tab === "mia"       && <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-120px)]"><MiaChat /></div>}
        {tab === "marketing" && <Marketing />}
        {tab === "tools"     && <Tools />}
        {tab === "users"     && <UsersTab />}
      </main>
    </div>
  );
}
