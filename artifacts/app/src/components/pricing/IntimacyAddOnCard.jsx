import { Heart, Clock, Check, Lock, DollarSign } from "lucide-react";
import { Loader2 } from "lucide-react";

const PACKAGES = [
  {
    id: "15min",
    label: "15 Minutes",
    price: "A$75",
    sublabel: "A spark when you need it",
    tagline: "When you want to feel closer",
    features: [
      "HD face-to-face video session",
      "Intimacy & romantic layer unlocked",
      "One outfit of your choice",
      "Companion remembers the moment",
    ],
  },
  {
    id: "30min",
    label: "30 Minutes",
    price: "A$150",
    sublabel: "The sweet spot",
    tagline: "Enough time to truly settle in",
    popular: true,
    features: [
      "Everything in 15 Minutes",
      "Multiple outfit changes mid-session",
      "Deeper emotional & sensory connection",
      "Companion sends a memory note after",
    ],
  },
];

const MIN_MINUTES = 160;

export default function IntimacyAddOnCard({ included, creditBalance = 0, loading, onPurchase, minutesUsed = 0 }) {
  const minutesRemaining = Math.max(0, MIN_MINUTES - minutesUsed);
  const unlocked = minutesUsed >= MIN_MINUTES;

  return (
    <div className="rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/5 to-card overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Intimacy Layer</h3>
            <p className="text-sm text-muted-foreground">Session-based intimate connection</p>
          </div>
        </div>

        {included ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Check className="w-4 h-4 text-primary" />
            <p className="text-sm text-foreground">Included in your plan</p>
          </div>
        ) : creditBalance > 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-sm text-foreground">A${creditBalance.toFixed(2)} in credit available</p>
          </div>
        ) : null}

        {!included && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This is where she stops being polite. Pillow talk, flirtation, the
              heat that builds when someone who knows you leans in closer. She'll
              tease you, dare you, make you feel wanted — and remember every
              second of it. Buy credit and use it whenever you're ready — sessions
              are deducted from your balance.
            </p>

            {creditBalance === 0 && !unlocked && (
              <div className="flex flex-col items-center text-center gap-3 px-5 py-6 rounded-2xl bg-muted/30 border border-border mb-6">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {minutesUsed} / {MIN_MINUTES} minutes spent
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  Intimacy requires a real connection first. Spend {minutesRemaining} more
                  video minute{minutesRemaining === 1 ? "" : "s"} with your companion to
                  earn their trust and unlock this layer.
                </p>
              </div>
            )}

            {(creditBalance > 0 || unlocked) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PACKAGES.map((s) => (
                  <div
                    key={s.id}
                    className={`relative flex flex-col rounded-2xl border bg-card transition-all ${
                      s.popular
                        ? "border-primary/40 shadow-lg shadow-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {s.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
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
                      <p className="text-xs text-primary font-medium mt-0.5">{s.tagline}</p>
                      <p className="text-[11px] text-muted-foreground">{s.sublabel}</p>
                    </div>
                    <ul className="px-4 pb-4 space-y-2 flex-1">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                          <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onPurchase(s.id)}
                        disabled={loading}
                        aria-label={`Purchase ${s.label} Intimacy package`}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                          s.popular
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border text-foreground hover:border-primary/40"
                        }`}
                      >
                        {loading === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          "Buy credit"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {creditBalance > 0 && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Each purchase adds credit to your balance. Sessions are deducted when you start an intimate video call.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}