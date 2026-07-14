import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Video, X, Loader2, MessageCircle } from "lucide-react";

const MIA_IMAGE =
  "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png";

export default function MiaVideoWidget() {
  const [open, setOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const iframeRef = useRef(null);

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("miaCustomerService", {});
      if (res.data?.error) throw new Error(res.data.error);
      setEmbedUrl(res.data.url);
      setTimeLeft(res.data.session_duration_seconds || 300);
    } catch (err) {
      setError(err.message || "Couldn't start video. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await startSession();
  };

  const handleClose = () => {
    setOpen(false);
    setEmbedUrl(null);
    setError(null);
    setTimeLeft(null);
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || !open) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, open]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-5 py-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:opacity-90 transition-all"
        >
          <div className="relative">
            <img src={MIA_IMAGE} alt="Mia" className="w-8 h-8 rounded-full object-cover object-top" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">Mia is live</p>
            <p className="text-[10px] opacity-70 leading-none mt-0.5">Video chat 24/7</p>
          </div>
        </button>
      )}

      {/* Video panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col"
          style={{ height: "min(520px, calc(100vh - 3rem))" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={MIA_IMAGE} alt="Mia" className="w-9 h-9 rounded-full object-cover object-top border-2 border-white/20" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Mia · Customer Service</p>
                <p className="text-[10px] opacity-70 leading-none mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Live video · 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {timeLeft !== null && timeLeft > 0 && !loading && !error && (
                <span className="text-xs font-medium opacity-80">{formatTime(timeLeft)}</span>
              )}
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 relative bg-background">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Mia is getting ready…</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={startSession}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Try again
                </button>
              </div>
            ) : timeLeft === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <img src={MIA_IMAGE} alt="Mia" className="w-16 h-16 rounded-full object-cover object-top" />
                <p className="font-heading text-lg font-semibold">Time's up!</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Thanks for chatting with Mia. Start a new session anytime, or sign up to meet all our companions.
                </p>
                <button
                  onClick={startSession}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Chat with Mia again
                </button>
              </div>
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                allow="microphone; camera"
                title="Mia customer service video"
                className="w-full h-full"
              />
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-primary/10 text-center border-t border-border">
            <a href="/" className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:gap-2.5 transition-all">
              <Video className="w-3 h-3" />
              Meet all companions
            </a>
          </div>
        </div>
      )}
    </>
  );
}