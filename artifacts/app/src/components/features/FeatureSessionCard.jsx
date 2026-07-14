import { Clock, Check, Loader2 } from "lucide-react";

export default function FeatureSessionCard({ session, loading, onPurchase }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card transition-all ${
        session.popular
          ? "border-primary/40 shadow-lg shadow-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      {session.popular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
          Most chosen
        </span>
      )}
      <div className="p-5 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {session.duration}
        </div>
        <p className="font-heading text-3xl font-semibold text-foreground mt-1">{session.price}</p>
        <p className="text-xs text-primary font-medium mt-0.5">{session.tagline}</p>
      </div>
      <ul className="px-5 pb-4 space-y-2 flex-1">
        {session.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed"
          >
            <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <div className="p-5 pt-0">
        <button
          onClick={onPurchase}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
            session.popular
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border border-border text-foreground hover:border-primary/40"
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Buy session"}
        </button>
      </div>
    </div>
  );
}