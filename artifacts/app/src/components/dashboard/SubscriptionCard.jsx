import React from "react";
import { Link } from "react-router-dom";
import { Coins, Crown, ArrowRight, MessageCircle, Video, Mic } from "lucide-react";
import { TIER_LABELS, creditsToUsd, CONSUMPTION_ITEMS } from "@/lib/creditSystem";

const ACTION_ICONS = {
  text_message: MessageCircle,
  video_minute: Video,
  voice_reply: Mic,
};

export default function SubscriptionCard({ tier, creditBalance, monthlyCredits, creditsUsed, videoMinutesLimit = 0, videoMinutesUsed = 0 }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Current plan</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {TIER_LABELS[tier] || tier}
        </span>
      </div>

      {/* Plain English explainer */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 px-1">
        Credits are how you pay for everything — texting, video calls, and voice replies. Your {TIER_LABELS[tier] || tier} plan gives you {monthlyCredits} credits each month. Use them on any companion, any time.
      </p>

      {/* Credit balance — prominent */}
      <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Credit Balance</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-bold text-primary">{creditBalance.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">credits</span>
          <span className="text-sm text-muted-foreground ml-auto">≈ ${creditsToUsd(creditBalance).toFixed(2)}</span>
        </div>
        {monthlyCredits > 0 && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Monthly allowance</span>
              <span className="font-medium">{monthlyCredits} credits / month</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Used this period</span>
              <span className="font-medium">{creditsUsed.toFixed(2)} credits</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${monthlyCredits > 0 ? Math.min(100, (creditsUsed / monthlyCredits) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* What your credits get you — plain English */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Your {creditBalance.toFixed(0)} credits get you</p>
        {CONSUMPTION_ITEMS.map((item) => {
          const Icon = ACTION_ICONS[item.key] || Coins;
          const canAfford = item.key === "video_minute" && videoMinutesLimit > 0
            ? Math.max(0, videoMinutesLimit - videoMinutesUsed)
            : Math.floor(creditBalance / item.cost);
          const unit = item.key === "video_minute" ? "min" : item.key === "voice_reply" ? "replies" : "messages";
          return (
            <div key={item.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-primary">{canAfford}</span>
                <span className="text-xs text-muted-foreground ml-1">{unit}</span>
                <p className="text-[10px] text-muted-foreground">{item.cost} credits each</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Link
          to="/pricing"
          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {tier === "free" ? "Upgrade plan" : "Top up credits"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/account"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-colors"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}