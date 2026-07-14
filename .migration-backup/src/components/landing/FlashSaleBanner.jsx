import React from "react";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

export default function FlashSaleBanner({ companionName, promoCode = "VOICE10", creditAmount = 10 }) {
  return (
    <section className="px-6 py-6 bg-primary/5 border-y border-primary/20">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">
            Flash Sale · Today Only · 50% Off
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          50% off all packages with {companionName} before midnight tonight.
          First 10 signups also get {creditAmount} free credits — use code{" "}
          <span className="font-semibold text-foreground">{promoCode}</span>.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90"
        >
          Claim 50% off
        </Link>
      </div>
    </section>
  );
}