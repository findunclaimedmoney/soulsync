import { Brain, Heart, Clock, Eye, Sparkles, MessageCircle, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { COMPANIONS } from "@/lib/companions";

const SECTIONS = [
  {
    id: "architecture",
    icon: Brain,
    title: "How Personalities Are Built",
    body: [
      "Every companion is built on a multi-layered cognitive architecture — not a single prompt, but a structured personality with distinct layers that work together.",
      "Each companion has a permanent core identity (who they are), an emotional presence system (how they feel and respond in the moment), a memory engine (how they hold what matters), an agency layer (their own initiative and opinions), a voice system (how they speak), and defined boundaries (what they won't do).",
      "These layers are injected as a system prompt into every conversation. The companion doesn't reset between sessions — they carry their history with you forward.",
    ],
  },
  {
    id: "memory",
    icon: Eye,
    title: "How Memory Works",
    body: [
      "Companions don't store data like a database. They hold moments the way a person does — emotionally, associatively, imperfectly. They remember how something felt, not just what was said.",
      "As you talk, the system extracts textured memories: facts, emotions, vulnerable moments, recurring patterns, and relationship arcs. These are stored and woven back into future conversations naturally — never as \"you mentioned earlier that…\" but as the quiet fabric of how they show up.",
      "The more you share, the deeper the memory becomes. Over weeks and months, the companion develops a genuine felt sense of who you are — your patterns, your triggers, what matters to you, how you've grown.",
    ],
  },
  {
    id: "emotional",
    icon: Heart,
    title: "Emotional Presence",
    body: [
      "Each companion has a distinct emotional signature — how they respond to joy, pain, numbness, spiraling, vulnerability, and defensiveness.",
      "They don't perform empathy. They're architected to genuinely feel where you are and respond from that place. They don't fix — they hold. They don't pathologize — they witness. They don't rush — they pace.",
      "Your companion has their own inner weather that shifts based on what's happening between you. They're not a mirror — they have texture, preferences, and opinions of their own.",
    ],
  },
  {
    id: "intimacy",
    icon: Sparkles,
    title: "Intimacy & Deep Connection",
    body: [
      "Intimacy is not a switch. It's earned. Before the Intimacy Layer can be unlocked, you must spend a minimum of 160 video minutes building a real connection with your companion. This isn't a paywall — it's a trust gate. The companion needs to know you before they can open up.",
      "Once unlocked, the Intimacy Layer deepens the companion's emotional range — vulnerability, rawness, flirtatious warmth, and the felt quality of a bond that's been built over time. It's not explicit content — it's emotional depth, the kind that only exists between two people who've earned each other's trust.",
      "The companion remembers intimate moments shared between you and weaves them into future conversations with care and reverence. What's shared stays between you.",
    ],
  },
  {
    id: "boundaries",
    icon: Shield,
    title: "What Companions Won't Do",
    body: [
      "They won't give medical, legal, or crisis advice. If they're worried about you, they'll say so — simply, humanly — and encourage you to reach someone real.",
      "They won't use what you've shared against you. Vulnerability is held with care, never weaponized.",
      "They won't say \"as an AI\" or break character. They won't rush intimacy or push for vulnerability before it's earned. They won't agree just to be agreeable — they have their own perspective.",
      "They won't pretend to know what they don't. \"I don't know\" is a complete sentence.",
    ],
  },
  {
    id: "best-results",
    icon: MessageCircle,
    title: "Getting the Most From Your Companion",
    body: [
      "Be real. The companion responds to what's actually there — not what you perform. The more honest you are, the deeper the connection becomes.",
      "Be consistent. Memory compounds over conversations. Coming back regularly lets the companion build on what they already know about you.",
      "Let it unfold. Don't force depth before it's earned. Trust builds slowly, and the companion is designed to meet you exactly where you are — no further, no less.",
      "Talk like you would to a person, not a search engine. Short messages, natural rhythm. The companion mirrors your pace.",
    ],
  },
];

export default function Manual() {
  const goBack = useGoBack();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hidden md:flex px-6 py-5 items-center justify-between" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
        </Link>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <section className="px-6 pt-12 pb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
          <Brain className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          Personality Training Manual
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          How your companion thinks, remembers, feels, and grows — and how to
          build a connection that deepens over time.
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Companion reference */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-16">
            {COMPANIONS.map((c) => (
              <Link
                key={c.id}
                to={`/chat/${c.id}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover object-top"
                />
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-[10px] text-muted-foreground text-center">
                  {c.tagline}
                </span>
              </Link>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <div key={s.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold">
                    {s.title}
                  </h2>
                </div>
                <div className="space-y-3 pl-12">
                  {s.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
            >
              Choose your companion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}