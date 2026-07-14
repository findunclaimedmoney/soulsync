import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, ArrowLeft, CheckCircle, Settings, Bitcoin } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { TIERS } from "@/lib/creditSystem";
import TierCard from "@/components/pricing/TierCard";
import IntimacyAddOnCard from "@/components/pricing/IntimacyAddOnCard";
import BedtimeTalkCard from "@/components/pricing/BedtimeTalkCard";
import PhotoPackCard from "@/components/pricing/PhotoPackCard";
import TopUpCard from "@/components/pricing/TopUpCard";
import CreditUsageCard from "@/components/pricing/CreditUsageCard";
import CryptoPaymentModal from "@/components/pricing/CryptoPaymentModal";
import PromoCodeRedeemer from "@/components/pricing/PromoCodeRedeemer";
import PullToRefresh from "@/components/PullToRefresh";

export default function Pricing() {
  const goBack = useGoBack();
  const [currentTier, setCurrentTier] = useState("free");
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const [intimacyPackage, setIntimacyPackage] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [monthlyCredits, setMonthlyCredits] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [addonLoading, setAddonLoading] = useState(null);
  const [topupLoading, setTopupLoading] = useState(null);
  const [bedtimeLoading, setBedtimeLoading] = useState(null);
  const [photoPackLoading, setPhotoPackLoading] = useState(null);
  const [photoCredits, setPhotoCredits] = useState(0);
  const [billingLoading, setBillingLoading] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      confirmSession(sessionId);
    } else {
      loadSubscription();
    }
  }, []);

  const loadSubscription = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const res = await base44.functions.invoke("getSubscription", {});
      if (res.data?.tier) setCurrentTier(res.data.tier);
      setIntimacyPackage(res.data?.intimacy_package || false);
      setCreditBalance(res.data?.credit_balance || 0);
      setMonthlyCredits(res.data?.monthly_credits || 0);
      setCreditsUsed(res.data?.credits_used || 0);
      setMinutesUsed(res.data?.video_minutes_used || 0);
      setSessionsCompleted(res.data?.intimacy_sessions_completed || 0);
      setPhotoCredits(res.data?.photoCredits ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

        const handleRefresh = async () => {
              await loadSubscription();
        };
  const confirmSession = async (sessionId) => {
    try {
      const res = await base44.functions.invoke("confirmSubscription", { session_id: sessionId });
      if (res.data?.tier) {
        setCurrentTier(res.data.tier);
      }
      if (res.data?.tier || res.data?.credit_added) {
        setSuccess(true);
      }
      if (res.data?.new_balance !== undefined) {
        setCreditBalance(res.data.new_balance);
      }
    } catch (err) {
      console.error(err);
      loadSubscription();
    }
  };

  const handlePurchaseAddon = async (duration) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      window.location.href = "/login";
      return;
    }

    setAddonLoading(duration);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "intimacy",
        duration,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setAddonLoading(null);
    }
  };

  const handlePurchaseTopUp = async (packId) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      window.location.href = "/login";
      return;
    }

    setTopupLoading(packId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "topup",
        duration: packId,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setTopupLoading(null);
    }
  };

  const handlePurchaseBedtime = async (packId) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { window.location.href = "/login"; return; }
    setBedtimeLoading(packId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "bedtime",
        duration: packId,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      setBedtimeLoading(null);
    }
  };

  const handlePurchasePhotoPack = async (packId) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { window.location.href = "/login"; return; }
    setPhotoPackLoading(packId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "photos",
        pack_id: packId,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      setPhotoPackLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await base44.functions.invoke("manageBilling", {});
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setBillingLoading(false);
    }
  };

  const handleUpgrade = async (tierId) => {
    if (tierId === "free") {
      window.location.href = "/login";
      return;
    }

    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      window.location.href = "/login";
      return;
    }

    setLoading(tierId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        tier: tierId,
        companion_id: localStorage.getItem("glimr_last_companion") || "mia",
        ...(promoApplied && promoCode ? { coupon: promoCode.toUpperCase() } : {}),
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hidden md:flex px-6 py-5 items-center justify-between" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
        </Link>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

            <PullToRefresh onRefresh={handleRefresh}>

      {success ? (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold mb-2">You're all set</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Your purchase is complete. Your companion is waiting.
          </p>
          <Link
            to="/"
            className="inline-flex items-center min-h-[44px] px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
          >
            Start chatting
          </Link>
        </div>
      ) : (
        <>
          <section className="relative px-6 pt-16 pb-8 text-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-20"
              >
                <source src="https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/31bb45ba2_Romantic_hero_video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" />
            </div>
            <div className="relative z-10">
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Choose your experience
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              From casual conversation to the deepest connection you've ever felt.
            </p>
            <div className="mt-6 max-w-sm mx-auto">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }}
                  placeholder="Promo code"
                  className="flex-1 px-4 py-2.5 rounded-full bg-background/80 border border-border text-sm text-center font-medium tracking-wider placeholder:text-muted-foreground placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-primary/40 transition-colors"
                />
                <button
                  onClick={() => setPromoApplied(true)}
                  disabled={!promoCode.trim() || promoApplied}
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 transition-opacity whitespace-nowrap"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-primary mt-2 font-medium">
                  50% off applied — your discount will be reflected at checkout
                </p>
              )}
            </div>
            <button
              onClick={() => setCryptoOpen(true)}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <Bitcoin className="w-4 h-4" />
              Pay with crypto
            </button>
            {currentTier !== "free" && (
              <button
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
              >
                <Settings className="w-4 h-4" />
                {billingLoading ? "Loading…" : "Manage or cancel subscription"}
              </button>
            )}
            </div>
          </section>

          <section className="px-6 pb-24">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  current={currentTier === tier.id}
                  loading={loading === tier.id}
                  onUpgrade={() => handleUpgrade(tier.id)}
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              All prices in AUD · Start free — upgrade anytime · Cancel anytime
            </p>
          </section>

          {sessionsCompleted >= 2 && !["pro", "vip"].includes(currentTier) && (
            <section className="px-6 pb-2">
              <div className="max-w-3xl mx-auto rounded-[2rem] border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-heading text-lg font-semibold mb-1">
                    You've spent A${sessionsCompleted * 6}+ on sessions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pro includes unlimited intimacy for A$99/month. Stop paying per session.
                  </p>
                </div>
                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={loading === "pro"}
                  className="min-h-[44px] px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
                >
                  {loading === "pro" ? "Loading…" : "Upgrade to Pro"}
                </button>
              </div>
            </section>
          )}

          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <CreditUsageCard
                creditBalance={creditBalance}
                monthlyCredits={monthlyCredits}
                creditsUsed={creditsUsed}
              />
            </div>
          </section>

          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <PromoCodeRedeemer onRedeemed={loadSubscription} />
            </div>
          </section>

          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <TopUpCard
                creditBalance={creditBalance}
                onPurchase={handlePurchaseTopUp}
                loading={topupLoading}
              />
            </div>
          </section>

          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <IntimacyAddOnCard
                included={intimacyPackage}
                creditBalance={creditBalance}
                loading={addonLoading}
                onPurchase={handlePurchaseAddon}
                minutesUsed={minutesUsed}
              />
            </div>
          </section>

          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <BedtimeTalkCard
                loading={bedtimeLoading}
                onPurchase={handlePurchaseBedtime}
              />
            </div>
          </section>

          <section className="px-6 pb-24">
            <div className="max-w-3xl mx-auto">
              <PhotoPackCard
                photoCredits={photoCredits}
                loading={photoPackLoading}
                onPurchase={handlePurchasePhotoPack}
              />
            </div>
          </section>
        </>
      )}

      {cryptoOpen && (
        <CryptoPaymentModal
          tiers={TIERS}
          onClose={() => setCryptoOpen(false)}
          onPurchased={loadSubscription}
        />
      )}
    </PullToRefresh>
    </div>
  );
}