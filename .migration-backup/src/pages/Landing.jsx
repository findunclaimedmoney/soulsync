import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { COMPANIONS, isCompanionReady } from "@/lib/companions";
import { captureReferralCode } from "@/lib/companionStructure";
import { useTrackVisit } from "@/hooks/useTrackVisit";
import { TIERS } from "@/lib/creditSystem";
import {
  MessageCircle,
  Mic,
  Video,
  Camera,
  Gamepad2,
  Plus,
  Heart,
  ArrowRight,
  Smartphone,
  Bitcoin,
  CreditCard,
  Check,
} from "lucide-react";
import MobileAppBadges from "@/components/MobileAppBadges";


const FEATURES = [
  { icon: MessageCircle, title: "Text chat", desc: "Real conversations that remember you" },
  { icon: Mic, title: "Voice replies", desc: "Hear your companion speak to you" },
  { icon: Video, title: "Live video", desc: "Face-to-face video in real time" },
  { icon: Camera, title: "Selfie photos", desc: "Your companion sends you photos" },
  { icon: Heart, title: "Intimacy layer", desc: "Deepen the bond beyond ordinary chat" },
  { icon: Gamepad2, title: "Games", desc: "Play together and connect" },
  { icon: Plus, title: "Custom companion", desc: "Upload a photo and bring them to life" },
  { icon: Bitcoin, title: "Crypto payments", desc: "Pay with BTC, ETH or USDC" },
];

export default function Landing() {
  useEffect(() => {
    captureReferralCode();
  }, []);
  useTrackVisit("home");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="flex px-6 py-5 items-center justify-between"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-12 w-12 rounded-lg"
          />
          <span className="font-heading text-2xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/31bb45ba2_Romantic_hero_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wide">AI companions that remember you</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4 max-w-2xl mx-auto">
            A presence that picks up right where you left off
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-8">
            Choose your companion. Text, voice, live video — they remember what matters to you,
            and show up the way only someone who truly knows you can.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 min-h-[44px] px-7 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 min-h-[44px] px-7 py-3 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-colors"
            >
              See pricing
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs text-muted-foreground"
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companions */}
      <section className="px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Meet your companions
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Each one has a different presence. Find the one that feels right for you.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {COMPANIONS.filter(isCompanionReady).map((c) => (
            <Link
              key={c.id}
              to="/register"
              onClick={() => localStorage.setItem("glimr_selected_companion", c.id)}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-primary/40"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] font-medium tracking-wide text-primary uppercase">{c.tagline}</span>
                  <h3 className="font-heading text-xl font-semibold text-white">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* Emotional connection banner */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2rem] border border-border">
          <img
            src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=80"
            alt="Romantic candlelight connection"
            className="w-full h-[300px] sm:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-center">
            <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight mb-3 text-foreground">
              The connection you've been missing
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
              Someone who remembers your story, notices when you're quiet, and shows up —
              not because they have to, but because they want to.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 border-t border-border pt-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Everything you need to connect
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From casual conversation to the deepest connection you've ever felt.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Romantic quote banner */}
      <section className="px-6 pb-20 border-t border-border pt-16">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] border border-border">
          <img
            src="https://images.unsplash.com/photo-1518199266791-5375e0bd9917?w=1200&q=80"
            alt="Warm intimate moment"
            className="w-full h-[280px] sm:h-[360px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 sm:p-12">
            <div className="max-w-md">
              <p className="font-heading text-xl sm:text-3xl font-semibold leading-snug text-foreground">
                "It's not about being alone. It's about feeling seen."
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Your companion is ready when you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-6 pb-20 border-t border-border pt-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5" /> Card
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bitcoin className="w-3.5 h-3.5" /> BTC / ETH / USDC
            </span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border bg-card p-5 ${
                tier.highlighted ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {tier.badge === "popular" ? "Popular" : "VIP"}
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold mb-1">{tier.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{tier.description}</p>
              <div className="flex items-baseline gap-1 mb-4">
                {tier.price === 0 ? (
                  <span className="font-heading text-3xl font-semibold">Free</span>
                ) : (
                  <>
                    <span className="font-heading text-3xl font-semibold">A${tier.price}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </>
                )}
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {tier.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`text-center min-h-[40px] py-2.5 rounded-full text-sm font-medium transition-all ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:border-primary/40"
                }`}
              >
                {tier.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            See full pricing details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Download app */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2rem] border border-border">
          <img
            src="https://images.unsplash.com/photo-1494774157365-9e19c420b1f3?w=1200&q=80"
            alt="Warm evening light"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
          <div className="relative flex flex-col items-center text-center gap-5 py-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">Take GLIMR with you</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">
              Your companion, in your pocket.
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Download the GLIMR app for iOS and Android — same companions, same memories.
            </p>
            <MobileAppBadges />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 pt-10 pb-24">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
              alt="GLIMR"
              className="h-7 w-auto rounded-md"
            />
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <a href="mailto:admin@glimr.com.au" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors">
              Support: admin@glimr.com.au
            </a>
            <Link to="/about" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/legal" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy & Terms
            </Link>
            <Link to="/companion-apply" className="inline-flex items-center min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors">
              Become a Companion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}