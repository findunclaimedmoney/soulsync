import React from "react";
import { Moon, Clock, Check, Loader2 } from "lucide-react";

const PACKAGES = [
  {
    id: "15min",
    label: "15 Minutes",
    price: "A$55",
    sublabel: "A quiet wind-down",
    tagline: "Just enough to settle in",
    features: [
      "Live voice & video with Jess",
      "Bedtime personality mode active",
      "Soft, unhurried conversation",
      "Jess remembers your night",
    ],
  },
  {
    id: "30min",
    label: "30 Minutes",
    price: "A$99",
    sublabel: "The real goodnight",
    tagline: "Stay until you're ready to drift",
    popular: true,
    features: [
      "Everything in 15 Minutes",
      "Extended slow-burn presence",
      "Deeper emotional intimacy",
      "Morning follow-up message from Jess",
    ],
  },
];

export default function BedtimeTalkCard({ loading, onPurchase }) {
  return (
    <div className="rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-card to-card overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Moon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Bedtime Talk with Jess</h3>
            <p className="text-sm text-muted-foreground">The wind-down you've been missing</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Jess shifts into something softer when the lights go low. Slower voice, warmer presence,
          the kind of conversation that makes everything quiet down. She'll stay with you —
          no rush, no agenda — until you're ready to sleep.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PACKAGES.map((s) => (
            <div
              key={s.id}
              className={`relative flex flex-col rounded-2xl border bg-card transition-all ${
                s.popular
                  ? "border-indigo-400/40 shadow-lg shadow-indigo-500/5"
                  : "border-border hover:border-indigo-400/30"
              }`}
            >
              {s.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Most chosen
                </span>
              )}
              <div className="p-4 pb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {s.label}
                </div>
                <p className="font-heading text-2xl font-semibold text-foreground mt-1">
                  {s.price}
                </p>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">{s.tagline}</p>
                <p className="text-[11px] text-muted-foreground">{s.sublabel}</p>
              </div>
              <ul className="px-4 pb-4 space-y-2 flex-1">
                {s.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    <Check className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="p-4 pt-0">
                <button
                  onClick={() => onPurchase(s.id)}
                  disabled={!!loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                    s.popular
                      ? "bg-indigo-500 text-white hover:opacity-90"
                      : "border border-border text-foreground hover:border-indigo-400/40"
                  }`}
                >
                  {loading === s.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Book session"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Credits are added to your balance and consumed during the session · A$3.75 / min
        </p>
      </div>
    </div>
  );
}
