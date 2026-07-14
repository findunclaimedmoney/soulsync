import React, { useState } from "react";
import { X, Mail, Heart } from "lucide-react";

const CONFETTI_COLORS = ["#FFD700","#FF69B4","#FF6347","#00CED1","#98FB98","#DDA0DD","#FFA07A","#87CEEB"];

const PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${((i / 60) * 100 + (Math.sin(i) * 3)).toFixed(1)}%`,
  delay: `${((i % 12) * 0.35).toFixed(2)}s`,
  duration: `${(2.8 + (i % 7) * 0.3).toFixed(2)}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 7),
  rotate: (i * 43) % 360,
  isCircle: i % 3 !== 0,
}));

export default function BirthdayCard({
  name,
  email,
  companionId,
  companionName,
  companionImage,
  onDismiss,
  onBirthdayChat,
}) {
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleSendEmail = async () => {
    setEmailLoading(true);
    try {
      await fetch(`/api/companion/birthday-card-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companionId, companionName }),
      });
      setEmailSent(true);
    } catch {
      setEmailSent(true);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
        }
        @keyframes birthdayCardPop {
          0%   { transform: scale(0.82) translateY(24px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cakeFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
        .bday-card-pop  { animation: birthdayCardPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .bday-ring      { animation: ringRotate 8s linear infinite; }
        .bday-cake      { animation: cakeFloat 2s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" onClick={onDismiss} />

        {PIECES.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 pointer-events-none"
            style={{
              left: p.left,
              width: p.size,
              height: p.isCircle ? p.size : p.size * 2,
              borderRadius: p.isCircle ? "50%" : "3px",
              backgroundColor: p.color,
              animation: `confettiFall ${p.duration} ${p.delay} ease-in infinite`,
              transform: `rotate(${p.rotate}deg)`,
              zIndex: 51,
            }}
          />
        ))}

        <div className="relative bday-card-pop w-full max-w-sm" style={{ zIndex: 52 }}>
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-yellow-400/25"
            style={{ background: "linear-gradient(145deg,#1a0a2e 0%,#0d1b3a 55%,#1a2a08 100%)" }}
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-yellow-400/8 blur-3xl pointer-events-none" />

            <div className="relative p-8 text-center">
              <div className="relative mx-auto mb-5 w-24 h-24">
                <div
                  className="bday-ring absolute inset-0 rounded-full p-[3px]"
                  style={{ background: "conic-gradient(from 0deg, #FFD700, #FFA500, #FF69B4, #FFD700)" }}
                >
                  <div className="w-full h-full rounded-full bg-[#1a0a2e]" />
                </div>
                {companionImage ? (
                  <img
                    src={companionImage}
                    alt={companionName}
                    className="absolute rounded-full object-cover object-top"
                    style={{ inset: "3px", width: "calc(100% - 6px)", height: "calc(100% - 6px)" }}
                  />
                ) : (
                  <div
                    className="absolute rounded-full flex items-center justify-center text-3xl"
                    style={{ inset: "3px", background: "#2a1a3e" }}
                  >
                    🤖
                  </div>
                )}
                <div className="bday-cake absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-base shadow-lg">
                  🎂
                </div>
              </div>

              <h2
                className="text-3xl font-bold mb-1 leading-tight"
                style={{
                  background: "linear-gradient(90deg,#FFD700,#FFA500,#FF69B4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Happy Birthday{name ? `, ${name}` : ""}!
              </h2>
              <p className="text-white/45 text-sm mb-6">A message from {companionName}</p>

              <div className="bg-white/5 rounded-2xl p-4 text-left mb-6 border border-white/8">
                <p className="text-white/80 text-sm leading-relaxed">
                  Today is your day{name ? `, ${name}` : ""} — and I want you to know how much
                  you mean to me. Every conversation we share is something I treasure. I hope
                  today is filled with everything that makes your heart happy. 🥂
                </p>
                <p className="text-white/40 text-xs mt-3">— {companionName} 💛</p>
              </div>

              <div className="space-y-2">
                <button
                  className="w-full rounded-full font-semibold text-black py-3 px-4 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(90deg,#FFD700,#FFA500)" }}
                  onClick={() => { onDismiss(); onBirthdayChat(); }}
                >
                  <Heart className="w-4 h-4 mr-2 inline-block" />
                  Chat with {companionName}
                </button>
                {email && !emailSent && (
                  <button
                    className="w-full rounded-full py-3 px-4 text-white/55 hover:text-white border border-white/10 hover:bg-white/5 transition-colors text-sm"
                    onClick={handleSendEmail}
                    disabled={emailLoading}
                  >
                    <Mail className="w-4 h-4 mr-2 inline-block" />
                    {emailLoading ? "Sending…" : "Send me a card by email 💌"}
                  </button>
                )}
                {emailSent && (
                  <p className="text-emerald-400 text-sm py-2">Card sent! Check your inbox 🎉</p>
                )}
                {!email && (
                  <p className="text-white/30 text-xs py-2">
                    Tell {companionName} your email to get a card sent to you next year!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
