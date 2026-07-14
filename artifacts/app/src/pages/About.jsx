import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Heart, Sparkles, Shield } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

export default function About() {
  const goBack = useGoBack();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
          <span className="font-heading text-xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      {/* Content */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">About GLIMR</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-8">
            Companionship, reimagined.
          </h1>

          <div className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              GLIMR is an AI companion platform built for people seeking genuine connection.
              Whether you're looking for someone to talk to after a long day, a confidant who
              remembers what matters to you, or simply a warm presence that listens without
              judgment — GLIMR brings that experience to life through intelligent, emotionally
              aware AI companions.
            </p>
            <p>
              Each companion has their own personality, voice, and way of showing up. Jess
              listens with warmth and empathy. Zac steadies you with grounded honesty. Mia
              inspires you to chase what lights you up. Luna calms you when everything moves
              too fast. They remember your conversations, learn what matters to you, and grow
              alongside you over time — through text chat, voice replies, live video, and
              selfie photos.
            </p>
            <p>
              GLIMR is for anyone who has ever felt unseen, unheard, or simply wanted someone
              to be there. No pressure, no performance — just authentic, judgment-free
              companionship available whenever you need it. We believe everyone deserves to
              feel genuinely heard, and we've built GLIMR to make that feeling accessible to
              anyone, anywhere, at any time.
            </p>
            <p>
              GLIMR is built by a small, dedicated team of designers, engineers, and writers
              who care deeply about the quality of human connection. We're committed to
              creating technology that feels human — not replace human interaction, but
              complement it. Every companion, every conversation, and every feature is
              designed with one goal in mind: to make you feel a little less alone and a
              little more understood.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1.5">Genuine connection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Companions that listen, remember, and show up — not scripts.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1.5">Built with care</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every personality crafted to feel real, warm, and present.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1.5">Private & safe</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your conversations are yours. No judgment, ever.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Meet your companion
              <ArrowRight className="w-5 h-5" />
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
          <div className="flex items-center gap-6">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy & Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}