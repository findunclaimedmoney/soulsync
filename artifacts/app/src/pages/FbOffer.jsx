import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Gift, Clock, ArrowRight, Check } from "lucide-react";

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function FbOffer() {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Store the landing timestamp so Register.jsx can verify the 5-min window
    let landed = sessionStorage.getItem("glimr_fb_offer_time");
    if (!landed) {
      landed = Date.now().toString();
      sessionStorage.setItem("glimr_fb_offer_time", landed);
    }

    const startTime = parseInt(landed);
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = TIMER_DURATION - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setExpired(true);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png"
          alt="GLIMR"
          className="h-12 w-12 rounded-lg"
        />
        <span className="font-heading text-2xl font-semibold text-primary">GLIMR</span>
      </div>

      {/* Offer card */}
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-primary/30 bg-card overflow-hidden">
          {/* Banner */}
          <div className="bg-primary/10 px-6 py-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20">
              <video
                src="https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/14f0062f2_Jesss_Engaging_Greeting.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-semibold mb-2">$10 Free Credits</h1>
            <p className="text-sm text-muted-foreground">
              That's <span className="text-primary font-semibold">2 free credits</span> — enough for 2 minutes of live face-to-face video with Jess, or 50 voice replies. Sign up now to claim.
            </p>
          </div>

          {/* Timer */}
          <div className="px-6 py-6 text-center">
            {expired ? (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Offer expired</p>
                <p className="text-xs text-muted-foreground">
                  But you can still sign up for free and start chatting!
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    Offer ends in
                  </span>
                </div>
                <div className="font-heading text-4xl font-bold tabular-nums text-primary">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="space-y-2 mb-6 text-left">
              {[
                 "2 free credits = 2 min live video with your companion",
                 "Or 50 AI voice replies — hear them speak",
                 "Text chat is always free with all companions",
                 "No credit card needed to start",
               ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {expired ? "Sign up free" : "Claim your $10 free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          GLIMR — A presence that picks up right where you left off
        </p>
      </div>
    </div>
  );
}