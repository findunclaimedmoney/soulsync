import React from "react";
import { Coins, MessageCircle, Video, Mic } from "lucide-react";
import { CONSUMPTION_ITEMS, creditsToUsd } from "@/lib/creditSystem";

const ICONS = {
  text_message: MessageCircle,
  video_minute: Video,
  voice_reply: Mic,
};

export default function CreditUsageCard({ creditBalance = 0, monthlyCredits = 0, creditsUsed = 0 }) {
  const remaining = Math.max(0, creditBalance);
  const monthlyRemaining = Math.max(0, monthlyCredits - creditsUsed);

  return (
    <div className="rounded-[2rem] border border-border bg-card overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">How Credits Work</h3>
            <p className="text-sm text-muted-foreground">Credits power every interaction</p>
          </div>
        </div>

        {/* Explainer video */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-border bg-background/50">
          <video
            src="https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/30bf421c4_Credit_Explainer.mp4"
            controls
            playsInline
            className="w-full aspect-video object-cover"
          />
        </div>

        {/* Balance summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Available balance</p>
            <p className="font-heading text-2xl font-semibold text-primary">
              {remaining.toFixed(2)}
              <span className="text-sm text-muted-foreground ml-1.5">credits</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">≈ A${creditsToUsd(remaining).toFixed(2)}</p>
          </div>
          {monthlyCredits > 0 && (
            <div className="px-4 py-3 rounded-2xl bg-muted/40 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Monthly allowance</p>
              <p className="font-heading text-2xl font-semibold">
                {monthlyRemaining.toFixed(2)}
                <span className="text-sm text-muted-foreground ml-1.5">/ {monthlyCredits}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Credits left this billing period</p>
            </div>
          )}
        </div>

        {/* What 1 credit gets you */}
        <div className="mb-5 rounded-2xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">What 1 credit gets you</p>
          <p className="text-[11px] text-muted-foreground mb-3">1 credit = A${creditsToUsd(1).toFixed(2)} — spend it on any mix below</p>
          <div className="space-y-2">
            {CONSUMPTION_ITEMS.map((item) => {
              const Icon = ICONS[item.key] || Coins;
              const perCredit = Math.floor(1 / item.cost);
              const usdPerUnit = creditsToUsd(item.cost);
              return (
                <div key={item.key} className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{perCredit} {item.key === "video_minute" ? "min" : item.key === "voice_reply" ? "replies" : "msgs"}</p>
                    <p className="text-[11px] text-muted-foreground">A${usdPerUnit.toFixed(2)} / unit</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consumption rates */}
        <p className="text-sm text-muted-foreground mb-3">Credit cost per action:</p>
        <div className="space-y-2.5">
          {CONSUMPTION_ITEMS.map((item) => {
            const Icon = ICONS[item.key] || Coins;
            const canAfford = Math.floor(remaining / item.cost);
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{item.cost} credits</p>
                  <p className="text-[11px] text-muted-foreground">{canAfford} left</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Monthly credits reset at the end of each billing period. Prepaid top-up credits never expire.
        </p>
      </div>
    </div>
  );
}