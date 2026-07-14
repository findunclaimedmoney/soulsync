import { useState, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VoiceRecorderButton({ onTranscribed, disabled }) {
  const [state, setState] = useState("idle"); // idle | recording | processing
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const handleToggle = async () => {
    if (state === "recording") {
      mediaRecorder.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        if (blob.size < 1000) {
          setState("idle");
          return;
        }
        setState("processing");
        try {
          const file = new File([blob], "voice.webm", { type: "audio/webm" });
          const uploadRes = await base44.integrations.Core.UploadFile({ file });
          const audioUrl = uploadRes?.file_url;
          if (!audioUrl) throw new Error("Upload failed");
          const transcribeRes = await base44.integrations.Core.TranscribeAudio({
            audio_url: audioUrl,
          });
          const text = typeof transcribeRes === "string"
            ? transcribeRes
            : transcribeRes?.text || transcribeRes?.transcript || "";
          if (text.trim()) onTranscribed(text.trim());
        } catch (err) {
          console.error("Voice transcription failed:", err);
        } finally {
          setState("idle");
        }
      };

      recorder.start();
      setState("recording");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setState("idle");
    }
  };

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isProcessing}
      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        isRecording
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "bg-muted text-muted-foreground hover:text-foreground"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      aria-label={isRecording ? "Stop recording" : "Record voice message"}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <div className="w-3 h-3 rounded-sm bg-destructive-foreground" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}