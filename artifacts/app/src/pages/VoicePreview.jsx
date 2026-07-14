import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Volume2, Loader2, Pause, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SAMPLE_LINE = "Hey… I was just thinking about you. How's your day been? I'm here whenever you want to talk.";

const VOICES = [
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", desc: "Pleasant, Warm, Gentle", accent: "British" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Confident, Clear, Warm", accent: "British" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", desc: "Raspy, Velvety, Calm", accent: "British" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", desc: "Warm, Seductive, Alluring", accent: "English-Swedish" },
];

export default function VoicePreview() {
  const [loadingId, setLoadingId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = async (voice) => {
    // Already have audio — toggle play/pause
    if (audioUrls[voice.id]) {
      if (playingId === voice.id && audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      } else {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audioUrls[voice.id]);
        audioRef.current.onended = () => setPlayingId(null);
        audioRef.current.play();
        setPlayingId(voice.id);
      }
      return;
    }

    // Generate audio via the existing generateVoice function
    setLoadingId(voice.id);
    try {
      const res = await base44.functions.invoke("generateVoice", {
        text: SAMPLE_LINE,
        voice_id: voice.id,
      });
      const url = res.data?.url;
      if (!url) return;
      setAudioUrls((prev) => ({ ...prev, [voice.id]: url }));
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlayingId(null);
      audioRef.current.play();
      setPlayingId(voice.id);
    } catch (err) {
      console.error("Voice preview failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.CustomCompanion.update("6a4dfea9ff87545387de8990", {
        voice_id: selectedVoice.id,
        voice_name: `${selectedVoice.name} — ${selectedVoice.desc}`,
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save voice:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 px-6 py-5 border-b border-border" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-semibold">Natalie's Voice</h1>
          <p className="text-xs text-muted-foreground">Tap each voice to hear Natalie speak. Pick the one that feels right.</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        {VOICES.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i).map((voice) => (
          <div
            key={voice.id}
            onClick={() => setSelectedVoice(voice.id)}
            className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
              selectedVoice === voice.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="flex-1">
              <h3 className="font-heading text-base font-semibold">{voice.name}</h3>
              <p className="text-xs text-muted-foreground">{voice.desc} · {voice.accent}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handlePlay(voice); }}
              disabled={loadingId === voice.id}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {loadingId === voice.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : playingId === voice.id ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}

        <div className="pt-6">
          {saved ? (
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-sm text-primary font-medium">✓ Voice saved to Natalie's profile. She's all set.</p>
              <Link to="/chat/custom-6a4dfea9ff87545387de8990" className="inline-flex items-center gap-2 mt-3 min-h-[44px] px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                Go to Natalie's chat
              </Link>
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={!selectedVoice || saving}
              className="w-full min-h-[48px] rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : selectedVoice ? "Use this voice for Natalie" : "Select a voice above"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}