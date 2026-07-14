import React from "react";
import { Check, Sparkles, Crown, Coins } from "lucide-react";

export default function TierCard({ tier, current, loading, onUpgrade }) {
  const { name, price, credits, description, features, highlighted, badge, ctaLabel } = tier;

  return (
    <div
      className={`relative rounded-3xl border p-7 flex flex-col transition-all ${
        highlighted
          ? "border-primary/50 bg-card shadow-lg shadow-primary/5"
          : "border-border bg-card/50"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
            {badge === "popular" && <Sparkles className="w-3 h-3" />}
            {badge === "vip" && <Crown className="w-3 h-3" />}
            {badge === "popular" ? "Most Popular" : "Invitation Only"}
          </span>
        </div>
      )}

      <h3 className="font-heading text-xl font-semibold mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{description}</p>

      <div className="mb-2">
        <span className="font-heading text-4xl font-semibold tracking-tight">A${price}</span>
        {price > 0 && <span className="text-sm text-muted-foreground ml-1">/mo AUD</span>}
      </div>

      {credits > 0 && (
        <div className="flex items-center gap-1.5 mb-6 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{credits} credits</span>
          <span className="text-xs text-muted-foreground">/ month</span>
        </div>
      )}

      {credits === 0 && <div className="mb-6" />}

      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-foreground/80 leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        disabled={current || loading}
        className={`min-h-[44px] w-full px-6 py-3 rounded-full font-medium text-sm transition-all ${
          current
            ? "bg-muted text-muted-foreground cursor-default"
            : highlighted
            ? "bg-primary text-primary-foreground hover:gap-3 inline-flex items-center justify-center gap-2"
            : "border border-border hover:border-primary/40 inline-flex items-center justify-center gap-2"
        }`}
      >
        {current ? "Current Plan" : loading ? "Redirecting…" : ctaLabel}
      </button>
    </div>
  );
}