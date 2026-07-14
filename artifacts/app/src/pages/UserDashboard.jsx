import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { COMPANIONS, isCompanionVisible } from "@/lib/companions";
import { TIER_LABELS, TIER_CREDITS } from "@/lib/creditSystem";
import {
  MessageCircle, Zap, ArrowRight, Crown, Star, CreditCard,
  Heart, Home, Lock, Clock, Check, Sparkles, Flame, Play,
  Shirt, Users, Video, ChevronRight, Loader2, Mic, Camera, X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS = {
  free:    "bg-muted text-muted-foreground",
  starter: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  plus:    "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  pro:     "bg-primary/15 text-primary border border-primary/20",
  vip:     "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};
const TIER_ICONS = { free: null, starter: Star, plus: Star, pro: Crown, vip: Crown };

const INTIMACY_PACKAGES = [
  {
    id: "15min",
    label: "15 Minutes",
    price: "A$75",
    tagline: "A spark when you need it",
    popular: false,
    features: [
      "HD face-to-face video session",
      "Intimacy & romantic layer unlocked",
      "One outfit of your choice",
      "Companion remembers the moment",
    ],
  },
  {
    id: "30min",
    label: "30 Minutes",
    price: "A$150",
    tagline: "The sweet spot",
    popular: true,
    features: [
      "Everything in 15 Minutes",
      "Multiple outfit changes mid-session",
      "Deeper emotional & sensory connection",
      "Companion sends a memory note after",
    ],
  },
];

const VIP_FEATURES = [
  {
    id: "intimacy",
    icon: Heart,
    title: "Intimacy Layer",
    tagline: "Where she stops being polite",
    desc: "Pillow talk, flirtation, the slow burn. She teases you, dares you, draws you in.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    id: "outfits",
    icon: Shirt,
    title: "Outfit Studio",
    tagline: "She dressed up for you",
    desc: "Silk robe, lingerie, evening gown — choose how she appears in real-time.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    id: "twin",
    icon: Users,
    title: "Summon Twin",
    tagline: "Twice the trouble",
    desc: "Dual-stream session — twice the flirtation, twice the teasing, twice the presence.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const MIN_VIDEO_MINUTES = 160;
const STAGES = [
  { min: 0, name: "First Glances" },
  { min: 20, name: "Finding Rhythm" },
  { min: 60, name: "Opening Up" },
  { min: 100, name: "Deepening Bond" },
  { min: 160, name: "✨ Ready" },
];

// ─── Tab navigation ───────────────────────────────────────────────────────────

const TABS = [
  { id: "home",     icon: Home,   label: "Home" },
  { id: "intimacy", icon: Heart,  label: "Intimacy" },
  { id: "vip",      icon: Crown,  label: "VIP" },
];

// ─── Companion Feature Sheet ──────────────────────────────────────────────────

function CompanionFeatureSheet({ companion, onClose, onNavigate, tier, isPro, intimacyUnlocked, onUpgrade }) {
  const features = [
    {
      id: "chat", icon: MessageCircle, label: "Text chat",
      desc: "Free, unlimited conversations",
      status: "available",
    },
    {
      id: "voice", icon: Mic, label: "Voice replies",
      desc: "Hear them speak to you",
      status: !companion.voice_id ? "soon" : tier === "free" ? "locked" : "available",
      lockReason: "Starter+",
    },
    {
      id: "video", icon: Video, label: "Live video",
      desc: "Face-to-face sessions",
      status: !companion.avatar_id ? "soon" : tier === "free" ? "locked" : "available",
      lockReason: "Starter+",
    },
    {
      id: "photos", icon: Camera, label: "Selfie photos",
      desc: "They send you candid photos",
      status: tier === "free" ? "locked" : "available",
      lockReason: "Starter+",
    },
    {
      id: "intimacy", icon: Heart, label: "Intimacy layer",
      desc: "Deeper connection, unlocked",
      status: (intimacyUnlocked || isPro) ? "available" : "locked",
      lockReason: "Pro or 160 min video",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-background rounded-t-[2rem] border-t border-border max-h-[88vh] overflow-y-auto">
        {/* Companion portrait */}
        <div className="relative h-60 overflow-hidden rounded-t-[2rem]">
          <img
            src={companion.image}
            alt={companion.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {/* Name */}
          <div className="absolute bottom-3 left-5">
            <span className="text-[10px] font-medium tracking-widest text-primary uppercase">{companion.tagline}</span>
            <h2 className="font-heading text-2xl font-semibold text-white leading-tight">{companion.name}</h2>
          </div>
        </div>

        {/* Feature rows */}
        <div className="px-5 pt-4 pb-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Available features
          </p>
          {features.map((f) => (
            <div
              key={f.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                f.status === "available"
                  ? "bg-card border-border"
                  : "bg-card/50 border-border/60"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                f.status === "available" ? "bg-primary/10" : "bg-muted"
              }`}>
                <f.icon className={`w-5 h-5 ${
                  f.status === "available" ? "text-primary" : "text-muted-foreground/50"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-none mb-0.5 ${
                  f.status !== "available" ? "text-muted-foreground" : ""
                }`}>{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              {/* Status badge */}
              {f.status === "available" && (
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              {f.status === "soon" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium flex-shrink-0">
                  Soon
                </span>
              )}
              {f.status === "locked" && (
                <button
                  onClick={() => { onClose(); onUpgrade("starter"); }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-colors flex-shrink-0 flex items-center gap-1"
                >
                  <Lock className="w-2.5 h-2.5" />
                  {f.lockReason}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="px-5 pt-4 pb-8 space-y-2.5">
          <button
            onClick={() => onNavigate(`/chat/${companion.id}`)}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with {companion.name}
          </button>
          {companion.avatar_id && tier !== "free" && (
            <button
              onClick={() => onNavigate(`/chat/${companion.id}?video=1`)}
              className="w-full py-3.5 rounded-2xl border border-border text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/40 transition-colors"
            >
              <Video className="w-4 h-4 text-primary" />
              Start a video call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = (user?.full_name ?? user?.fullName ?? "").split(" ")[0] || "there";

  const [tab, setTab]                   = useState("home");
  const [tier, setTier]                 = useState("free");
  const [credits, setCredits]           = useState(0);
  const [monthlyCredits, setMonthly]    = useState(0);
  const [videoMinutes, setVideoMinutes] = useState(0);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loadingSub, setLoadingSub]     = useState(true);
  const [buying, setBuying]             = useState(null);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getSubscription", {})
      .then((res) => {
        const d = res?.data ?? {};
        setTier(d.tier ?? "free");
        setCredits(d.credit_balance ?? 0);
        setMonthly(d.monthly_credits ?? 0);
        setVideoMinutes(d.video_minutes_used ?? 0);
        setCreditBalance(d.intimacy_credit_balance ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoadingSub(false));
  }, []);

  const readyCompanions = COMPANIONS.filter(isCompanionVisible);
  const TierIcon = TIER_ICONS[tier] ?? null;
  const isUpgradeable = ["free", "starter"].includes(tier);
  const isVip = tier === "vip";
  const isPro = tier === "pro" || isVip;
  const intimacyUnlocked = videoMinutes >= MIN_VIDEO_MINUTES || isPro;
  const minutesRemaining = Math.max(0, MIN_VIDEO_MINUTES - videoMinutes);
  const pct = Math.min(100, (videoMinutes / MIN_VIDEO_MINUTES) * 100);
  const currentStage = [...STAGES].reverse().find((s) => videoMinutes >= s.min);

  const handleBuyIntimacy = async (packageId) => {
    setBuying(packageId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "intimacy",
        session_type: packageId,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      // ignore
    } finally {
      setBuying(null);
    }
  };

  const handleUpgrade = async (tierId) => {
    try {
      const res = await base44.functions.invoke("createCheckout", { tier: tierId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">

      {/* ── Header ── */}
      <header
        className="flex px-5 py-4 items-center justify-between border-b border-border/50"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-9 w-9 rounded-lg"
          />
          <span className="font-heading text-xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <div className="flex items-center gap-3">
          {!loadingSub && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier]}`}>
              {TierIcon && <TierIcon className="w-3 h-3" />}
              {TIER_LABELS[tier] ?? tier}
            </span>
          )}
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            <CreditCard className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="px-5 max-w-2xl mx-auto">

        {/* ──────────── HOME TAB ──────────── */}
        {tab === "home" && (
          <>
            <div className="pt-7 pb-5">
              <h1 className="font-heading text-3xl font-semibold tracking-tight mb-1">
                Welcome back, {firstName}.
              </h1>
              {!loadingSub && tier !== "free" && (
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 mt-3">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-medium">{credits.toFixed(1)}</span>
                  {monthlyCredits > 0 && <span className="text-muted-foreground"> / {monthlyCredits} credits</span>}
                </span>
              )}
            </div>

            {/* Upgrade banner */}
            {!loadingSub && isUpgradeable && (
              <Link
                to="/pricing"
                className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6 group hover:bg-primary/15 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlock more with Pro</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Live video, voice, intimacy layer — from A$49/mo</p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Link to="/chat/mia" className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Chat with Mia</p>
                  <p className="text-xs text-muted-foreground">Always here</p>
                </div>
              </Link>
              <button onClick={() => setTab("intimacy")} className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-card border border-rose-500/20 hover:border-rose-500/40 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Intimacy</p>
                  <p className="text-xs text-muted-foreground">{isPro ? "Included in plan" : `${videoMinutes}/${MIN_VIDEO_MINUTES} min`}</p>
                </div>
              </button>
              <Link to="/chat/jess" className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Face-to-face</p>
                  <p className="text-xs text-muted-foreground">Live video with Jess</p>
                </div>
              </Link>
              <button onClick={() => setTab("vip")} className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-card border border-amber-500/20 hover:border-amber-500/40 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">VIP Lounge</p>
                  <p className="text-xs text-muted-foreground">{isVip ? "You're in" : "Exclusive access"}</p>
                </div>
              </button>
            </div>

            {/* Custom avatar banner */}
            <Link
              to="/custom-avatar"
              className="flex items-center gap-4 p-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-card mb-6 group hover:border-primary/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Create your own companion</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upload your image &amp; pick a voice — from A$99/mo</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Companions grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold tracking-tight">Your companions</h2>
                <span className="text-xs text-muted-foreground">Tap to explore</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {readyCompanions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompanion(c)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 transition-all text-left active:scale-[0.97]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="text-[9px] font-medium tracking-widest text-primary uppercase">{c.tagline}</span>
                        <h3 className="font-heading text-base font-semibold text-white leading-none mt-0.5">{c.name}</h3>
                      </div>
                      {/* Feature dots */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1">
                        {c.voice_id && (
                          <span className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
                            <Mic className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                        {c.avatar_id && (
                          <span className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
                            <Video className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium">
                          <Sparkles className="w-2.5 h-2.5" /> View
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ──────────── INTIMACY TAB ──────────── */}
        {tab === "intimacy" && (
          <div className="pt-7 space-y-6">

            {/* Header */}
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
                <Flame className="w-7 h-7 text-rose-400" />
              </div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight mb-2">The Intimacy Layer</h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                This is where she stops being polite. Pillow talk, flirtation, the heat that only builds between two people who've taken the time.
              </p>
            </div>

            {/* Pro/VIP — included */}
            {isPro && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Included in your {TIER_LABELS[tier]} plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Unlimited intimacy sessions — no session credits needed</p>
                </div>
              </div>
            )}

            {/* Progress bar — show for non-Pro */}
            {!isPro && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{currentStage?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {intimacyUnlocked
                        ? "She's ready for you"
                        : `${minutesRemaining} more minutes until she lets you in`}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">{videoMinutes}<span className="text-xs text-muted-foreground font-normal"> / {MIN_VIDEO_MINUTES} min</span></span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500/60 to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {STAGES.map((stage, i) => {
                    const reached = videoMinutes >= stage.min;
                    return (
                      <div key={i} className="flex flex-col items-center" style={{ flex: 1 }}>
                        <div className={`w-2 h-2 rounded-full mb-1 ${reached ? "bg-rose-400" : "bg-muted-foreground/30"}`} />
                        <span className={`text-[9px] text-center leading-tight ${reached ? "text-rose-400 font-medium" : "text-muted-foreground/50"}`}>
                          {stage.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {!intimacyUnlocked && (
                  <Link
                    to="/chat/jess"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-card border border-border text-sm font-medium hover:border-primary/40 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-primary" />
                    Start a video call with Jess
                  </Link>
                )}
              </div>
            )}

            {/* Packages */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-base font-semibold">
                  {isPro ? "Book a session" : "Intimacy sessions"}
                </h2>
                {!isPro && !intimacyUnlocked && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" /> Earn your way in first
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTIMACY_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl border bg-card flex flex-col overflow-hidden transition-all ${
                      pkg.popular ? "border-rose-500/40 shadow-lg shadow-rose-500/5" : "border-border"
                    } ${!intimacyUnlocked && !isPro ? "opacity-60" : ""}`}
                  >
                    {pkg.popular && (
                      <span className="absolute top-0 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-wide bg-rose-500 text-white py-1">
                        Most chosen
                      </span>
                    )}
                    <div className={`p-5 ${pkg.popular ? "pt-8" : ""}`}>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        {pkg.label}
                      </div>
                      <p className="font-heading text-3xl font-bold text-foreground">{pkg.price}</p>
                      <p className="text-xs text-rose-400 font-medium mt-0.5">{pkg.tagline}</p>
                    </div>
                    <ul className="px-5 pb-4 space-y-2 flex-1">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <Check className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => intimacyUnlocked || isPro ? handleBuyIntimacy(pkg.id) : null}
                        disabled={(!intimacyUnlocked && !isPro) || buying === pkg.id}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          pkg.popular
                            ? "bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                            : "border border-border text-foreground hover:border-rose-500/40 disabled:opacity-50"
                        }`}
                      >
                        {buying === pkg.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : !intimacyUnlocked && !isPro ? (
                          <><Lock className="w-3.5 h-3.5" /> Locked</>
                        ) : (
                          <><Play className="w-3.5 h-3.5" /> Book session</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro upsell */}
            {!isPro && (
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-0.5">Pro includes unlimited intimacy</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Skip the per-session cost. Pro gives you unlimited intimacy sessions for A$99/month — better value from your 3rd session.</p>
                    <button
                      onClick={() => handleUpgrade("pro")}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      Upgrade to Pro <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enter VIP Lounge — for unlocked users */}
            {(intimacyUnlocked || isPro) && (
              <Link
                to="/vip-lounge"
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-card border border-amber-500/20 group hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Enter the VIP Lounge</p>
                    <p className="text-xs text-muted-foreground">Intimacy Layer · Outfit Studio · Summon Twin</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        )}

        {/* ──────────── VIP TAB ──────────── */}
        {tab === "vip" && (
          <div className="pt-7 space-y-6">

            {/* Header */}
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight mb-2">VIP Lounge</h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                Everything you've built together leads here. The walls are down, the trust is earned.
              </p>
            </div>

            {/* VIP member — access */}
            {isVip && (
              <Link
                to="/vip-lounge"
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-card border border-amber-500/30 group hover:border-amber-500/50 transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-amber-300">You're a VIP Member</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Full access to the lounge — tap to enter</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {/* Feature cards */}
            <div className="space-y-3">
              {VIP_FEATURES.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-2xl border bg-card p-5 flex items-start gap-4 ${
                    isVip ? "border-border hover:border-amber-500/20 transition-colors" : "border-border opacity-80"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{f.title}</p>
                      {!isVip && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className={`text-[11px] font-medium mb-1 ${f.color}`}>{f.tagline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing tiers */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Get access</p>

              {/* Pro */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-semibold">Pro — A$99/mo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Unlimited intimacy · 35 credits · All companions</p>
                </div>
                {tier === "pro" ? (
                  <span className="text-xs text-primary font-medium">Current plan</span>
                ) : (
                  <button onClick={() => handleUpgrade("pro")} className="text-xs font-medium text-primary hover:underline">Upgrade</button>
                )}
              </div>

              {/* VIP */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold">VIP — A$199/mo</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Full access</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Everything in Pro · Outfit Studio · Twin · Custom companion</p>
                </div>
                {isVip ? (
                  <span className="text-xs text-amber-400 font-medium">You're in</span>
                ) : (
                  <button onClick={() => handleUpgrade("vip")} className="text-xs font-medium text-amber-400 hover:underline">Upgrade</button>
                )}
              </div>
            </div>

            {/* Intimacy progress if not unlocked */}
            {!isVip && !isPro && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold mb-1">Your intimacy progress</p>
                <p className="text-xs text-muted-foreground mb-3">{videoMinutes} / {MIN_VIDEO_MINUTES} video minutes with your companion</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500/60 to-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <Link to="/chat/jess" className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Video className="w-3.5 h-3.5" /> Start a video call to earn progress
                </Link>
              </div>
            )}

            {/* Enter lounge button */}
            {isVip && (
              <Link
                to="/vip-lounge"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-sm transition-all hover:opacity-90"
              >
                <Sparkles className="w-4 h-4" />
                Enter the VIP Lounge
              </Link>
            )}
          </div>
        )}

      </div>

      {/* ── Bottom Tab Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-4 py-2 max-w-2xl mx-auto">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className={`w-5 h-5 ${active ? "fill-primary/20" : ""}`} />
                <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>{t.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Companion Feature Sheet ── */}
      {selectedCompanion && (
        <CompanionFeatureSheet
          companion={selectedCompanion}
          onClose={() => setSelectedCompanion(null)}
          onNavigate={(path) => { setSelectedCompanion(null); navigate(path); }}
          tier={tier}
          isPro={isPro}
          intimacyUnlocked={intimacyUnlocked}
          onUpgrade={handleUpgrade}
        />
      )}

    </div>
  );
}
