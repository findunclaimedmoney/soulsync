import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Copy, Check, Bitcoin, Coins, Loader2, AlertCircle, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";

const ASSETS = [
  { id: "USDC", label: "USDC", icon: Coins, note: "Stable — 1 USDC ≈ $1" },
  { id: "BTC", label: "Bitcoin", icon: Bitcoin, note: "" },
  { id: "ETH", label: "Ethereum", icon: Coins, note: "" },
];

const TOPUP_OPTIONS = [
  { id: "pack_5", label: "$5 credit", price: 5 },
  { id: "pack_10", label: "$10 credit", price: 10 },
  { id: "pack_25", label: "$25 credit", price: 25 },
  { id: "pack_50", label: "$50 credit", price: 50 },
  { id: "custom", label: "Custom amount", price: null },
];

const INTIMACY_OPTIONS = [
  { id: "15min", label: "15 minutes", price: 6 },
  { id: "30min", label: "30 minutes", price: 11 },
  { id: "60min", label: "60 minutes", price: 20 },
];

export default function CryptoPaymentModal({ tiers, onClose, onPurchased }) {
  const [tab, setTab] = useState("tier");
  const [step, setStep] = useState("choose");
  const [selected, setSelected] = useState(null);
  const [asset, setAsset] = useState(null);
  const [payment, setPayment] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [payStatus, setPayStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [moonpayLoading, setMoonpayLoading] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const handleSelect = (item) => {
    setSelected(item);
    setError(null);
  };

  const handleAsset = async (chosenAsset) => {
    setAsset(chosenAsset);
    setCreating(true);
    setError(null);
    try {
      const payload = {
        type: tab,
        reference: selected.id,
        asset: chosenAsset,
      };
      if (selected.id === "custom" && customAmount) {
        payload.custom_amount = parseFloat(customAmount);
        payload.reference = "custom";
      }
      const res = await base44.functions.invoke("createCryptoCheckout", payload);
      if (res.data?.error) {
        setError(res.data.message || res.data.error);
        setCreating(false);
        return;
      }
      setPayment(res.data);
      setStep("pay");
      startPolling(res.data.order_id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create checkout");
    } finally {
      setCreating(false);
    }
  };

  const startPolling = (orderId) => {
    const poll = async () => {
      setChecking(true);
      try {
        const res = await base44.functions.invoke("checkCryptoPayment", { order_id: orderId });
        const status = res.data?.status;
        setPayStatus(status);
        if (status === "paid") {
          setStep("done");
          onPurchased?.();
          return;
        }
        if (status === "expired") {
          return;
        }
        pollRef.current = setTimeout(poll, 15000);
      } catch (err) {
        pollRef.current = setTimeout(poll, 15000);
      } finally {
        setChecking(false);
      }
    };
    poll();
  };

  const copyAddress = () => {
    if (!payment?.address) return;
    navigator.clipboard.writeText(payment.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep("choose");
    setSelected(null);
    setAsset(null);
    setPayment(null);
    setPayStatus(null);
    setError(null);
    setCustomAmount("");
    setMoonpayLoading(false);
    if (pollRef.current) clearTimeout(pollRef.current);
  };

  const handleBuyCrypto = async () => {
    if (!payment?.order_id) return;
    setMoonpayLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("createMoonPayUrl", { order_id: payment.order_id });
      if (res.data?.error) {
        setError(res.data.error);
      } else if (res.data?.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to open MoonPay");
    } finally {
      setMoonpayLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  const items = tab === "tier"
    ? tiers.filter((t) => t.id !== "free").map((t) => ({ id: t.id, label: t.name, price: t.price }))
    : tab === "topup"
    ? TOPUP_OPTIONS
    : INTIMACY_OPTIONS;

  const cryptoAmountStr = payment
    ? payment.crypto_amount.toLocaleString("en-US", { minimumFractionDigits: payment.asset === "USDC" ? 2 : 8, maximumFractionDigits: payment.asset === "USDC" ? 2 : 8 })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {step === "choose" && (
          <>
            <h2 className="font-heading text-2xl font-semibold mb-1">Pay with crypto</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose what you'd like to buy.</p>

            <div className="flex gap-2 mb-6 p-1 rounded-full bg-muted/50">
              {["tier", "topup", "intimacy"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelected(null); setError(null); }}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-colors capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t === "topup" ? "Top-up" : t}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selected?.id === item.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}`}
                >
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.price !== null ? `$${item.price}` : ""}</span>
                </button>
              ))}
            </div>

            {selected?.id === "custom" && (
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-3">Enter amount (min $5):</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min="5"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-muted/40 border border-border text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive-foreground">{error}</p>
              </div>
            )}

            {selected && !(selected.id === "custom" && !customAmount) && (
              <>
                <p className="text-xs text-muted-foreground mb-3">Choose your asset:</p>
                <div className="grid grid-cols-3 gap-2">
                  {ASSETS.map((a) => (
                    <button
                      key={a.id}
                      disabled={creating}
                      onClick={() => handleAsset(a.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-primary/40 transition-all disabled:opacity-50"
                    >
                      <a.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
                {creating && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating deposit address…
                  </div>
                )}
              </>
            )}
          </>
        )}

        {step === "pay" && payment && (
          <>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h2 className="font-heading text-2xl font-semibold mb-1">Send your payment</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Send exactly <span className="text-foreground font-medium">{cryptoAmountStr} {payment.asset}</span> to the address below.
            </p>

            <div className="flex justify-center mb-5">
              <div className="p-3 bg-white rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payment.address)}`}
                  alt="Deposit address QR"
                  className="w-44 h-44"
                />
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Deposit address</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                <code className="flex-1 text-xs break-all">{payment.address}</code>
                <button onClick={copyAddress} className="shrink-0 text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border mb-4">
              <span className="text-xs text-muted-foreground">Amount due</span>
              <span className="text-sm font-medium">{cryptoAmountStr} {payment.asset} ≈ ${payment.usd_amount}</span>
            </div>

            <button
              onClick={handleBuyCrypto}
              disabled={moonpayLoading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors mb-5 disabled:opacity-50"
            >
              {moonpayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {moonpayLoading ? "Opening MoonPay…" : "Don't have crypto? Buy here"}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {payStatus === "expired" ? "Order expired — start a new one" : "Waiting for payment to arrive…"}
            </div>
            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              Crypto deposits can take 10–60 minutes to confirm. Keep this page open or come back later.
            </p>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Payment confirmed</h2>
            <p className="text-sm text-muted-foreground mb-6">Your purchase is complete and your account has been updated.</p>
            <button onClick={onClose} className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}