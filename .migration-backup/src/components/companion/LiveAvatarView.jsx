import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Shirt, Users, Crown, Lock, Sparkles, Clock, AlertCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const OUTFITS = [
  { id: null, label: "Default" },
  { id: "silk_robe", label: "Silk Robe" },
  { id: "nurse", label: "Nurse" },
  { id: "gown", label: "Evening Gown" },
];

const DURATIONS = [
  { value: 15, label: "15 min", credits: 15, display: "15 credits" },
  { value: 30, label: "30 min", credits: 30, display: "30 credits" },
  { value: 60, label: "1 hour", credits: 60, display: "60 credits" },
];

export default function LiveAvatarView({ companion, onClose }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [twinUrl, setTwinUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twinLoading, setTwinLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [avatarProcessing, setAvatarProcessing] = useState(false);
  const [liveAvatarId, setLiveAvatarId] = useState(companion.avatar_id || null);
  const [liveAvatarStatus, setLiveAvatarStatus] = useState(companion.avatar_status || null);
  const [duration, setDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [lowBalance, setLowBalance] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const fetchEmbed = useCallback(async (outfit, twin = false, dur = null) => {
    const payload = {
      companion_name: companion.name,
      personality: companion.personality,
      avatar_id: outfit || liveAvatarId || null,
      twin,
    };
    if (dur) payload.duration = dur;

    const res = await base44.functions.invoke("liveavatarEmbed", payload);
    if (res.data?.upgrade_required) {
      return { upgradeRequired: true, message: res.data.message };
    }
    if (res.data?.error) throw new Error(res.data.error);
    return {
      url: res.data?.url,
      sessionDurationSeconds: res.data?.session_duration_seconds || null,
      creditBalance: res.data?.credit_balance,
      lowBalanceWarning: res.data?.low_balance_warning,
    };
  }, [companion]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // If this is a custom companion with avatar still processing, check status first
        let stillProcessing = false;
        if (liveAvatarStatus === "processing") {
          setAvatarProcessing(true);
          setLoading(false);
          try {
            const checkRes = await base44.functions.invoke("createLiveAvatar", {
              action: "check",
              companion_name: companion.name,
              avatar_id: liveAvatarId || null,
              companion_id: companion.id,
            });
            if (cancelled) return;
            if (checkRes.data?.avatar_status === "active" && checkRes.data?.avatar_id) {
              setAvatarProcessing(false);
              setLiveAvatarId(checkRes.data.avatar_id);
              setLiveAvatarStatus("active");
            } else {
              stillProcessing = true;
            }
          } catch (e) {
            stillProcessing = true;
          }
          if (cancelled || stillProcessing) return;
          setLoading(true);
        }

        const subRes = await base44.functions.invoke("getSubscription", {});
        if (!cancelled) {
          setSubscription(subRes.data);
          setSubLoading(false);
          // If intimacy is included in tier (pro/vip), start video immediately
          if (subRes.data?.intimacy_package) {
            setDuration("included");
          }
        }
        if (cancelled) return;

        // If no intimacy package, show duration picker (don't auto-start)
        if (!subRes.data?.intimacy_package) {
          setLoading(false);
          return;
        }

        const result = await fetchEmbed(null);
        if (cancelled) return;
        if (result.upgradeRequired) {
          setError(result.message || "Upgrade required");
        } else {
          setEmbedUrl(result.url);
          if (result.sessionDurationSeconds) setTimeLeft(result.sessionDurationSeconds);
          if (result.lowBalanceWarning) setLowBalance(result.creditBalance);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companion.id]);

  const handleOutfitChange = async (outfitId) => {
    setSelectedOutfit(outfitId);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEmbed(outfitId, false, duration === "included" ? null : duration);
      if (result.upgradeRequired) {
        setError(result.message);
      } else {
        setEmbedUrl(result.url);
        if (result.sessionDurationSeconds) setTimeLeft(result.sessionDurationSeconds);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSummonTwin = async () => {
    setTwinLoading(true);
    try {
      const result = await fetchEmbed(selectedOutfit, true, duration === "included" ? null : duration);
      if (result.upgradeRequired) {
        setError(result.message);
      } else {
        setTwinUrl(result.url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setTwinLoading(false);
    }
  };

  const handleDurationSelect = async (dur) => {
    setDuration(dur);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEmbed(null, false, dur);
      if (result.upgradeRequired) {
        setError(result.message);
      } else {
        setEmbedUrl(result.url);
        if (result.sessionDurationSeconds) setTimeLeft(result.sessionDurationSeconds);
        if (result.lowBalanceWarning) setLowBalance(result.creditBalance);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasIntimacy = subscription?.intimacy_package;
  const hasTwin = subscription?.twin_enabled;

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || loading || error) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        if (prev <= 30 && !showWarning) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, loading, error, onClose, showWarning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const showPicker = !subLoading && subscription && !subscription.intimacy_package && duration === null && !loading && !error;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex-shrink-0 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={companion.image} alt={companion.name} className="w-8 h-8 rounded-full object-cover" />
            <h1 className="font-heading text-base font-semibold">
              {companion.name} — face to face
              {twinUrl && <span className="text-primary ml-2">+ Twin</span>}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && !loading && !error && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                showWarning ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
              }`}>
                {showWarning ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-y-auto">
        {showPicker ? (
          <div className="flex flex-col items-center gap-6 max-w-sm w-full">
            <div className="text-center">
              <h2 className="font-heading text-2xl font-semibold mb-2">Choose your session</h2>
              <p className="text-sm text-muted-foreground">How long would you like to spend with {companion.name}?</p>
            </div>

            {subscription.credit_balance > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{subscription.credit_balance.toFixed(1)} credits</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 w-full">
              {DURATIONS.map((d) => {
                const affordable = subscription.credit_balance >= d.credits;
                return (
                  <button
                    key={d.value}
                    onClick={() => affordable && handleDurationSelect(d.value)}
                    disabled={!affordable}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      affordable
                        ? "border-border bg-card hover:border-primary/40"
                        : "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{d.label}</span>
                    </div>
                    <span className="font-heading text-lg font-semibold">{d.display}</span>
                  </button>
                );
              })}
            </div>

            {subscription.credit_balance < 15 && (
              <Link to="/pricing" className="text-sm text-primary hover:underline">
                Add credit →
              </Link>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{companion.name} is getting ready…</p>
          </div>
        ) : avatarProcessing || liveAvatarStatus === "processing" || liveAvatarStatus === "pending_payment" ? (
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <p className="font-heading text-lg font-semibold mb-2">{companion.name}'s video avatar is being created</p>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              We're building a custom face-to-face avatar from your photo. This takes up to 24 hours.
              You can text chat with {companion.name} right now — come back when the avatar is ready.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to chat
            </button>
          </div>
        ) : error ? (
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-foreground mb-2 font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mb-5">
              Upgrade to unlock face-to-face video with your companion.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
            >
              <Sparkles className="w-4 h-4" />
              View Plans
            </Link>
          </div>
        ) : (
          <>
            <div className={`w-full ${twinUrl ? "max-w-4xl grid grid-cols-2 gap-3" : "max-w-2xl"}`}>
              <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
                <iframe
                  src={embedUrl}
                  allow="microphone"
                  title={`${companion.name} video`}
                  className="w-full h-full"
                />
              </div>
              {twinUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-primary/40 shadow-lg">
                  <iframe
                    src={twinUrl}
                    allow="microphone"
                    title={`${companion.name} twin video`}
                    className="w-full h-full"
                  />
                </div>
              )}
              {twinLoading && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-primary/40 shadow-lg flex items-center justify-center bg-card">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hasIntimacy && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border">
                  <Shirt className="w-3.5 h-3.5 text-primary" />
                  {OUTFITS.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => handleOutfitChange(o.id)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                        selectedOutfit === o.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}

              {hasTwin && !twinUrl && !twinLoading && (
                <button
                  onClick={handleSummonTwin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Summon Twin
                </button>
              )}

              {twinUrl && (
                <button
                  onClick={() => setTwinUrl(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Dismiss Twin
                </button>
              )}

              {!hasIntimacy && !hasTwin && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <Crown className="w-4 h-4 text-primary" />
                  Unlock outfits & twin
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}