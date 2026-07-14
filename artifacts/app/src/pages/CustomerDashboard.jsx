import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User, Mail, KeyRound, LogOut, Loader2, ArrowRight, Plus } from "lucide-react";
import { TIER_CREDITS } from "@/lib/creditSystem";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import FeatureAccessGrid from "@/components/dashboard/FeatureAccessGrid";
import CompanionShortcuts from "@/components/dashboard/CompanionShortcuts";
import IntimacyJourneyBanner from "@/components/dashboard/IntimacyJourneyBanner";
import PullToRefresh from "@/components/PullToRefresh";


export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCompanions, setCustomCompanions] = useState([]);

  const loadData = async () => {
    try {
      const [userRes, subRes] = await Promise.all([
        base44.auth.me(),
        base44.functions.invoke("getSubscription", {}),
      ]);
      setProfile(userRes);
      setSub(subRes?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomCompanions = async () => {
    try {
      const list = await base44.entities.CustomCompanion.list("-created_date", 50);
      setCustomCompanions(list ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadCustomCompanions();
  }, []);

  const handleRefresh = async () => {
    await loadData();
    await loadCustomCompanions();
  };

  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const tier = sub?.tier || "free";
  const creditBalance = sub?.credit_balance ?? 0;
  const monthlyCredits = sub?.monthly_credits || TIER_CREDITS[tier] || 0;
  const creditsUsed = sub?.credits_used || 0;
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="flex px-6 py-5 items-center justify-between border-b border-border"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
            alt="GLIMR"
            className="h-10 w-10 rounded-lg"
          />
          <span className="font-heading text-xl font-semibold tracking-tight text-primary">GLIMR</span>
        </Link>
        <Link
          to="/account"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary/40 transition-colors"
        >
          <User className="w-4 h-4 text-muted-foreground" />
        </Link>
      </header>

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-8 pb-24">
          {/* Greeting */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">
              Hi, {firstName}
            </h1>
          </div>

          {/* Subscription & Credits */}
          <SubscriptionCard
            tier={tier}
            creditBalance={creditBalance}
            monthlyCredits={monthlyCredits}
            creditsUsed={creditsUsed}
            videoMinutesLimit={sub?.video_minutes_limit || 0}
            videoMinutesUsed={sub?.video_minutes_used || 0}
          />

          {/* Intimacy journey */}
          <IntimacyJourneyBanner
            videoMinutesUsed={sub?.video_minutes_used || 0}
            intimacyPackage={sub?.intimacy_package || false}
          />

          {/* Feature access */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">Features</h2>
            </div>
            <FeatureAccessGrid />
          </section>

          {/* Companion shortcuts */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">Your companion</h2>
            </div>
            <CompanionShortcuts customCompanions={customCompanions} />
          </section>

          {/* Profile & Account */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Personal details</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  Name
                </span>
                <span className="text-sm font-medium">{profile?.full_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
                <span className="text-sm font-medium break-all">{profile?.email || "—"}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                to="/account"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Edit profile
              </Link>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:border-primary/40 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Reset password
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:border-destructive/40 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          </section>
        </main>
      </PullToRefresh>
    </div>
  );
}