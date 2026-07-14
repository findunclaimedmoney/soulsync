import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function PromoCodeRedeemer({ onRedeemed }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await base44.functions.invoke("redeemPromoCode", {
        code: code.trim(),
      });
      setSuccess({
        credits: res.data.credits_granted,
        balance: res.data.new_balance,
      });
      setCode("");
      if (onRedeemed) onRedeemed(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Have a promo code?</h3>
      </div>

      {success ? (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {success.credits} credit{success.credits !== 1 ? "s" : ""} added!
            </p>
            <p className="text-xs text-muted-foreground">
              New balance: {success.balance} credits
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRedeem} className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="flex-1 h-11 font-medium tracking-wider placeholder:font-normal placeholder:tracking-normal"
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-11 px-5 flex-shrink-0"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Redeem"
            )}
          </Button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}