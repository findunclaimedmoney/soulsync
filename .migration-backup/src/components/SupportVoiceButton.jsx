import { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, Pause } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SupportVoiceButton({ text, autoPlay = false }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const hasAutoPlayed = useRef(false);

  const generateAudio = async () => {
    const res = await base44.functions.invoke("generateSupportVoice", {
      text: text.slice(0, 5000),
    });
    return res.data?.url;
  };

  const playUrl = (url) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  };

  const handlePlay = async () => {
    if (audioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setPlaying(true);
      }
      return;
    }

    setLoading(true);
    try {
      const url = await generateAudio();
      if (!url) return;
      setAudioUrl(url);
      playUrl(url);
    } catch (err) {
      console.error("Support voice generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoPlay || hasAutoPlayed.current || !text) return;
    hasAutoPlayed.current = true;
    handlePlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1.5 disabled:opacity-50"
      aria-label={playing ? "Pause voice" : "Play voice"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : playing ? (
        <Pause className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {loading ? "Speaking…" : playing ? "Pause" : "Listen"}
    </button>
  );
}