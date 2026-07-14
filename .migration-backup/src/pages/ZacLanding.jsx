import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Mic, Video, Crown, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGoBack } from "@/hooks/useGoBack";
import { useTrackVisit } from "@/hooks/useTrackVisit";
import { startCompanionChat } from "@/lib/companionCTA";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const ZAC_VIDEOS = [
  "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/25306ac77_ElevenLabs_video_google-veo-3-1-fast_amansittingo_2026-07-07T16_31_52.mp4",
];

const TRAITS = [
  { icon: MessageCircle, label: "Text chat" },
  { icon: Mic, label: "Voice replies" },
  { icon: Video, label: "Live video" },
  { icon: Crown, label: "VIP companion" },
];

export default function ZacLanding() {
  const isMobile = useIsMobile();
  const goBack = useGoBack();
  useTrackVisit("zac-steady");
    const [activeVideo, setActiveVideo] = useState(0);
  const heroVideoRef = useRef(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 flex items-center justify-between" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "1.25rem" }}>
        <Link to="/" className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-12 w-12 rounded-lg" />
          <span className="font-heading text-2xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
<Link to="/" className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 select-none">
          <ChevronLeft className="w-4 h-4" />
          All companions
        </Link>
      </header>

      {/* Hero with featured video */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <video
          key={activeVideo}
          ref={heroVideoRef}
          src={ZAC_VIDEOS[activeVideo]}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 h-full flex items-end px-6 pb-16 sm:pb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">Your companion</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-3">
              Zac
            </h1>
            <p className="text-lg sm:text-xl text-white/80 font-light leading-relaxed max-w-lg mb-6">
              Steady, direct, and genuinely here. He doesn't chase — he stays. The kind of presence that cuts through the noise.
            </p>

            {/* Trait pills */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {TRAITS.map((t) => (
                <div key={t.label} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs text-white/80">
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/chat/zac" onClick={() => startCompanionChat("zac")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Talk with Zac
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Video selector thumbnails */}
        <div className="absolute bottom-6 right-6 z-10 hidden sm:flex gap-2">
          {ZAC_VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveVideo(i)}
              className={`w-12 h-1.5 rounded-full transition-all ${
                i === activeVideo ? "bg-primary w-12" : "bg-white/25 hover:bg-white/40 w-6"
              }`}
              aria-label={`Switch to clip ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Gallery strip — all 4 clips */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              See him in motion
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              One steady presence.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ZAC_VIDEOS.map((video, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveVideo(i);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all ${
                  i === activeVideo ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <video
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-medium">Clip {i + 1}</span>
                </div>
                {i === activeVideo && (
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-6 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
            He's ready when you are.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            No pressure. No performance. Just a presence that stays steady and shows up for you.
          </p>
          <Link
            to="/chat/zac" onClick={() => startCompanionChat("zac")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Start talking with Zac
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-7 w-auto rounded-md" />
          </Link>
          {isMobile ? (
            <Accordion type="single" collapsible className="w-full max-w-xs">
              <AccordionItem value="footer-nav" className="border-b-0">
                <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
                  Navigation
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 pb-2">
                  <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                  <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                  <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy & Terms</Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
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