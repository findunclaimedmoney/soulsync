import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Loader2,
} from "lucide-react";

const STATUS_CONFIG = {
  ok: {
    label: "All Good",
    color: "text-green-500",
    bg: "bg-green-500",
    ring: "ring-green-500/20",
    glow: "shadow-green-500/20",
    icon: CheckCircle,
  },
  warning: {
    label: "Needs Attention",
    color: "text-amber-500",
    bg: "bg-amber-500",
    ring: "ring-amber-500/20",
    glow: "shadow-amber-500/20",
    icon: AlertTriangle,
  },
  error: {
    label: "Immediate Attention",
    color: "text-red-500",
    bg: "bg-red-500",
    ring: "ring-red-500/20",
    glow: "shadow-red-500/20",
    icon: XCircle,
  },
};

export default function HealthCheck() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("healthCheck", {});
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to run health check");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const overall = results?.overall;
  const OverallIcon = overall
    ? STATUS_CONFIG[overall]?.icon
    : Activity;
  const overallConfig = overall ? STATUS_CONFIG[overall] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors select-none"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-heading text-lg font-semibold">System Health</h1>
          </div>
          <button
            onClick={runCheck}
            disabled={loading}
            className="flex items-center gap-2 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted disabled:opacity-50 select-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Re-check
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Overall Status */}
        <div className="flex flex-col items-center mb-10">
          {loading && !results ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Checking systems…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          ) : overallConfig ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative w-24 h-24 rounded-full ${overallConfig.bg}/10 flex items-center justify-center ring-4 ${overallConfig.ring} shadow-lg ${overallConfig.glow}`}
              >
                <OverallIcon className={`w-12 h-12 ${overallConfig.color}`} />
              </div>
              <div className="text-center">
                <p className={`font-heading text-xl font-semibold ${overallConfig.color}`}>
                  {overallConfig.label}
                </p>
                {results?.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked {new Date(results.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Component checks */}
        {results?.checks && (
          <div className="space-y-2">
            {results.checks.map((check, idx) => {
              const config = STATUS_CONFIG[check.status];
              const Icon = config.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className="text-sm font-medium">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {check.message}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color} bg-muted`}
                    >
                      {check.status === "ok"
                        ? "OK"
                        : check.status === "warning"
                        ? "Warning"
                        : "Error"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Run button (for manual re-run after initial) */}
        {results && !loading && (
          <button
            onClick={runCheck}
            className="w-full mt-8 flex items-center justify-center gap-2 min-h-[44px] px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity select-none"
          >
            <RefreshCw className="w-4 h-4" />
            Run Health Check
          </button>
        )}
      </div>
    </div>
  );
}