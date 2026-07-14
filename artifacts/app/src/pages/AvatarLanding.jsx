import React from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import LiveChatWidget from "@/components/landing/LiveChatWidget";
import { Sparkles } from "lucide-react";

export default function AvatarLanding() {
  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <header className="bg-[#E4B649] border-b border-[#202020]/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png" alt="GLIMR" className="h-9 w-auto rounded-md" />
          </Link>
          <nav className="hidden sm:flex items-center gap-7">
            <a href="#problem" className="text-sm font-semibold text-[#202020] hover:text-[#1946D2] transition-colors">The Problem</a>
            <a href="#companions" className="text-sm font-semibold text-[#202020] hover:text-[#1946D2] transition-colors">The Companions</a>
            <a href="#benefits" className="text-sm font-semibold text-[#202020] hover:text-[#1946D2] transition-colors">Benefits</a>
            <a href="#faq" className="text-sm font-semibold text-[#202020] hover:text-[#1946D2] transition-colors">FAQ</a>
          </nav>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1946D2] text-white text-sm font-bold hover:bg-[#1538A8] transition-colors select-none"
          >
            Meet Your Companion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <HeroSection />

      {/* Problem section */}
      <div id="problem">
        <ProblemSection />
      </div>

      {/* Solution section */}
      <div id="benefits">
        <SolutionSection />
      </div>

      {/* CTA */}
      <section id="companions" className="bg-[#E4B649]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight mb-4">
            Your companion is ready when you are.
          </h2>
          <p className="text-base text-[#505050] mb-8 max-w-lg mx-auto leading-relaxed">
            Pick someone to talk to. They'll remember you, check in on you, and be there —
            no matter the hour.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-8 py-4 rounded-xl bg-[#1946D2] text-white text-base font-bold hover:bg-[#1538A8] transition-colors select-none"
          >
            Choose your companion
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 24/7 Live Chat with Mia */}
      <LiveChatWidget />
    </div>
  );
}