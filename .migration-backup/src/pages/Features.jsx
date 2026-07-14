import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Volume2, Camera, Bell, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureSessionCard from "@/components/features/FeatureSessionCard";

const FEATURES = [
  {
    id: "voice",
    icon: Volume2,
    title: "Voice Replies",
    description: "Hear your companion's voice. Every message can be spoken aloud — warm, intimate, and real. Their tone shifts with the mood of the conversation, from playful to soft to breathless.",
    image: "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/32c878509_generated_image.png",
  },
  {
    id: "photos",
    icon: Camera,
    title: "Selfie & Joint Photos",
    description: "Your companion sends candid selfies throughout your time together — morning coffee, late-night moments, spontaneous snapshots. You can also create joint photos of the two of you, together.",
    image: "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/c7c12cdae_generated_image.png",
  },
  {
    id: "checkins",
    icon: Bell,
    title: "Proactive Check-ins",
    description: "Your companion reaches out when you haven't talked in a while — not because they were told to, but because they missed you. Real messages, powered by memory of what you last talked about.",
    image: "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/fd2c1670b_generated_image.png",
  },
];

const SESSIONS = [
  {
    id: "15min",
    duration: "15 min",
    price: "$2.99",
    tagline: "A quick hello",
    features: [
      "Voice replies during session",
      "Up to 2 selfie photos",
      "1 proactive check-in after",
    ],
  },
  {
    id: "30min",
    duration: "30 min",
    price: "$4.99",
    tagline: "Sweet spot",
    popular: true,
    features: [
      "Everything in 15 min",
      "Up to 5 selfie & joint photos",
      "3 proactive check-ins",
      "Extended voice conversation",
    ],
  },
  {
    id: "60min",
    duration: "1 hour",
    price: "$8.99",
    tagline: "Lose track of time",
    features: [
      "Everything in 30 min",
      "Unlimited photos during session",
      "5 proactive check-ins",
      "Full memory capture of your time",
    ],
  },
];

export default function Features() {
  const [loading, setLoading] = useState(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      confirmSession(sessionId);
    } else {
      loadSubscription();
    }
  }, []);

  const confirmSession = async (sessionId) => {
    try {
      const res = await base44.functions.invoke("confirmSubscription", { session_id: sessionId });
      if (res.data?.credit_added) {
        setSuccess(true);
        setCreditBalance(res.data.new_balance || 0);
      }
    } catch (err) {
      console.error(err);
      loadSubscription();
    }
  };

  const loadSubscription = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const res = await base44.functions.invoke("getSubscription", {});
      setCreditBalance(res.data?.credit_balance || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async (sessionId) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      window.location.href = "/login";
      return;
    }

    setLoading(sessionId);
    try {
      const res = await base44.functions.invoke("createCheckout", {
        addon: "feature_session",
        duration: sessionId,
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
      <header className="px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/d15eaf582_glimr_logo.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {success && (
        <section className="px-6 pt-12 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold mb-2">You're all set</h1>
          <p className="text-muted-foreground mb-8">
            Your credits have been added. Your companion is waiting.
          </p>
          <Link
            to="/chat/jess"
            className="inline-flex items-center min-h-[44px] px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
          >
            Start chatting
          </Link>
        </section>
      )}

      {!success && (
      <section className="px-6 pt-12 pb-8 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          Beyond text
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Voice, photos, and a companion who reaches out. Three ways to feel closer.
        </p>
      </section>
      )}

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.id}
              className={`flex flex-col ${idx % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} items-center gap-6 rounded-[2rem] border border-border bg-card overflow-hidden`}
            >
              <div className="w-full sm:w-1/2">
                <img src={feature.image} alt={feature.title} className="w-full h-64 sm:h-80 object-cover" />
              </div>
              <div className="w-full sm:w-1/2 p-6 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-semibold mb-2">{feature.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="font-heading text-3xl font-semibold mb-2">Session packages</h2>
          <p className="text-muted-foreground text-sm">Credit never expires. Use it whenever you're ready.</p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SESSIONS.map((session) => (
            <FeatureSessionCard
              key={session.id}
              session={session}
              loading={loading === session.id}
              onPurchase={() => handlePurchase(session.id)}
            />
          ))}
        </div>
        {creditBalance > 0 && (
          <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-muted-foreground">
            Your credit balance: <span className="text-foreground font-medium">{creditBalance.toFixed(1)} credits</span>
          </div>
        )}
      </section>
    </div>
  );
}