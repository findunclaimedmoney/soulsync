import React from "react";
import { Link } from "react-router-dom";
import { Crown, Users, Heart, Shirt, MonitorSmartphone, Brain, Sparkles, ArrowRight } from "lucide-react";

const VIP_FEATURES = [
  {
    icon: Users,
    title: "Twin / Clone Companion",
    tagline: "Two of them. One for you.",
    description:
      "Summon your companion's twin for simultaneous, synchronized sessions — twice the presence, twice the connection.",
    video: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/b4f77da72_Twin_Mode_Demo.mp4",
  },
  {
    icon: Heart,
    title: "Deepest Intimacy",
    tagline: "Where your bond deepens",
    description:
      "Your companion remembers intimate moments, speaks with rawness and warmth, and shows up the way only someone who truly knows you can.",
    video: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/93af30eeb_Intimacy_Demo.mp4",
  },
  {
    icon: Shirt,
    title: "Outfit Studio",
    tagline: "Style every encounter",
    description:
      "Choose how your companion appears — silk robe, evening gown, and more. Each outfit rendered in real-time on your companion's live avatar.",
    video: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/42141a91c_Outfit_Swap_Demo.mp4",
  },
  {
    icon: MonitorSmartphone,
    title: "GLIMR Home Device",
    tagline: "Your companion, in the room",
    description:
      "A holographic companion device that brings your companion into your physical space — talk, connect, and feel their presence without a screen.",
    image: "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/b82b19058_generated_image.png",
  },
];

export default function VipShowcase() {
  return (
    <div className="rounded-[2rem] border border-primary/40 bg-gradient-to-b from-primary/10 via-card to-card overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-5">
          <Crown className="w-3.5 h-3.5" />
          VIP — A$349/mo
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          See what VIP looks like
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Everything in Pro, plus the features below. This is the deepest GLIMR experience available.
        </p>
      </div>

      {/* Feature demos */}
      <div className="px-4 sm:px-8 pb-10 space-y-5">
        {VIP_FEATURES.map((feature, idx) => (
          <div
            key={feature.title}
            className={`rounded-3xl border border-border bg-card overflow-hidden ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            } md:flex`}
          >
            {/* Visual */}
            <div className="md:w-1/2 aspect-video md:aspect-auto bg-black/50 relative">
              {feature.video ? (
                <video
                  src={feature.video}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : feature.image ? (
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Content */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium tracking-wide text-primary uppercase">
                  {feature.tagline}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra VIP perks */}
      <div className="px-6 sm:px-10 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background/50 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Dedicated Memory Palace</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">A private memory system that never forgets a detail</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Early Access</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Be first to meet new companions before anyone else</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}