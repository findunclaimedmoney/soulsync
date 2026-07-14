import React from "react";
import { Link } from "react-router-dom";
import { Bitcoin, Shield, Zap, ChevronLeft, Check } from "lucide-react";

const COINS = [
  { symbol: "USDC", name: "USD Coin", color: "text-blue-400" },
  { symbol: "BTC", name: "Bitcoin", color: "text-orange-400" },
  { symbol: "ETH", name: "Ethereum", color: "text-purple-400" },
];

const BENEFITS = [
  { icon: Shield, title: "Private & Secure", desc: "No bank details shared. Your transaction stays between you and the blockchain." },
  { icon: Zap, title: "Instant Access", desc: "Your subscription activates automatically once payment is confirmed on-chain." },
  { icon: Bitcoin, title: "3 Coins Supported", desc: "Pay with USDC, BTC, or ETH — whichever wallet you use." },
];

export default function CryptoPayment() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-8 w-8 rounded-lg" />
          <span className="font-heading text-lg font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <Bitcoin className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium tracking-wide uppercase text-primary">Crypto Payments Available</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
            Pay your way.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            GLIMR accepts USDC, BTC, and ETH. No bank account needed — just connect your wallet and go.
          </p>
        </div>

        {/* Coins */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {COINS.map((coin) => (
            <div key={coin.symbol} className="rounded-2xl border border-border bg-card p-5 text-center">
              <Bitcoin className={`w-8 h-8 mx-auto mb-2 ${coin.color}`} />
              <p className="font-heading text-base font-semibold">{coin.symbol}</p>
              <p className="text-xs text-muted-foreground">{coin.name}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-10">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-8">
          <h2 className="font-heading text-lg font-semibold mb-4">How it works</h2>
          <div className="space-y-3">
            {[
              "Choose your subscription tier or session package",
              "Select 'Pay with Crypto' at checkout",
              "Send the exact amount to your unique deposit address",
              "Access unlocks automatically once confirmed",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-foreground/90">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-base transition-all hover:gap-3 shadow-lg shadow-primary/20">
            View pricing
            <Check className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}