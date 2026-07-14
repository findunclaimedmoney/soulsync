import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const hasSpeechAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * VoiceRecorderButton
 *
 * If the browser supports the Web Speech API (Chrome, Safari, Edge):
 *   - Live transcription: text appears in the textarea as you speak
 *   - onInterim(text) — fired continuously while speaking
 *   - onFinal(text)   — fired once the utterance ends; parent auto-sends
 *
 * If not supported (Firefox):
 *   - Falls back to record → upload → transcribe approach
 *   - onTranscribed(text) — fired once transcription completes
 */
export default function VoiceRecorderButton({
  onInterim,
  onFinal,
  onTranscribed, // legacy fallback callback
  disabled,
}) {
  const [state, setState] = useState("idle"); // idle | listening | processing
  const recognitionRef = useRef(null);

  // ── Web Speech API ──────────────────────────────────────────────────────────
  const startLiveListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-AU";

    let accumulated = ""; // final segments built up as they arrive

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          accumulated += t + " ";
        } else {
          interim = t;
        }
      }
      // Show live text in textarea
      onInterim?.(accumulated + interim);
    };

    recognition.onend = () => {
      setState("idle");
      const final = accumulated.trim();
      if (final) onFinal?.(final);
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      setState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    // state is set to idle in onend
  };

  // ── Fallback: record → upload → transcribe ──────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { setState("idle"); return; }
        setState("processing");
        try {
          const file = new File([blob], "voice.webm", { type: "audio/webm" });
          const uploadRes = await base44.integrations.Core.UploadFile({ file });
          const audioUrl = uploadRes?.file_url;
          if (!audioUrl) throw new Error("Upload failed");
          const transcribeRes = await base44.integrations.Core.TranscribeAudio({ audio_url: audioUrl });
          const text = typeof transcribeRes === "string"
            ? transcribeRes
            : transcribeRes?.text || transcribeRes?.transcript || "";
          if (text.trim()) {
            onTranscribed?.(text.trim());
            onFinal?.(text.trim());
          }
        } catch (err) {
          console.error("Voice transcription failed:", err);
        } finally {
          setState("idle");
        }
      };

      recorder.start();
      setState("listening");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setState("idle");
    }
  };

  const stopRecordingFallback = () => {
    mediaRecorderRef.current?.stop();
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (state === "listening") {
      if (hasSpeechAPI) stopListening();
      else stopRecordingFallback();
      return;
    }
    if (state === "processing") return;

    if (hasSpeechAPI) startLiveListening();
    else startRecordingFallback();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isProcessing}
      aria-label={isListening ? "Stop recording" : "Record voice message"}
      className={`
        relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all
        ${isListening
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      {/* Pulse ring while listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
      )}

      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin relative z-10" />
      ) : isListening ? (
        <Square className="w-3.5 h-3.5 fill-current relative z-10" />
      ) : (
        <Mic className="w-4 h-4 relative z-10" />
      )}
    </button>
  );
}
