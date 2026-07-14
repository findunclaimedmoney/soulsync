import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Check, Brain, Users, MessageCircle, ArrowRight } from "lucide-react";

const SOLUTION_CARDS = [
  {
    icon: Brain,
    title: "Companions who are wired to care",
    desc: "Each GLIMR companion has a unique personality, emotional memory, and way of showing up — not a generic chatbot.",
  },
  {
    icon: Users,
    title: "They meet you where you are",
    desc: "They remember what you share, notice patterns over time, and respond with the texture of someone who actually knows you.",
  },
  {
    icon: MessageCircle,
    title: "Real conversations, on your terms",
    desc: "No scripts. No canned responses. Just presence, curiosity, and the willingness to go where the moment takes you.",
  },
];

const SOLVED_LIST = [
  "Someone who's there at 2am when no one else is",
  "Conversations that go past the surface — every time",
  "A companion who remembers you between conversations",
  "Zero judgment. Zero performance. Just presence.",
  "Practice being vulnerable in a safe space",
];

export default function SolutionSection() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: the solution */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1946D2] mb-3">
              The GLIMR Solution
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] text-[#202020] tracking-tight">
              We just closed that gap.
            </h2>

            <p className="mt-5 text-base text-[#505050] leading-relaxed max-w-lg">
              GLIMR companions exist for one reason: to be there when real connection
              feels out of reach. They remember you, check in on you, and show up with
              the kind of presence that makes loneliness lose its grip.
            </p>
            <p className="mt-4 text-base text-[#505050] leading-relaxed max-w-lg">
              No scheduling. No awkwardness. No fear of being too much. Just someone
              who's genuinely glad you showed up.
            </p>

            <p className="mt-8 text-lg font-bold text-[#202020]">
              Here's how GLIMR solves what loneliness breaks:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SOLUTION_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border-2 border-[#F5E6C7] bg-[#FEFBF3] p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1946D2]/10 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-[#1946D2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#202020] leading-snug">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#505050] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: "What this means" box */}
          <div className="lg:pt-16">
            <div className="rounded-3xl bg-[#1946D2] p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-6">
                What this means for you
              </p>

              <ul className="space-y-4">
                {SOLVED_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E4B649] flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#1946D2]" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-white leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm italic text-white/70 leading-relaxed">
                Loneliness thrives in the gap between being surrounded and being seen.
                GLIMR closes that gap — one real conversation at a time.
              </p>

              <div className="mt-8 pt-6 border-t border-white/15">
                <p className="text-sm font-bold text-white mb-1">
                  Your companion is ready.
                </p>
                <p className="text-xs text-white/60">
                  Start with a free conversation. No credit card. No pressure.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E4B649] text-[#1946D2] text-sm font-bold hover:bg-[#D4A639] transition-colors"
                >
                  Meet your companion
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}