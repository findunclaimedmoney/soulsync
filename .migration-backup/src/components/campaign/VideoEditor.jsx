import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Check, Scissors, Type, Crop, RotateCw, Gauge, Wand2, RotateCcw, Play, Pause } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const FILTER_PRESETS = {
  None: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 },
  Auto: { brightness: 108, contrast: 115, saturation: 125, sepia: 0, grayscale: 0, hueRotate: 0 },
  Vivid: { brightness: 105, contrast: 120, saturation: 140, sepia: 0, grayscale: 0, hueRotate: 0 },
  Warm: { brightness: 105, contrast: 110, saturation: 115, sepia: 15, grayscale: 0, hueRotate: 0 },
  Cool: { brightness: 103, contrast: 115, saturation: 110, sepia: 0, grayscale: 0, hueRotate: 200 },
  "B&W": { brightness: 105, contrast: 115, saturation: 0, sepia: 0, grayscale: 100, hueRotate: 0 },
  Vintage: { brightness: 105, contrast: 95, saturation: 80, sepia: 40, grayscale: 0, hueRotate: 0 },
};

const DEFAULT_FILTER = { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hueRotate: 0 };

function Slider({ label, value, min, max, step = 1, unit = "", onChange, display }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{display !== undefined ? display : `${value}${unit}`}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

export default function VideoEditor({ videoUrl, onEdited, onClose }) {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTER);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [activeTab, setActiveTab] = useState("filters");
  const [textOverlay, setTextOverlay] = useState("");
  const [textSize, setTextSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPos, setTextPos] = useState({ x: 50, y: 85 });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const animRef = useRef(null);
  const [aiTool, setAiTool] = useState("none");
  const [eraseArea, setEraseArea] = useState({ x: 30, y: 30, w: 40, h: 40 });
  const [eraseBlur, setEraseBlur] = useState(25);
  const [chromaColor, setChromaColor] = useState("#00b140");
  const [chromaThreshold, setChromaThreshold] = useState(45);
  const [denoise, setDenoise] = useState(false);

  const filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) hue-rotate(${filters.hueRotate}deg)`;

  useEffect(() => {
    const v = videoRef.current;
    const onMeta = () => {
      setDuration(v.duration);
      setTrimEnd(v.duration);
      const canvas = canvasRef.current;
      canvas.width = v.videoWidth || 1280;
      canvas.height = v.videoHeight || 720;
      setLoaded(true);
    };
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const drawFrame = useCallback(() => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas || !loaded) return;
    const ctx = canvas.getContext("2d");

    const vw = v.videoWidth || canvas.width;
    const vh = v.videoHeight || canvas.height;
    const sx = crop.x * vw;
    const sy = crop.y * vh;
    const sw = crop.w * vw;
    const sh = crop.h * vh;

    if (rotation === 90 || rotation === 270) {
      canvas.width = sh;
      canvas.height = sw;
    } else {
      canvas.width = sw;
      canvas.height = sh;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.filter = filterStr;
    ctx.drawImage(v, sx, sy, sw, sh, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    if (textOverlay) {
      ctx.restore();
      ctx.save();
      ctx.filter = "none";
      ctx.font = `bold ${textSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 8;
      const tx = (textPos.x / 100) * canvas.width;
      const ty = (textPos.y / 100) * canvas.height;
      ctx.fillText(textOverlay, tx, ty);
    }
    ctx.restore();

    // AI: Magic Erase — blur selected area across all frames
    if (aiTool === "erase") {
      const ex = (eraseArea.x / 100) * canvas.width;
      const ey = (eraseArea.y / 100) * canvas.height;
      const ew = (eraseArea.w / 100) * canvas.width;
      const eh = (eraseArea.h / 100) * canvas.height;
      ctx.filter = `blur(${eraseBlur}px)`;
      ctx.drawImage(canvas, ex, ey, ew, eh, ex, ey, ew, eh);
      ctx.filter = "none";
    }
    // AI: Background Remover — chroma key
    if (aiTool === "chroma") {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const cr = parseInt(chromaColor.slice(1, 3), 16);
      const cg = parseInt(chromaColor.slice(3, 5), 16);
      const cb = parseInt(chromaColor.slice(5, 7), 16);
      const thresh = chromaThreshold * 3;
      for (let i = 0; i < data.length; i += 4) {
        const dist = Math.sqrt((data[i]-cr)**2 + (data[i+1]-cg)**2 + (data[i+2]-cb)**2);
        if (dist < thresh) { data[i] = 0; data[i+1] = 0; data[i+2] = 0; }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [filterStr, loaded, crop, rotation, textOverlay, textSize, textColor, textPos, aiTool, eraseArea, eraseBlur, chromaColor, chromaThreshold]);

  useEffect(() => {
    if (!loaded) return;
    drawFrame();
  }, [drawFrame, currentTime, loaded]);

  useEffect(() => {
    if (!isPlaying || !loaded) return;
    const loop = () => {
      drawFrame();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, drawFrame, loaded]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      if (v.currentTime < trimStart) v.currentTime = trimStart;
      if (v.currentTime >= trimEnd) v.currentTime = trimStart;
      v.playbackRate = speed;
      v.volume = volume;
      v.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (currentTime >= trimEnd && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    if (currentTime < trimStart) {
      videoRef.current.currentTime = trimStart;
    }
  }, [currentTime, trimEnd, trimStart, isPlaying]);

  const handleAutoEnhance = () => {
    const v = videoRef.current;
    if (!v) return;
    const tmp = document.createElement("canvas");
    const sw = Math.min(v.videoWidth || 320, 320);
    const sh = Math.min(v.videoHeight || 180, 180);
    tmp.width = sw;
    tmp.height = sh;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(v, 0, 0, sw, sh);
    const sample = tctx.getImageData(0, 0, sw, sh);
    const data = sample.data;
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
    const avgBrightness = (totalR + totalG + totalB) / (3 * count);
    const brightness = avgBrightness < 100 ? Math.min(160, 100 + (100 - avgBrightness) * 0.6) : avgBrightness > 180 ? Math.max(80, 100 - (avgBrightness - 180) * 0.4) : 105;
    const contrast = avgBrightness < 80 || avgBrightness > 180 ? 125 : 115;
    const saturation = 130;
    setFilters({ ...DEFAULT_FILTER, brightness: Math.round(brightness), contrast: Math.round(contrast), saturation: Math.round(saturation) });
    toast({ title: "Auto-enhanced", description: `Brightness ${Math.round(brightness)}%, contrast ${Math.round(contrast)}%, saturation ${Math.round(saturation)}%` });
  };

  const handleExport = async () => {
    setProcessing(true);
    setProgress(0);
    const v = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(v);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume;

      let lastNode = gainNode;
      if (denoise) {
        const highpass = audioCtx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 85;
        const denoiseComp = audioCtx.createDynamicsCompressor();
        denoiseComp.threshold.value = -40;
        denoiseComp.knee.value = 10;
        denoiseComp.ratio.value = 6;
        denoiseComp.attack.value = 0.005;
        denoiseComp.release.value = 0.1;
        lastNode.connect(highpass);
        highpass.connect(denoiseComp);
        lastNode = denoiseComp;
      }
      lastNode.connect(audioCtx.destination);
      const audioDest = audioCtx.createMediaStreamDestination();
      lastNode.connect(audioDest);

      const vw = v.videoWidth || 1280;
      const vh = v.videoHeight || 720;
      const sx = crop.x * vw;
      const sy = crop.y * vh;
      const sw = crop.w * vw;
      const sh = crop.h * vh;

      if (rotation === 90 || rotation === 270) {
        canvas.width = sh;
        canvas.height = sw;
      } else {
        canvas.width = sw;
        canvas.height = sh;
      }

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm;codecs=vp8,opus";

      const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const done = new Promise((resolve) => { recorder.onstop = resolve; });

      recorder.start(100);
      v.currentTime = trimStart;
      v.playbackRate = speed;
      v.volume = 0;
      await v.play();

      const drawLoop = () => {
        if (v.currentTime >= trimEnd || v.ended) {
          if (recorder.state !== "inactive") recorder.stop();
          return;
        }
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.filter = filterStr;
        ctx.drawImage(v, sx, sy, sw, sh, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

        if (textOverlay) {
          ctx.restore();
          ctx.save();
          ctx.filter = "none";
          ctx.font = `bold ${textSize}px sans-serif`;
          ctx.fillStyle = textColor;
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.shadowBlur = 8;
          const tx = (textPos.x / 100) * canvas.width;
          const ty = (textPos.y / 100) * canvas.height;
          ctx.fillText(textOverlay, tx, ty);
        }
        ctx.restore();

        // AI: Magic Erase (export)
        if (aiTool === "erase") {
          const ex = (eraseArea.x / 100) * canvas.width;
          const ey = (eraseArea.y / 100) * canvas.height;
          const ew = (eraseArea.w / 100) * canvas.width;
          const eh = (eraseArea.h / 100) * canvas.height;
          ctx.filter = `blur(${eraseBlur}px)`;
          ctx.drawImage(canvas, ex, ey, ew, eh, ex, ey, ew, eh);
          ctx.filter = "none";
        }
        // AI: Background Remover (export)
        if (aiTool === "chroma") {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const cr = parseInt(chromaColor.slice(1, 3), 16);
          const cg = parseInt(chromaColor.slice(3, 5), 16);
          const cb = parseInt(chromaColor.slice(5, 7), 16);
          const thresh = chromaThreshold * 3;
          for (let i = 0; i < data.length; i += 4) {
            const dist = Math.sqrt((data[i]-cr)**2 + (data[i+1]-cg)**2 + (data[i+2]-cb)**2);
            if (dist < thresh) { data[i] = 0; data[i+1] = 0; data[i+2] = 0; }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        setProgress(Math.round(((v.currentTime - trimStart) / (trimEnd - trimStart)) * 100));
        requestAnimationFrame(drawLoop);
      };
      requestAnimationFrame(drawLoop);

      await done;
      v.pause();
      v.volume = volume;
      await audioCtx.close();

      const blob = new Blob(chunks, { type: "video/webm" });
      const file = new File([blob], "edited-video.webm", { type: "video/webm" });
      const res = await base44.integrations.Core.UploadFile({ file });

      if (res.data?.file_url) {
        toast({ title: "Video edited", description: "Edited video saved to campaign." });
        onEdited(res.data.file_url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      v.volume = volume;
      toast({ variant: "destructive", title: "Export failed", description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const tabs = [
    { id: "filters", label: "Filters", icon: Wand2 },
    { id: "trim", label: "Trim", icon: Scissors },
    { id: "text", label: "Text", icon: Type },
    { id: "crop", label: "Crop", icon: Crop },
    { id: "speed", label: "Speed", icon: Gauge },
    { id: "ai", label: "AI", icon: Wand2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border safe-area-top">
        <h2 className="font-heading text-lg font-semibold">Video Editor</h2>
        <div className="flex gap-2">
          {!processing && (
            <button onClick={handleExport} className="min-h-[40px] px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
              <Check className="w-4 h-4" /> Export &amp; Save
            </button>
          )}
          <button onClick={onClose} disabled={processing} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <video ref={videoRef} src={videoUrl} crossOrigin="anonymous" className="hidden" />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-black flex items-center justify-center p-4 relative">
          {!loaded ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-[350px] rounded-xl" />
          )}
          {processing && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Exporting... {progress}%</p>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
          <button onClick={togglePlay} disabled={!loaded || processing} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full relative">
            <div className="absolute h-full bg-primary/30 rounded-full" style={{ left: `${(trimStart / duration) * 100}%`, right: `${100 - (trimEnd / duration) * 100}%` }} />
            <div className="absolute w-3 h-3 bg-primary rounded-full -top-[3px]" style={{ left: `calc(${(trimStart / duration) * 100}% - 6px)` }} />
            <div className="absolute w-3 h-3 bg-primary rounded-full -top-[3px]" style={{ left: `calc(${(trimEnd / duration) * 100}% - 6px)` }} />
          </div>
        </div>

        <div className="flex border-b border-border">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${activeTab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "filters" && (
            <>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FILTER_PRESETS).map(([name, vals]) => (
                  <button key={name} onClick={() => setFilters(vals)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 hover:text-primary transition-colors">
                    {name}
                  </button>
                ))}
                <button onClick={() => setFilters(DEFAULT_FILTER)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 transition-colors flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <Slider label="Brightness" value={filters.brightness} min={0} max={200} unit="%" onChange={(v) => setFilters((p) => ({ ...p, brightness: v }))} />
              <Slider label="Contrast" value={filters.contrast} min={0} max={200} unit="%" onChange={(v) => setFilters((p) => ({ ...p, contrast: v }))} />
              <Slider label="Saturation" value={filters.saturation} min={0} max={200} unit="%" onChange={(v) => setFilters((p) => ({ ...p, saturation: v }))} />
              <Slider label="Warmth (Sepia)" value={filters.sepia} min={0} max={100} unit="%" onChange={(v) => setFilters((p) => ({ ...p, sepia: v }))} />
              <Slider label="Grayscale" value={filters.grayscale} min={0} max={100} unit="%" onChange={(v) => setFilters((p) => ({ ...p, grayscale: v }))} />
              <Slider label="Hue Rotate" value={filters.hueRotate} min={0} max={360} unit="°" onChange={(v) => setFilters((p) => ({ ...p, hueRotate: v }))} />
            </>
          )}

          {activeTab === "trim" && (
            <>
              <p className="text-xs text-muted-foreground">Set the start and end points to trim the video. Only the selected portion will be exported.</p>
              <Slider label="Start Point" value={trimStart} min={0} max={duration} step={0.1} onChange={(v) => { setTrimStart(v); videoRef.current.currentTime = v; }} display={formatTime(trimStart)} />
              <Slider label="End Point" value={trimEnd} min={trimStart} max={duration} step={0.1} onChange={(v) => { setTrimEnd(v); videoRef.current.currentTime = v; }} display={formatTime(trimEnd)} />
              <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                Final duration: {formatTime(trimEnd - trimStart)}
              </div>
            </>
          )}

          {activeTab === "text" && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Overlay Text</label>
                <Input value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} placeholder="e.g. GLIMR — Find your person" className="h-10 text-sm" />
              </div>
              <Slider label="Font Size" value={textSize} min={16} max={120} unit="px" onChange={setTextSize} />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Text Color</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-border" />
              </div>
              <Slider label="Horizontal Position" value={textPos.x} min={0} max={100} unit="%" onChange={(v) => setTextPos((p) => ({ ...p, x: v }))} />
              <Slider label="Vertical Position" value={textPos.y} min={0} max={100} unit="%" onChange={(v) => setTextPos((p) => ({ ...p, y: v }))} />
              {textOverlay && (
                <button onClick={() => setTextOverlay("")} className="text-xs text-destructive hover:underline">
                  Remove text
                </button>
              )}
            </>
          )}

          {activeTab === "crop" && (
            <>
              <p className="text-xs text-muted-foreground">Drag the sliders to crop the video frame.</p>
              <Slider label="Left (X)" value={crop.x} min={0} max={0.9} step={0.01} onChange={(v) => setCrop((p) => ({ ...p, x: v, w: Math.min(p.w, 1 - v) }))} />
              <Slider label="Top (Y)" value={crop.y} min={0} max={0.9} step={0.01} onChange={(v) => setCrop((p) => ({ ...p, y: v, h: Math.min(p.h, 1 - v) }))} />
              <Slider label="Width" value={crop.w} min={0.1} max={1} step={0.01} onChange={(v) => setCrop((p) => ({ ...p, w: v }))} />
              <Slider label="Height" value={crop.h} min={0.1} max={1} step={0.01} onChange={(v) => setCrop((p) => ({ ...p, h: v }))} />
              <button onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 transition-colors flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset crop
              </button>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Rotation</span>
                </div>
                <div className="flex gap-1">
                  {[0, 90, 180, 270].map((r) => (
                    <button key={r} onClick={() => setRotation(r)} className={`w-10 h-8 rounded-lg text-xs font-medium transition-colors ${rotation === r ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"}`}>
                      {r}°
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "speed" && (
            <>
              <Slider label="Playback Speed" value={speed} min={0.25} max={3} step={0.25} onChange={setSpeed} display={`${speed}x`} />
              <Slider label="Volume" value={volume} min={0} max={2} step={0.1} onChange={setVolume} display={`${Math.round(volume * 100)}%`} />
              <div className="flex flex-wrap gap-2">
                {[0.25, 0.5, 1, 1.5, 2].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${speed === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/30"}`}>
                    {s}x
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                Final duration after speed: {formatTime((trimEnd - trimStart) / speed)}
              </div>
            </>
          )}

          {activeTab === "ai" && (
            <>
              <p className="text-xs text-muted-foreground">CapCut-style AI tools, all free and browser-based.</p>

              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <button onClick={() => setAiTool(aiTool === "erase" ? "none" : "erase")} className={`w-full text-left text-sm font-medium ${aiTool === "erase" ? "text-primary" : "text-foreground"}`}>
                  Magic Erase {aiTool === "erase" ? "(active)" : ""}
                </button>
                {aiTool === "erase" && (
                  <div className="space-y-3 pl-2">
                    <p className="text-xs text-muted-foreground">Select the area to erase — it will be blurred out across all frames.</p>
                    <Slider label="Area Left (X)" value={eraseArea.x} min={0} max={90} unit="%" onChange={(v) => setEraseArea((p) => ({ ...p, x: v, w: Math.min(p.w, 100 - v) }))} />
                    <Slider label="Area Top (Y)" value={eraseArea.y} min={0} max={90} unit="%" onChange={(v) => setEraseArea((p) => ({ ...p, y: v, h: Math.min(p.h, 100 - v) }))} />
                    <Slider label="Area Width" value={eraseArea.w} min={5} max={100} unit="%" onChange={(v) => setEraseArea((p) => ({ ...p, w: v }))} />
                    <Slider label="Area Height" value={eraseArea.h} min={5} max={100} unit="%" onChange={(v) => setEraseArea((p) => ({ ...p, h: v }))} />
                    <Slider label="Blur Strength" value={eraseBlur} min={5} max={60} unit="px" onChange={setEraseBlur} />
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <button onClick={() => setAiTool(aiTool === "chroma" ? "none" : "chroma")} className={`w-full text-left text-sm font-medium ${aiTool === "chroma" ? "text-primary" : "text-foreground"}`}>
                  Background Remover {aiTool === "chroma" ? "(active)" : ""}
                </button>
                {aiTool === "chroma" && (
                  <div className="space-y-3 pl-2">
                    <p className="text-xs text-muted-foreground">Pick the background color to remove (green screen, solid backdrops).</p>
                    <div className="flex items-center gap-3">
                      <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-border" />
                      <span className="text-xs text-muted-foreground">Background color</span>
                    </div>
                    <Slider label="Threshold" value={chromaThreshold} min={10} max={100} onChange={setChromaThreshold} />
                  </div>
                )}
              </div>

              <button onClick={handleAutoEnhance} className="w-full min-h-[44px] rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                <Wand2 className="w-4 h-4" /> Auto Enhance (AI Color Correction)
              </button>
              <p className="text-xs text-muted-foreground -mt-2">Analyzes the current frame and auto-adjusts brightness, contrast, and saturation.</p>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium">Denoise Audio</p>
                  <p className="text-xs text-muted-foreground">Removes background hum and noise (high-pass filter + compressor)</p>
                </div>
                <button onClick={() => setDenoise(!denoise)} className={`w-11 h-6 rounded-full transition-colors ${denoise ? "bg-primary" : "bg-muted-foreground/30"}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${denoise ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}