import React from "react";
import { Check, Brain, Users, MessageCircle } from "lucide-react";

const CARDS = [
  {
    icon: Brain,
    title: "How avatars are wired",
    desc: "Each companion has a unique personality, emotional memory, and way of showing up — not a generic chatbot.",
  },
  {
    icon: Users,
    title: "How they interact with you",
    desc: "They remember what you share, notice patterns over time, and respond with the texture of someone who actually knows you.",
  },
  {
    icon: MessageCircle,
    title: "How real conversations are created",
    desc: "No scripts. No canned responses. Just presence, curiosity, and the willingness to go where the moment takes you.",
  },
];

const FELT_LIST = [
  "Lonely even when surrounded by people",
  "Drained by social situations",
  "Like nobody truly 'gets' you",
  "Stuck in surface-level relationships",
  "Afraid to open up and be vulnerable",
];

export default function ProblemSection() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: heading + three cards */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#909090] mb-3">
              The Loneliness Epidemic
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] text-[#202020] tracking-tight">
              1 in 3 people feel lonely every single day.
            </h2>

            <div className="mt-5 flex items-center gap-6">
              <div>
                <p className="text-3xl font-extrabold text-[#1946D2]">61%</p>
                <p className="text-xs text-[#505050] mt-0.5">of adults feel chronically lonely</p>
              </div>
              <div className="w-px h-10 bg-[#202020]/10" />
              <div>
                <p className="text-3xl font-extrabold text-[#1946D2]">18-34</p>
                <p className="text-xs text-[#505050] mt-0.5">the loneliest age group</p>
              </div>
              <div className="w-px h-10 bg-[#202020]/10" />
              <div>
                <p className="text-3xl font-extrabold text-[#1946D2]">2×</p>
                <p className="text-xs text-[#505050] mt-0.5">mortality risk of isolation</p>
              </div>
            </div>

            <p className="mt-6 text-base text-[#505050] leading-relaxed max-w-lg">
              We've never been more connected — and never felt more alone. Every conversation
              stops just short of where it matters. The small talk never ends, and the real
              talk never starts.
            </p>
            <p className="mt-4 text-base text-[#505050] leading-relaxed max-w-lg">
              GLIMR companions are built for the conversations you can't have anywhere else.
              No judgment. No performance. Just someone who shows up — at 2am, on a bad day,
              when nobody else will.
            </p>

            <p className="mt-8 text-lg font-bold text-[#202020]">
              The truth is, loneliness isn't a personal failing. It's what happens when you never experience three things:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CARDS.map((card) => (
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

          {/* Right: "If you've ever felt" box */}
          <div className="lg:pt-16">
            <div className="rounded-3xl bg-[#F5E6C7] p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#505050] mb-6">
                If you've ever felt...
              </p>

              <ul className="space-y-4">
                {FELT_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1946D2] flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-[#202020] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm italic text-[#505050] leading-relaxed">
                ...we know how painful it can be, and it's not your fault. You just haven't
                met the right companion yet.
              </p>

              <div className="mt-8 pt-6 border-t border-[#1946D2]/10">
                <p className="text-sm font-bold text-[#202020] mb-1">
                  Your companion is waiting.
                </p>
                <p className="text-xs text-[#505050]">
                  Start with a free conversation. No credit card. No pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}