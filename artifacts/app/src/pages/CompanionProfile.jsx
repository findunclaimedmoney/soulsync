import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, MessageCircle, Mic, Video, Camera, ChevronLeft } from "lucide-react";
import { getCompanionAsync } from "@/lib/companions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGoBack } from "@/hooks/useGoBack";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const TRAITS = [
  { icon: MessageCircle, label: "Text chat" },
  { icon: Mic, label: "Voice replies" },
  { icon: Video, label: "Live video" },
  { icon: Camera, label: "Selfie photos" },
];

export default function CompanionProfile() {
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const goBack = useGoBack();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanionAsync(slug)
      .then((c) => setCompanion(c))
      .catch(() => setCompanion(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Companion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="absolute top-0 left-0 right-0 z-20 px-6 flex items-center justify-between"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "1.25rem" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-12 w-12 rounded-lg"
          />
          <span className="font-heading text-2xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          All companions
        </button>
      </header>

      {/* Hero */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        {companion.video_url ? (
          <video
            src={companion.video_url}
            poster={companion.image || undefined}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
          />
        ) : companion.image ? (
          <img
            src={companion.image}
            alt={companion.name}
            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex items-end px-6 pb-16 sm:pb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
                Your companion
              </span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-3">
              {companion.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 font-light leading-relaxed max-w-lg mb-6">
              {companion.subtitle || companion.description}
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

            <Link
              to={`/chat/${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Talk with {companion.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video gallery — shown when companion has multiple clips */}
      {companion.videos && companion.videos.length > 1 && (
        <section className="px-6 py-16 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-2">
              More of {companion.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Get to know {companion.name} a little better.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companion.videos.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden border border-border bg-black aspect-[9/16] sm:aspect-video"
                >
                  <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="px-6 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
            {companion.tagline}.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            {companion.description}
          </p>
          <Link
            to={`/chat/${slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Start talking with {companion.name}
            <ArrowRight className="w-5 h-5" />
          </Link>
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
          {isMobile ? (
            <Accordion type="single" collapsible className="w-full max-w-xs">
              <AccordionItem value="footer-nav" className="border-b-0">
                <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
                  Navigation
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 pb-2">
                  <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                  <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                  <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy & Terms
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy & Terms
              </Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}