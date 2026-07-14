import React from "react";

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}
      >
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-heading font-semibold">{value}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>}
  </div>
);

export { StatCard };