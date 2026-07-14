import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, Loader2, Crown, Lock, Sparkles, Clock,
  AlertCircle, DollarSign, Users
} from "lucide-react";
import { Link } from "react-router-dom";

const DURATIONS = [
  { value: 15, label: "15 min",  credits: 15, display: "15 credits" },
  { value: 30, label: "30 min",  credits: 30, display: "30 credits" },
  { value: 60, label: "1 hour", credits: 60, display: "60 credits" },
];

export default function LiveAvatarView({ companion, onClose }) {
  // Subscription state
  const [subscription,  setSubscription]  = useState(null);
  const [subLoading,    setSubLoading]    = useState(true);

  // Session state
  const [embedUrl,      setEmbedUrl]      = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [duration,      setDuration]      = useState(null); // minutes chosen
  const [timeLeft,      setTimeLeft]      = useState(null); // seconds
  const [showWarning,   setShowWarning]   = useState(false);

  // Twin
  const [twinUrl,       setTwinUrl]       = useState(null);
  const [twinLoading,   setTwinLoading]   = useState(false);

  // ── Load subscription ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("getSubscription", {});
        if (!cancelled) {
          setSubscription(res.data ?? {});
          setSubLoading(false);
        }
      } catch {
        if (!cancelled) setSubLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-start if user already has intimacy package
  useEffect(() => {
    if (subscription?.intimacy_package && !embedUrl && !loading && !error) {
      fetchEmbed(null);
    }
  }, [subscription]);

  // ── Countdown timer ──────────────────────────────────────────────────────

  useEffect(() => {
    if (timeLeft === null || !embedUrl) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) { clearInterval(interval); handleClose(); return 0; }
        if (prev <= 30 && !showWarning) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, embedUrl]);

  // ── Fetch embed URL from backend ─────────────────────────────────────────

  const fetchEmbed = async (durationMinutes) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("liveavatarEmbed", {
        companion_id: companion.id,
        avatar_id:    companion.avatar_id ?? null,
        duration:     durationMinutes,
      });
      const url = res.data?.url;
      if (!url) {
        setError(res.data?.message ?? "No live avatar available for this companion yet.");
        return;
      }
      setEmbedUrl(url);
      if (durationMinutes) setTimeLeft(durationMinutes * 60);
    } catch (err) {
      setError(err.message ?? "Could not start session");
    } finally {
      setLoading(false);
    }
  };

  const handleDurationSelect = (durationMinutes) => {
    setDuration(durationMinutes);
    fetchEmbed(durationMinutes);
  };

  // ── Twin ─────────────────────────────────────────────────────────────────

  const handleSummonTwin = async () => {
    if (!embedUrl) return;
    setTwinLoading(true);
    try {
      const res = await base44.functions.invoke("liveavatarEmbed", {
        companion_id: companion.id,
        avatar_id:    companion.avatar_id ?? null,
      });
      if (res.data?.url) setTwinUrl(res.data.url);
    } catch { /* silent */ }
    setTwinLoading(false);
  };

  const handleDismissTwin = () => setTwinUrl(null);

  // ── Close ────────────────────────────────────────────────────────────────

  const handleClose = () => {
    setEmbedUrl(null);
    setTwinUrl(null);
    setTimeLeft(null);
    onClose();
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Derived ──────────────────────────────────────────────────────────────

  const hasIntimacy  = subscription?.intimacy_package;
  const hasTwin      = subscription?.twin_enabled;
  const creditBal    = subscription?.credit_balance ?? 0;
  const showPicker   = !subLoading && subscription && !hasIntimacy && !embedUrl && !loading && !error;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={companion.image}
              alt={companion.name}
              className="w-8 h-8 rounded-full object-cover object-top"
            />
            <h1 className="font-heading text-base font-semibold">
              {companion.name} — face to face
              {twinUrl && <span className="text-primary ml-2 text-sm">+ Twin</span>}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft !== null && embedUrl && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  showWarning
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {showWarning ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-y-auto">

        {/* Duration picker */}
        {showPicker && (
          <div className="flex flex-col items-center gap-6 max-w-sm w-full">
            <div className="text-center">
              <h2 className="font-heading text-2xl font-semibold mb-2">
                Choose your session
              </h2>
              <p className="text-sm text-muted-foreground">
                How long would you like to spend with {companion.name}?
              </p>
            </div>

            {creditBal > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{creditBal.toFixed(1)} credits</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 w-full">
              {DURATIONS.map((d) => {
                const affordable = creditBal >= d.credits;
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
                    <span className="font-heading text-lg font-semibold">
                      {d.display}
                    </span>
                  </button>
                );
              })}
            </div>

            {creditBal < 15 && (
              <Link to="/pricing" className="text-sm text-primary hover:underline">
                Add credit →
              </Link>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {companion.name} is getting ready…
            </p>
          </div>
        )}

        {/* Error / upsell */}
        {!loading && error && (
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-foreground mb-2 font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mb-5">
              Upgrade to unlock face-to-face video with {companion.name}.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
            >
              <Sparkles className="w-4 h-4" />
              View plans
            </Link>
          </div>
        )}

        {/* Live session — iframe(s) */}
        {!loading && !error && embedUrl && (
          <>
            <div
              className={`w-full ${
                twinUrl ? "max-w-5xl grid grid-cols-2 gap-3" : "max-w-3xl"
              }`}
            >
              {/* Primary avatar */}
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-black aspect-video">
                <iframe
                  src={embedUrl}
                  allow="microphone; camera"
                  title={`${companion.name} Live Avatar`}
                  className="w-full h-full"
                  style={{ border: "none" }}
                />
              </div>

              {/* Twin */}
              {twinUrl && (
                <div className="rounded-2xl overflow-hidden border border-primary/40 shadow-lg bg-black aspect-video">
                  <iframe
                    src={twinUrl}
                    allow="microphone; camera"
                    title={`${companion.name} Twin`}
                    className="w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>
              )}

              {twinLoading && !twinUrl && (
                <div className="aspect-video rounded-2xl border border-primary/40 flex items-center justify-center bg-card">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
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
                  onClick={handleDismissTwin}
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
                  Unlock twin &amp; more
                </Link>
              )}
            </div>
          </>
        )}

        {/* Initial loading */}
        {subLoading && (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}
