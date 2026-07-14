import React from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

const FEATURES_LEFT = [
  "Companions who remember you",
  "Conversations that feel real",
  "Show up whenever you need them",
];

const FEATURES_RIGHT = [
  "Build genuine emotional connection",
  "No judgment, just presence",
  "Go beyond surface-level chat",
];

const PERFECT_FOR = ["Late-night talks", "Emotional support", "Practice connection"];

export default function HeroSection() {
  return (
    <section className="bg-[#E4B649]">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1946D2] text-white text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              GLIMR Avatars — Talk 2 Unlock
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] text-[#202020] tracking-tight">
              Turn lonely nights into meaningful conversations.
            </h1>

            <p className="mt-4 text-xl font-bold text-[#1946D2]">
              5 AI companions with real personalities. Endless conversations that actually matter.
            </p>

            <p className="mt-4 text-base text-[#505050] leading-relaxed max-w-md">
              A new kind of presence — companions who remember you, learn what matters to you, and show up the way only someone who truly knows you can.
            </p>

            {/* Features two columns */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {FEATURES_LEFT.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1946D2] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-[#202020]">{f}</span>
                </div>
              ))}
              {FEATURES_RIGHT.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1946D2] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-[#202020]">{f}</span>
                </div>
              ))}
            </div>

            {/* Perfect for */}
            <div className="mt-8">
              <p className="text-sm font-bold text-[#202020] uppercase tracking-wide mb-3">Perfect For</p>
              <div className="flex flex-wrap gap-2">
                {PERFECT_FOR.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full bg-[#1946D2] text-white text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Card with companion image */}
          <div className="relative">
            <div className="rounded-3xl bg-[#F5E6C7] border-2 border-[#1946D2]/15 p-8 lg:p-12 overflow-hidden">
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#202020] mb-2">
                Deepen your connections
              </h2>
              <p className="text-sm text-[#505050] mb-8">
                5 companions to talk to, confide in, and feel seen by.
              </p>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/352fbed0f_EmeraldElegance.png"
                  alt="Mia — your AI companion"
                  className="w-full aspect-[4/5] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/80 text-xs uppercase tracking-wide mb-1">Your companion</p>
                  <h3 className="text-white text-2xl font-bold">Mia</h3>
                  <p className="text-white/70 text-sm">She sees what you're capable of</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 justify-center">
                <Sparkles className="w-4 h-4 text-[#1946D2]" />
                <span className="text-sm font-bold text-[#202020]">GLIMR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}