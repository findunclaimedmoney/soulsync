import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Check, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function Slider({ label, value, min, max, step = 1, onChange, display }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

export default function AudioEnhancer({ videoUrl, onEnhanced, onClose }) {
  const { toast } = useToast();
  const [volume, setVolume] = useState(1.5);
  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);
  const [normalize, setNormalize] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleEnhance = async () => {
    setProcessing(true);
    setProgress(0);

    let video, audioCtx, recorder;

    try {
      video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      video.playsInline = true;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error("Could not load video"));
      });
      await new Promise((resolve) => {
        if (video.readyState >= 2) resolve();
        else video.oncanplay = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      const canvasStream = canvas.captureStream(30);

      audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume;

      const bassFilter = audioCtx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.value = 200;
      bassFilter.gain.value = bass;

      const trebleFilter = audioCtx.createBiquadFilter();
      trebleFilter.type = "highshelf";
      trebleFilter.frequency.value = 3000;
      trebleFilter.gain.value = treble;

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.01;
      compressor.release.value = 0.25;

      const dest = audioCtx.createMediaStreamDestination();

      // Build chain: source → gain → bass → treble → [compressor] → dest + speakers
      source.connect(gainNode);
      gainNode.connect(bassFilter);
      bassFilter.connect(trebleFilter);

      if (normalize) {
        trebleFilter.connect(compressor);
        compressor.connect(dest);
        compressor.connect(audioCtx.destination);
      } else {
        trebleFilter.connect(dest);
        trebleFilter.connect(audioCtx.destination);
      }

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm;codecs=vp8,opus";

      recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const recordingDone = new Promise((resolve) => { recorder.onstop = resolve; });

      recorder.start(100);
      video.currentTime = 0;
      await video.play();

      const drawFrame = () => {
        if (video.ended || video.paused) {
          if (recorder.state !== "inactive") recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setProgress(Math.round((video.currentTime / video.duration) * 100));
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);

      await recordingDone;

      video.pause();
      await audioCtx.close();

      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "enhanced-audio.webm", { type: "video/webm" });
      const res = await base44.integrations.Core.UploadFile({ file });

      if (res.data?.file_url) {
        toast({ title: "Audio enhanced", description: "Enhanced video saved to campaign." });
        onEnhanced(res.data.file_url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      if (video) video.pause();
      if (audioCtx && audioCtx.state !== "closed") await audioCtx.close();
      toast({ variant: "destructive", title: "Enhancement failed", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border safe-area-top">
        <h2 className="font-heading text-lg font-semibold">Enhance Audio</h2>
        <div className="flex gap-2">
          {!processing && (
            <button onClick={handleEnhance} className="min-h-[40px] px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
              <Check className="w-4 h-4" /> Enhance & Save
            </button>
          )}
          <button onClick={onClose} disabled={processing} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="rounded-xl bg-black/50 p-8 flex items-center justify-center">
          <Volume2 className="w-12 h-12 text-muted-foreground" />
        </div>

        {processing ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Processing audio... {progress}%</p>
            <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Playing video in real-time to process audio</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Slider label="Volume Boost" value={volume} min={0.5} max={5} step={0.1} display={`${volume.toFixed(1)}x`} onChange={setVolume} />
            <Slider label="Bass" value={bass} min={-12} max={12} step={1} display={`${bass > 0 ? "+" : ""}${bass} dB`} onChange={setBass} />
            <Slider label="Treble" value={treble} min={-12} max={12} step={1} display={`${treble > 0 ? "+" : ""}${treble} dB`} onChange={setTreble} />

            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <div>
                <p className="text-sm font-medium">Normalize Audio</p>
                <p className="text-xs text-muted-foreground">Compress loud & quiet parts for even levels</p>
              </div>
              <button onClick={() => setNormalize(!normalize)} className={`w-11 h-6 rounded-full transition-colors ${normalize ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${normalize ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p>Powered by Web Audio API (free, browser-based):</p>
              <p>Volume boost amplifies the audio track</p>
              <p>Bass / Treble adjust EQ frequencies</p>
              <p>Normalize evens out loud/quiet sections</p>
              <p>Video quality is preserved, audio is re-rendered</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}