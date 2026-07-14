import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Upload, Mic, Volume2, Check, Crown, Star,
  Loader2, Info, Music, User, ChevronRight, X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Your image", "Their voice", "Choose plan"];

const PRESET_VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella",     gender: "f", desc: "Warm & expressive"    },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Charlotte", gender: "f", desc: "Soft & intimate"       },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Freya",     gender: "f", desc: "Bold & confident"      },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Alice",     gender: "f", desc: "Sophisticated & clear" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Lily",      gender: "f", desc: "Bright & playful"      },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Daniel",    gender: "m", desc: "Deep & reliable"       },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Oliver",    gender: "m", desc: "Calm & measured"       },
  { id: "cjVigY5qzO86Huf0OWal", name: "Callum",    gender: "m", desc: "Warm & grounded"       },
  { id: "nPczCjzI2devNBz1zQrb", name: "Patrick",   gender: "m", desc: "Smooth & charming"     },
];

const PACKAGES = [
  {
    tier: "pro",
    label: "Pro",
    price: "A$99",
    period: "/mo",
    badge: null,
    icon: Star,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    borderColor: "border-primary/30",
    btnClass: "bg-primary text-primary-foreground hover:opacity-90",
    features: [
      "Custom avatar live in your account",
      "Unlimited text chat",
      "Voice replies in your chosen voice",
      "Selfie & outfit photos",
      "35 monthly credits",
    ],
  },
  {
    tier: "vip",
    label: "VIP",
    price: "A$199",
    period: "/mo",
    badge: "Most complete",
    icon: Crown,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    btnClass: "bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:opacity-90",
    features: [
      "Everything in Pro",
      "Live video face-to-face",
      "Intimacy Layer unlocked",
      "Outfit Studio & Summon Twin",
      "50 monthly credits",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-3 py-5">
      {STEPS.map((label, i) => {
        const done    = i + 1 < step;
        const active  = i + 1 === step;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                done   ? "bg-primary text-primary-foreground" :
                active ? "bg-primary/20 border-2 border-primary text-primary" :
                         "bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 -mt-4 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomAvatar() {
  const navigate  = useNavigate();
  const imageRef  = useRef(null);
  const audioRef  = useRef(null);

  const [step, setStep]           = useState(1);

  // Step 1 — image
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Step 2 — voice
  const [voiceMode, setVoiceMode]         = useState("preset"); // "preset" | "upload"
  const [selectedVoice, setSelectedVoice] = useState(PRESET_VOICES[0]);
  const [audioFile, setAudioFile]         = useState(null);
  const [audioFileName, setAudioFileName] = useState(null);

  // Step 3 — submit
  const [submitting, setSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("");
  const [error, setError]           = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleImageSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleImageSelect(file);
  };

  const handleAudioSelect = (file) => {
    if (!file) return;
    setAudioFile(file);
    setAudioFileName(file.name);
  };

  const handleSubmit = async (tier) => {
    setSubmitting(true);
    setSubmitLabel(tier === "pro" ? "A$99 — Pro" : "A$199 — VIP");
    setError(null);
    try {
      // Upload image + audio in parallel
      const [imageRes, audioRes] = await Promise.all([
        imageFile
          ? base44.integrations.Core.UploadFile({ file: imageFile })
          : Promise.resolve(null),
        (voiceMode === "upload" && audioFile)
          ? base44.integrations.Core.UploadFile({ file: audioFile })
          : Promise.resolve(null),
      ]);

      const imageUrl = imageRes?.file_url ?? null;
      const audioUrl = audioRes?.file_url ?? null;

      // Save the request so admin can process it
      await base44.functions.invoke("storeCustomAvatarRequest", {
        imageUrl,
        voiceId:   voiceMode === "preset" ? selectedVoice.id   : null,
        voiceName: voiceMode === "preset" ? selectedVoice.name : (audioFileName ?? "Custom upload"),
        audioUrl,
        tier,
      });

      // Go to Stripe checkout for the selected plan
      const checkoutRes = await base44.functions.invoke("createCheckout", { tier });
      if (checkoutRes?.data?.url) {
        window.location.href = checkoutRes.data.url;
      } else {
        throw new Error("Checkout URL not returned");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold leading-none">Create your companion</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your image. Your voice. Truly yours.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pb-12 w-full">

          <StepDots step={step} />

          {/* ── STEP 1: Image ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-1">Upload your image</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This becomes your companion's face. Use a photo of anyone you'd like them to look like.
                </p>
              </div>

              {/* Recommended spec banner */}
              <div className="flex items-start gap-2.5 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary leading-relaxed">
                  <span className="font-semibold">Best results: 1920 × 1080 px (landscape).</span> A clear face, good lighting, and minimal background gives the sharpest result.
                </p>
              </div>

              {/* Drop zone */}
              <div
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  imagePreview
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
                onClick={() => imageRef.current?.click()}
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                />

                {imagePreview ? (
                  <div className="flex flex-col items-center gap-4 p-6">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-56 object-cover rounded-xl shadow-lg"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Tap to change photo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <Upload className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Tap to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!imageFile}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Continue to voice <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Voice ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-1">Choose their voice</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pick from our curated voices or upload your own audio to clone a specific voice.
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 p-1 rounded-2xl bg-muted">
                {[
                  { id: "preset", icon: Volume2, label: "Choose a voice" },
                  { id: "upload", icon: Mic, label: "Upload audio" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setVoiceMode(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      voiceMode === id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Preset voices */}
              {voiceMode === "preset" && (
                <div className="space-y-2">
                  {/* Female group */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Female voices</p>
                  {PRESET_VOICES.filter(v => v.gender === "f").map((v) => (
                    <VoiceRow
                      key={v.id}
                      voice={v}
                      selected={selectedVoice?.id === v.id}
                      onSelect={() => setSelectedVoice(v)}
                    />
                  ))}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Male voices</p>
                  {PRESET_VOICES.filter(v => v.gender === "m").map((v) => (
                    <VoiceRow
                      key={v.id}
                      voice={v}
                      selected={selectedVoice?.id === v.id}
                      onSelect={() => setSelectedVoice(v)}
                    />
                  ))}
                </div>
              )}

              {/* Upload audio */}
              {voiceMode === "upload" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-primary leading-relaxed">
                      <span className="font-semibold">Upload 30+ seconds</span> of clean, clear speech (MP3, M4A, WAV). No background music or noise. The more natural the speech, the better the clone.
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      audioFile
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                    onClick={() => audioRef.current?.click()}
                  >
                    <input
                      ref={audioRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/*"
                      className="hidden"
                      onChange={(e) => handleAudioSelect(e.target.files?.[0])}
                    />
                    <div className="flex flex-col items-center justify-center p-10 gap-3 text-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${audioFile ? "bg-primary/10" : "bg-muted"}`}>
                        <Music className={`w-6 h-6 ${audioFile ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      {audioFile ? (
                        <div>
                          <p className="font-semibold text-sm text-primary">{audioFileName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Tap to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm">Upload audio file</p>
                          <p className="text-xs text-muted-foreground mt-1">MP3, WAV or M4A</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={voiceMode === "upload" && !audioFile}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Continue to plan <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 3: Package ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-1">Choose your plan</h2>
                <p className="text-sm text-muted-foreground">
                  Your custom companion will be live within 24 hours of payment.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                {imagePreview && (
                  <img src={imagePreview} alt="Your avatar" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Your selection</p>
                  <p className="text-sm font-semibold truncate">
                    {voiceMode === "preset" ? selectedVoice?.name : audioFileName ?? "Custom audio"}
                    {" "}voice
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Edit
                </button>
              </div>

              {/* Package cards */}
              <div className="space-y-3">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.tier}
                    className={`relative rounded-2xl border bg-card overflow-hidden ${pkg.borderColor}`}
                  >
                    {pkg.badge && (
                      <div className="absolute top-0 left-0 right-0 py-1 text-center text-[10px] font-semibold uppercase tracking-widest bg-amber-500 text-black">
                        {pkg.badge}
                      </div>
                    )}
                    <div className={`p-5 ${pkg.badge ? "pt-8" : ""}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${pkg.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <pkg.icon className={`w-5 h-5 ${pkg.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-heading text-2xl font-bold">{pkg.price}</span>
                            <span className="text-xs text-muted-foreground">{pkg.period}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{pkg.label} plan</p>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-5">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubmit(pkg.tier)}
                        disabled={submitting}
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 ${pkg.btnClass}`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Setting up…
                          </>
                        ) : (
                          <>Get started · {pkg.price}</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                Your avatar is created by our team within 24 hours. You'll receive an email once it's live. Subscription billed monthly — cancel anytime.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Voice row sub-component ──────────────────────────────────────────────────

function VoiceRow({ voice, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
        selected
          ? "border-primary/50 bg-primary/8"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        selected ? "bg-primary/15" : "bg-muted"
      }`}>
        <User className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold leading-none mb-0.5 ${selected ? "text-primary" : ""}`}>
          {voice.name}
        </p>
        <p className="text-xs text-muted-foreground">{voice.desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-primary bg-primary" : "border-border"
      }`}>
        {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>
    </button>
  );
}
