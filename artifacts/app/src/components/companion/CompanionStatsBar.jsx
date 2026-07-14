import React from "react";
import { DollarSign, Wallet, Users, TrendingUp } from "lucide-react";

export default function CompanionStatsBar({ summary }) {
  const stats = [
    {
      icon: DollarSign,
      label: "Total earned",
      value: `$${summary?.totalEarnings?.toFixed(2) || "0.00"}`,
    },
    {
      icon: Wallet,
      label: "Available",
      value: `$${summary?.availablePayout?.toFixed(2) || "0.00"}`,
    },
    {
      icon: Users,
      label: "Referrals",
      value: `${summary?.activeReferrals || 0} active`,
    },
    {
      icon: TrendingUp,
      label: "Paid out",
      value: `$${summary?.paidOut?.toFixed(2) || "0.00"}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="font-heading text-xl font-semibold leading-none">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}