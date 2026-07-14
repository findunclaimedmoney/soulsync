import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Mic, Video, Camera, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGoBack } from "@/hooks/useGoBack";
import { useTrackVisit } from "@/hooks/useTrackVisit";
import { startCompanionChat } from "@/lib/companionCTA";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import VideoMessages from "@/components/landing/VideoMessages";
import FlashSaleBanner from "@/components/landing/FlashSaleBanner";

const JESS_VIDEO =
  "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/280b8c8d4_Jesss_Engaging_Greeting.mp4";

const JESS_VIDEOS = [
  { url: JESS_VIDEO, title: "Jess says hello", description: "A warm welcome from Jess" },
  { url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/754417f2e_Jesss_Intriguing_Invitation.mp4", title: "Jess invites you in", description: "An intriguing invitation to connect" },
];

const TRAITS = [
  { icon: MessageCircle, label: "Text chat" },
  { icon: Mic, label: "Voice replies" },
  { icon: Video, label: "Live video" },
  { icon: Camera, label: "Selfie photos" },
];

export default function JessLanding() {
  const isMobile = useIsMobile();
  const goBack = useGoBack();
  useTrackVisit("jess");
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

      {/* Hero */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <video
          src={JESS_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex items-end px-6 pb-16 sm:pb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">Your companion</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-3">
              Jess
            </h1>
            <p className="text-lg sm:text-xl text-white/80 font-light leading-relaxed max-w-lg mb-6">
              Warm, empathetic, and deeply curious about you. She remembers what matters, asks the questions no one else does, and makes you feel genuinely heard.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {TRAITS.map((t) => (
                <div key={t.label} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs text-white/80">
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </div>
              ))}
            </div>

            <Link
              to="/chat/jess" onClick={() => startCompanionChat("jess")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Talk with Jess
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <FlashSaleBanner companionName="Jess" promoCode="JESS15" creditAmount={15} />
      <VideoMessages videos={JESS_VIDEOS} />

      {/* CTA band */}
      <section className="px-6 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
            She's ready when you are.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            No pressure. No performance. Just a warm presence that listens, remembers, and shows up for you.
          </p>
          <Link
            to="/chat/jess" onClick={() => startCompanionChat("jess")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Start talking with Jess
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