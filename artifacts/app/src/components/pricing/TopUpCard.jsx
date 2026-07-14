import { useState } from "react";
import { Loader2, Plus, Check, Coins } from "lucide-react";
import { TOPUP_PACKS, creditsToUsd } from "@/lib/creditSystem";

export default function TopUpCard({ creditBalance = 0, onPurchase, loading }) {
  const [selected, setSelected] = useState(null);

  return (
    <div id="topup" className="rounded-[2rem] border border-border bg-card overflow-hidden scroll-mt-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Top Up Credits</h3>
            <p className="text-sm text-muted-foreground">Add credits for messages, video & voice</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
          <Coins className="w-4 h-4 text-primary" />
          <p className="text-sm text-foreground">
            Balance: <span className="font-semibold">{creditBalance.toFixed(2)} credits</span>
            <span className="text-muted-foreground ml-2">(A${creditsToUsd(creditBalance).toFixed(2)})</span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Credits are used across all features — text messages, live video, and voice replies.
          Top up anytime; prepaid credits never expire.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOPUP_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => {
                setSelected(pack.id);
                onPurchase(pack.id);
              }}
              disabled={loading !== null}
              aria-label={`Purchase ${pack.credits} credits for A$${pack.price}`}
              className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all text-center disabled:opacity-50 ${
                loading === pack.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <Plus className="w-4 h-4 text-muted-foreground" />
              <span className="font-heading text-2xl font-semibold">{pack.credits}</span>
              <span className="text-[11px] text-muted-foreground">credits</span>
              <span className="text-[10px] text-muted-foreground/70">A${pack.price}</span>
              {loading === pack.id && (
                <Loader2 className="w-4 h-4 text-primary animate-spin mt-1" />
              )}
            </button>
          ))}
        </div>

        {creditBalance > 0 && (
          <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-primary" />
            Enough for ~{Math.floor(creditBalance / 0.75)} minutes of face-to-face video · voice replies are A$0.20 each
          </div>
        )}
      </div>
    </div>
  );
}