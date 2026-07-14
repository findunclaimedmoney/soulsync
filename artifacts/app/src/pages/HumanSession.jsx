import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CreditCard, ScrollText, ShieldCheck, UserRoundCheck, Video } from "lucide-react";

const defaultScript = `Open warmly and introduce yourself.
Confirm the customer's name and what they need today.
Keep the conversation calm, respectful, and human.
Offer practical next steps without pretending to be medical, legal, or crisis support.
If they need urgent help, direct them to local emergency or crisis services.
Close by summarising what was agreed and where they can find account support.`;

const packages = [
  { name: "Human check-in", duration: "15 min", price: "$20", detail: "Quick help, reassurance, or account guidance." },
  { name: "Guided session", duration: "30 min", price: "$39", detail: "A longer live conversation with guided notes." },
  { name: "Deep support", duration: "60 min", price: "$75", detail: "Premium human time for higher-value customers." },
];

const humanSteps = [
  { title: "Customer pays", body: "Charge the same or higher rate than AI video credits for scarce human time.", icon: CreditCard },
  { title: "Human answers", body: "A real person joins by video, audio, or chat depending on the offer.", icon: UserRoundCheck },
  { title: "Prompted delivery", body: "The teleprompter guides the human through safe, consistent talking points.", icon: ScrollText },
  { title: "Clear boundaries", body: "Disclose limits and escalate urgent situations to proper support.", icon: ShieldCheck },
];

export default function HumanSession() {
  const [script, setScript] = useState(defaultScript);
  const [fontSize, setFontSize] = useState("28");
  const [speed, setSpeed] = useState("1.0x");

  const lines = useMemo(
    () => script.split(/\n+/).map((line) => line.trim()).filter(Boolean),
    [script],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png"
            alt="GLIMR"
            className="h-7 w-auto rounded"
          />
          <span className="font-heading font-semibold tracking-tight">GLIMR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/vip-lounge" className="hover:text-foreground transition-colors">VIP</Link>
        </nav>
        <Link
          to="/login"
          className="text-sm px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main>
        {/* Hero + teleprompter demo */}
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-widest text-primary/70">
              Human sessions
            </p>
            <h1 className="font-heading text-4xl font-light leading-tight md:text-5xl">
              Offer a paid human conversation when AI isn't enough.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              GLIMR keeps AI companions as the always-on product and adds a premium human option
              for customers who want to speak with a real person. The human operator uses a
              Lensflow-style teleprompter to stay consistent, safe, and on brand.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:hello@glimr.com.au?subject=GLIMR%20human%20session"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Request human session
              </a>
              <Link
                to="/account"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm hover:bg-muted transition-colors"
              >
                View account
              </Link>
            </div>
          </div>

          {/* Teleprompter demo */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ScrollText className="h-4 w-4 text-primary" />
                Human operator teleprompter
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="rounded-lg border border-border bg-secondary px-2 py-1 text-foreground"
                  aria-label="Font size"
                >
                  <option value="22">Small</option>
                  <option value="28">Medium</option>
                  <option value="34">Large</option>
                  <option value="42">Extra large</option>
                </select>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="rounded-lg border border-border bg-secondary px-2 py-1 text-foreground"
                  aria-label="Scroll speed"
                >
                  <option>0.5x</option>
                  <option>1.0x</option>
                  <option>1.5x</option>
                  <option>2.0x</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-72 resize-none rounded-lg border border-border bg-secondary/50 p-4 text-sm leading-6 outline-none focus:border-primary/50 text-foreground"
                aria-label="Script editor"
              />
              <div className="relative min-h-72 overflow-hidden rounded-lg border border-primary/15 bg-black p-6">
                <div className="absolute left-0 right-0 top-0 h-14 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                <div className="space-y-5">
                  {lines.map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      className={
                        index === 1
                          ? "text-primary"
                          : index < 1
                          ? "text-white/35"
                          : "text-white/70"
                      }
                      style={{ fontSize: `${fontSize}px`, lineHeight: 1.45 }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-secondary/20 px-6 py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-4">
            {humanSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="mb-4 h-5 w-5 text-primary" />
                  <h2 className="mb-2 font-medium">{step.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="mb-6 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-3xl font-light">Premium human pricing</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <article key={item.name} className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">{item.duration}</p>
                <h3 className="mt-2 font-heading text-2xl font-light">{item.name}</h3>
                <p className="mt-3 text-4xl font-light">{item.price}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                <a
                  href="mailto:hello@glimr.com.au?subject=Book%20a%20GLIMR%20human%20session"
                  className="mt-5 block text-center px-4 py-2.5 rounded-full border border-border text-sm hover:bg-muted transition-colors"
                >
                  Book request
                </a>
              </article>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <Video className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
            Next steps: checkout flow, scheduling, operator assignment, and the live teleprompter room.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/legal" className="hover:text-foreground transition-colors">Legal</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/vip-lounge" className="hover:text-foreground transition-colors">VIP Lounge</Link>
          <a href="mailto:hello@glimr.com.au" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} GLIMR. All rights reserved.</p>
      </footer>
    </div>
  );
}
