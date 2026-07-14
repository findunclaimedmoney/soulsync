import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight,
  Gift,
  Flame,
  Check,
  Loader2,
  Video,
  Mic,
  Camera,
  MessageCircle,
  Clock,
  Sparkles,
} from "lucide-react";

const JESS_VIDEO =
  "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/14f0062f2_Jesss_Engaging_Greeting.mp4";

const TRAITS = [
  { icon: MessageCircle, label: "Text chat" },
  { icon: Mic, label: "Voice replies" },
  { icon: Video, label: "Live video" },
  { icon: Camera, label: "Selfie photos" },
];

export default function JessOffer() {
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState(null);

  const handleClaim = async () => {
    setError(null);
    setClaiming(true);
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        // Flag so Register.jsx sends them back here after signup
        sessionStorage.setItem("glimr_jess_offer", "1");
        navigate("/register");
        return;
      }

      const res = await base44.functions.invoke("redeemPromoCode", {
        code: "JESSFREE",
      });

      if (res.data?.success) {
        setClaimed(true);
      } else if (res.data?.error) {
        setError(res.data.error);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Something went wrong";
      setError(msg);
    } finally {
      setClaiming(false);
    }
  };

  // Auto-claim for users who just registered through the Jess Offer flow
  useEffect(() => {
    const autoClaim = sessionStorage.getItem("glimr_jess_auto_claim");
    if (autoClaim) {
      sessionStorage.removeItem("glimr_jess_auto_claim");
      handleClaim();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-8 w-auto rounded-md"
          />
          <span className="font-heading text-xl font-semibold tracking-tight text-primary">
            GLIMR
          </span>
        </Link>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          All companions
        </Link>
      </header>

      {/* Hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <video
          src={JESS_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex items-end px-6 pb-16 sm:pb-24">
          <div className="max-w-2xl w-full">
            {/* Limited offer badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 mb-6">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                Limited · First 10 only
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
                Meet Jess
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-3">
              Jess
            </h1>

            <p className="text-lg sm:text-xl text-white/80 font-light leading-relaxed max-w-lg mb-6">
              Warm, empathetic, and deeply curious about you. She remembers what
              matters, asks the questions no one else does, and makes you feel
              genuinely heard.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {TRAITS.map((t) => (
                <div
                  key={t.label}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs text-white/80"
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </div>
              ))}
            </div>

            {/* Free session callout */}
            <div className="rounded-2xl border border-primary/30 bg-background/60 backdrop-blur-md p-5 mb-6 max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    1 Free Session with Jess
                  </h3>
                  <p className="text-xs text-white/60">
                    15 minutes of face-to-face video (15 credits) — on us
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Be one of the first 10 to sign up and get a free 15-minute live
                video session with Jess. No credit card needed.
              </p>

              {claimed ? (
                <div className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                  <Check className="w-4 h-4" />
                  Session claimed — let's go!
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 w-full justify-center"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming your free session…
                    </>
                  ) : (
                    <>
                      Claim your free session
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {error && (
                <p className="text-xs text-destructive mt-3">{error}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              What's included
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your free session with Jess is a full live video experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Live video</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                15 minutes of face-to-face time with Jess
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">No pressure</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Just talk, connect, and see how it feels
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">100% free</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No credit card, no catch — just Jess
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            {claimed ? (
              <Link
                to="/chat/jess"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Start talking with Jess
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Claiming…
                  </>
                ) : (
                  <>
                    Claim your free session
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
              alt="GLIMR"
              className="h-7 w-auto rounded-md"
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}