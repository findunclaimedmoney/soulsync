import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Users,
  DollarSign,
  Clock,
  Wallet,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Gift,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGoBack } from "@/hooks/useGoBack";
import { buildReferralLink } from "@/lib/companionStructure";
import OnlyFansCard from "@/components/companion/OnlyFansCard";
import CompanionStatsBar from "@/components/companion/CompanionStatsBar";
import SocialCaptions from "@/components/companion/SocialCaptions";
import MarketingTemplates from "@/components/companion/MarketingTemplates";
import TwinCloneCard from "@/components/companion/TwinCloneCard";

const STATUS_STYLES = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CompanionHub() {
  const goBack = useGoBack();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("getCompanionDashboard", {});
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const copyReferralLink = async () => {
    if (!data?.companion?.referral_code) return;
    const link = buildReferralLink(data.companion.referral_code);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it with your network." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "destructive", title: "Couldn't copy", description: link });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!data?.hasProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header goBack={goBack} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-semibold mb-3">
            You're not a companion yet
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            Apply to become a live companion on GLIMR. Set your rates, create your
            profile, and start earning. You'll also get an affiliate link to refer
            others and earn 5% of their revenue.
          </p>
          <Link to="/companion-apply">
            <Button className="h-12 px-8 font-medium">Apply now</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { companion, referrals = [], earnings = [], summary } = data;
  const refLink = buildReferralLink(companion.referral_code);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <Header goBack={goBack} />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            {companion.profile_image_url ? (
              <img
                src={companion.profile_image_url}
                alt={companion.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-heading text-xl font-semibold">
                {companion.display_name}
              </h2>
              <p className="text-sm text-muted-foreground">{companion.tagline}</p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full border ${
                STATUS_STYLES[companion.status] || STATUS_STYLES.pending
              }`}
            >
              {companion.status}
            </span>
          </div>
          {companion.bio && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {companion.bio}
            </p>
          )}
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-muted-foreground">
              Rate:{" "}
              <span className="text-foreground font-medium">
                ${companion.rate_per_minute_usd?.toFixed(2) || "0.00"}/min
              </span>
            </span>
          </div>
        </div>

        {/* Referral link */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-primary">Your affiliate link</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Share this link with anyone who'd make a great companion. You earn{" "}
            <span className="text-foreground font-medium">5% of their gross revenue</span>{" "}
            — forever.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-border bg-background text-xs text-muted-foreground truncate">
              {refLink}
            </div>
            <Button
              onClick={copyReferralLink}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              aria-label="Copy referral link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* OnlyFans link */}
        <OnlyFansCard companion={companion} />

        {/* Social media captions */}
        <SocialCaptions referralLink={refLink} />

        {/* Post & video templates */}
        <MarketingTemplates referralLink={refLink} />

        {/* Twin Clone */}
        <TwinCloneCard companion={companion} />

        {/* Stats overview */}
        <CompanionStatsBar summary={summary} />

        {/* Earnings breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium mb-4">Earnings breakdown</h3>
          <div className="space-y-3">
            <EarningRow
              label="Session earnings"
              value={`$${summary?.sessionEarnings?.toFixed(2) || "0.00"}`}
            />
            <EarningRow
              label="Affiliate commission (5%)"
              value={`$${summary?.referralEarnings?.toFixed(2) || "0.00"}`}
            />
          </div>
        </div>

        {/* Referrals list */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Your referrals</h3>
            <span className="text-xs text-muted-foreground">
              {summary?.activeReferrals || 0} active · {summary?.totalReferrals || 0} total
            </span>
          </div>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No referrals yet. Share your link to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="text-foreground">{r.referred_email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{r.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-medium">
                      ${r.total_commission_usd?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent earnings ledger */}
        {earnings.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium mb-4">Recent activity</h3>
            <div className="space-y-3">
              {earnings.slice(0, 10).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="text-foreground">
                      {e.earning_type === "session"
                        ? "Session earning"
                        : e.earning_type === "affiliate_commission"
                        ? "Affiliate commission"
                        : e.earning_type === "payout"
                        ? "Payout"
                        : "Bonus"}
                    </p>
                    {e.description && (
                      <p className="text-xs text-muted-foreground">{e.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ${e.amount_usd?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{e.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ goBack }) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg font-semibold">Creator Hub</h1>
      </div>
    </header>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <p className="font-heading text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EarningRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}