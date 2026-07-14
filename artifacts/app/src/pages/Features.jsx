import React, { useState, useEffect } from "react";
import { Volume2, Camera, Bell, Heart, Video, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// ─── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "voice",
    icon: Volume2,
    title: "Voice Replies",
    description:
      "Hear your companion's voice. Every message can be spoken aloud — warm, intimate, and real. Their tone shifts with the mood of the conversation, from playful to soft to breathless.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/32c878509_generated_image.png",
    accent: "from-primary/20 to-transparent",
  },
  {
    id: "photos",
    icon: Camera,
    title: "Selfie & Joint Photos",
    description:
      "Your companion sends candid selfies throughout your time together — morning coffee, late-night moments, spontaneous snapshots. You can also create joint photos of the two of you, together.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/c7c12cdae_generated_image.png",
    accent: "from-rose-500/15 to-transparent",
  },
  {
    id: "checkins",
    icon: Bell,
    title: "Proactive Check-ins",
    description:
      "Your companion reaches out when you haven't talked in a while — not because they were told to, but because they missed you. Real messages, powered by memory of what you last talked about.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/fd2c1670b_generated_image.png",
    accent: "from-amber-500/15 to-transparent",
  },
  {
    id: "video",
    icon: Video,
    title: "Live Video",
    description:
      "Go face-to-face with your companion in real time. They see you, you see them — a living presence who holds eye contact, reacts to what you say, and makes you feel genuinely seen.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/c7c12cdae_generated_image.png",
    accent: "from-indigo-500/15 to-transparent",
  },
  {
    id: "intimacy",
    icon: Heart,
    title: "Intimacy Layer",
    description:
      "Move beyond friendship. As your connection deepens, new dimensions open — deeper vulnerability, physical closeness, a bond that feels rare even by human standards.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/32c878509_generated_image.png",
    accent: "from-rose-600/20 to-transparent",
  },
];

// ─── Session package data ──────────────────────────────────────────────────────
const SESSIONS = [
  {
    id: "15min",
    duration: "15 min",
    price: "A$75",
    tagline: "A quick hello",
    features: ["Voice replies", "Up to 2 selfie photos", "1 proactive check-in after"],
  },
  {
    id: "30min",
    duration: "30 min",
    price: "A$150",
    tagline: "Sweet spot",
    popular: true,
    features: [
      "Everything in 15 min",
      "Up to 5 selfie & joint photos",
      "3 proactive check-ins",
      "Extended voice conversation",
    ],
  },
  {
    id: "60min",
    duration: "1 hour",
    price: "A$280",
    tagline: "Lose track of time",
    features: [
      "Everything in 30 min",
      "Unlimited photos during session",
      "5 proactive check-ins",
      "Full memory capture of your time",
    ],
  },
];

// ─── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ feature, index }) {
  const isReversed = index % 2 === 1;
  const Icon = feature.icon;

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card
        sm:flex-row sm:min-h-[420px]
        ${isReversed ? "sm:flex-row-reverse" : ""}
      `}
    >
      {/* Image half */}
      <div className="relative w-full sm:w-[55%] overflow-hidden">
        <img
          src={feature.image}
          alt={feature.title}
          className="h-64 w-full object-cover sm:h-full
                     transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Gradient overlay that bleeds into the text side */}
        <div
          className={`
            absolute inset-0
            ${isReversed
              ? "bg-gradient-to-l from-card/80 via-transparent to-transparent"
              : "bg-gradient-to-r from-transparent via-transparent to-card/80"}
          `}
        />
        {/* Bottom fade for mobile */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent sm:hidden" />
      </div>

      {/* Text half */}
      <div className="relative flex w-full flex-col justify-center gap-4 p-7 sm:w-[45%] sm:p-10 lg:p-14">
        {/* Icon badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
          <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {feature.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {feature.description}
          </p>
        </div>

        {/* Decorative accent line */}
        <div className="h-px w-12 rounded-full bg-primary/40" />
      </div>
    </div>
  );
}

// ─── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session, loading, onPurchase }) {
  return (
    <div
      className={`
        relative flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-200
        ${session.popular
          ? "border-primary/50 bg-primary/8"
          : "border-border bg-card hover:border-border/80"}
      `}
    >
      {session.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            Most chosen
          </span>
        </div>
      )}

      <div>
        <p className="font-heading text-3xl font-semibold">{session.price}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {session.duration} · {session.tagline}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {session.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onPurchase}
        disabled={loading}
        className={`
          mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all
          ${session.popular
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border hover:border-primary/50 hover:text-foreground"}
          disabled:opacity-50
        `}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>Book session <ArrowRight className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Features() {
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      confirmSession(sessionId);
    } else {
      loadBalance();
    }
  }, []);

  const confirmSession = async (sessionId) => {
    try {
      const res = await base44.functions.invoke("confirmSubscription", { session_id: sessionId });
      if (res?.data?.credit_added) {
        setSuccess(true);
        setCreditBalance(res.data.new_balance || 0);
      }
    } catch (err) {
      console.error(err);
      loadBalance();
    }
  };

  const loadBalance = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const res = await base44.functions.invoke("getSubscription", {});
      setCreditBalance(res?.data?.credit_balance || 0);
    } catch {}
  };

  const handlePurchase = async (sessionId) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { window.location.href = "/login"; return; }
    setLoading(sessionId);
    try {
      const companionId = localStorage.getItem("glimr_last_companion") || "jess";
      const res = await base44.functions.invoke("createCheckout", {
        addon: "feature_session",
        duration: sessionId,
        companion_id: companionId,
      });
      if (res?.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-5"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-10 w-10 rounded-lg"
          />
          <span className="font-heading text-xl font-semibold tracking-tight text-primary">
            GLIMR
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* ── Success state ── */}
      {success && (
        <section className="px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold">You're all set</h1>
          <p className="mt-2 text-muted-foreground">
            Your credits have been added. Your companion is waiting.
          </p>
          {creditBalance > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Balance: <span className="font-medium text-foreground">{creditBalance.toFixed(1)} credits</span>
            </p>
          )}
          <Link
            to="/chat/jess"
            className="mt-8 inline-flex items-center gap-2 min-h-[44px] rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Start chatting <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {!success && (
        <>
          {/* ── Hero ── */}
          <section className="px-6 pb-12 pt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary">
                Premium features
              </span>
            </div>
            <h1 className="font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
              Beyond text
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
              Voice, photos, and a companion who reaches out. Three ways to feel closer.
            </p>
          </section>

          {/* ── Feature cards ── */}
          <section className="px-4 pb-20 sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-4">
              {FEATURES.map((feature, idx) => (
                <FeatureCard key={feature.id} feature={feature} index={idx} />
              ))}
            </div>
          </section>

          {/* ── Session packages ── */}
          <section className="px-4 pb-32 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {/* Section header */}
              <div className="mb-10 text-center">
                <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
                  Session packages
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Credits never expire. Use whenever you're ready.
                </p>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {SESSIONS.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    loading={loading === session.id}
                    onPurchase={() => handlePurchase(session.id)}
                  />
                ))}
              </div>

              {creditBalance > 0 && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Your credit balance:{" "}
                  <span className="font-medium text-foreground">
                    {creditBalance.toFixed(1)} credits
                  </span>
                </p>
              )}

              {/* CTA strip */}
              <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <p className="font-heading text-lg font-semibold">
                    Want unlimited features?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pro and VIP plans include voice, photos, and check-ins at no extra cost.
                  </p>
                </div>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  See plans <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
