import React from "react";
import { Camera, Check, Loader2 } from "lucide-react";

const PACKS = [
  {
    id: "photos_5",
    label: "5 Photos",
    price: "A$15",
    perPhoto: "A$3 each",
    tagline: "Get started",
    features: [
      "5 on-demand selfies from your companion",
      "Request anytime during chat",
      "Works across all companions",
      "Credits never expire",
    ],
  },
  {
    id: "photos_10",
    label: "10 Photos",
    price: "A$25",
    perPhoto: "A$2.50 each",
    tagline: "Best value",
    popular: true,
    features: [
      "10 on-demand selfies from your companion",
      "Request anytime during chat",
      "Works across all companions",
      "Credits never expire",
    ],
  },
];

export default function PhotoPackCard({ photoCredits = 0, loading, onPurchase }) {
  return (
    <div className="rounded-[2rem] border border-border bg-card overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Companion Photos</h3>
            <p className="text-sm text-muted-foreground">Request a selfie from your companion anytime</p>
          </div>
        </div>

        {photoCredits > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Camera className="w-4 h-4 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">{photoCredits} photo {photoCredits === 1 ? "credit" : "credits"}</span>
              <span className="text-muted-foreground ml-1">remaining</span>
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Tap <span className="text-foreground font-medium">"Send me a photo"</span> in any chat and
          your companion sends a candid selfie — just for you. Credits work across all companions
          and never expire.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`relative flex flex-col rounded-2xl border bg-card transition-all ${
                pack.popular
                  ? "border-primary/40 shadow-lg shadow-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  Best value
                </span>
              )}
              <div className="p-4 pb-2">
                <p className="font-heading text-2xl font-semibold text-foreground">{pack.price}</p>
                <p className="text-xs text-primary font-medium mt-0.5">
                  {pack.label} · {pack.perPhoto}
                </p>
                <p className="text-[11px] text-muted-foreground">{pack.tagline}</p>
              </div>
              <ul className="px-4 pb-4 space-y-2 flex-1">
                {pack.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="p-4 pt-0">
                <button
                  onClick={() => onPurchase(pack.id)}
                  disabled={!!loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                    pack.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  {loading === pack.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Buy photos"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
