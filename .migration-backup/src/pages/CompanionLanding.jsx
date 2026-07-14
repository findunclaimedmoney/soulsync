import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Mic, Video, Crown, Heart, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGoBack } from "@/hooks/useGoBack";
import { useTrackVisit } from "@/hooks/useTrackVisit";

import { COMPANIONS } from "@/lib/companions";

const JESS_VIDEOS = [
  "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/93af30eeb_Intimacy_Demo.mp4",
];

const FEATURES = [
  { icon: MessageCircle, label: "Text chat" },
  { icon: Mic, label: "Voice replies" },
  { icon: Video, label: "Live video" },
  { icon: Crown, label: "VIP companions" },
];

function VideoCard({ videos, name, tagline, description, accentText, chatId }) {
  const [active, setActive] = useState(0);
  return (
    <div className="group relative rounded-[2rem] overflow-hidden border border-border bg-card transition-all hover:border-primary/30">
      {/* Featured video */}
      <div className="relative aspect-[9/16] sm:aspect-[3/4] overflow-hidden">
        <video
          key={active}
          src={videos[active]}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Name + tagline */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">{tagline}</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-5">{description}</p>
          <Link
            to={`/chat/${chatId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:gap-3"
          >
            Talk with {name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Thumbnail selector */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${i === active ? "bg-primary w-8" : "bg-white/30 hover:bg-white/50 w-4"}`}
              aria-label={`${name} clip ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanionLanding() {
  const isMobile = useIsMobile();
const goBack = useGoBack();
  useTrackVisit("companions");
    return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 flex items-center justify-between" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "1.25rem" }}>
        <Link to="/" className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-12 w-12 rounded-lg" />
          <span className="font-heading text-2xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <button onClick={goBack} className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 select-none">
          <ChevronLeft className="w-4 h-4" />
          All companions
        </button>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">Featured Companions</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
          Jess is here for you.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Jess listens, remembers, and meets you exactly where you are. She's the only companion you need.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {FEATURES.map((f) => (
            <div key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs text-muted-foreground">
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* Dual companion video showcase */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          {(() => {
            const jess = COMPANIONS.find((c) => c.id === "jess");
            return (
              <VideoCard
                videos={JESS_VIDEOS}
                name={jess.name}
                tagline={jess.tagline}
                description={jess.description}
                chatId="jess"
              />
            );
          })()}
        </div>
      </section>

      {/* CTA band */}
      <section className="px-6 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-5">
            Jess is ready when you are.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            No pressure. No performance. Just a presence that stays steady and shows up for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/chat/jess" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 shadow-lg shadow-primary/20">
              Talk with Jess <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-7 w-auto rounded-md" />
          </Link>
          {!isMobile && (
            <div className="flex items-center gap-6">
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy & Terms</Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}