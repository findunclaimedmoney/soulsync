import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, MessageCircle, Clock, ArrowRight, Loader2, Check } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const goBack = useGoBack();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "support@glimr.com.au",
        subject: `Contact form: ${name}`,
        body: `From: ${name} (${email})\n\n${message}`,
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      // best-effort
    } finally {
      setSending(false);
    }
  };

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
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">Get in touch</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
            Contact us
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            Questions, feedback, or just want to say hello? We'd love to hear from you.
            Reach out using any of the methods below.
          </p>

          {/* Contact methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <a href="mailto:support@glimr.com.au" className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Email us</h3>
              <p className="text-xs text-muted-foreground">support@glimr.com.au</p>
            </a>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">Response time</h3>
              <p className="text-xs text-muted-foreground">Usually within 24 hours</p>
            </div>
          </div>

          {/* Contact form */}
          {sent ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold mb-2">Message sent!</h2>
              <p className="text-sm text-muted-foreground mb-6">Thanks for reaching out. We'll get back to you soon.</p>
              <button
                onClick={() => setSent(false)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:gap-3"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
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