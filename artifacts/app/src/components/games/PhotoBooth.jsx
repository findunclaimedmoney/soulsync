import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Camera, Download, RefreshCw, Zap } from "lucide-react";

const FILTERS = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "noir", label: "Noir", css: "grayscale(100%) contrast(130%) brightness(0.9)" },
  { id: "warm", label: "Warm", css: "sepia(50%) saturate(130%) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "hue-rotate(190deg) saturate(80%) brightness(1.05)" },
  { id: "vivid", label: "Vivid", css: "saturate(180%) contrast(110%)" },
];

export default function PhotoBooth({ companionPortrait, companionName, onBack }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(0);
  const overlayRef = useRef({ x: 60, y: 60, size: 180, loaded: false });
  const draggingRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [filter, setFilter] = useState("normal");
  const [snaps, setSnaps] = useState([]);
  const [stripUrl, setStripUrl] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [corsError, setCorsError] = useState(false);

  const filterCss = FILTERS.find((f) => f.id === filter)?.css ?? "none";

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = companionPortrait;
    img.onload = () => {
      imgRef.current = img;
      overlayRef.current.loaded = true;
    };
    img.onerror = () => {
      // CORS or load failure — try without crossOrigin
      const img2 = new Image();
      img2.src = companionPortrait;
      img2.onload = () => {
        imgRef.current = img2;
        overlayRef.current.loaded = true;
        setCorsError(true); // warn that canvas export may be tainted
      };
    };
  }, [companionPortrait]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const img = imgRef.current;
    if (!canvas || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.filter = filterCss;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    if (img && overlayRef.current.loaded) {
      const { x, y, size } = overlayRef.current;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
      // Circle border
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [filterCss]);

  useEffect(() => {
    if (cameraOn) {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraOn, drawFrame]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      alert("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(rafRef.current);
    setCameraOn(false);
  };

  const snap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/png");
      setSnaps((prev) => [...prev.slice(-3), url]);
    } catch {
      // Canvas tainted (CORS) — notify user
      alert("Could not save photo — companion image has cross-origin restrictions. The live view still works!");
    }
  }, []);

  const startCountdown = () => {
    let n = 3;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        snap();
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  const buildStrip = () => {
    if (snaps.length === 0) return;
    const w = 320;
    const h = 240;
    const gap = 8;
    const strip = document.createElement("canvas");
    strip.width = w + gap * 2;
    strip.height = (h + gap) * snaps.length + gap;
    const ctx = strip.getContext("2d");
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, strip.width, strip.height);
    snaps.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        ctx.drawImage(img, gap, gap + i * (h + gap), w, h);
        if (i === snaps.length - 1) {
          setStripUrl(strip.toDataURL("image/png"));
        }
      };
    });
  };

  // Drag overlay
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const { x, y, size } = overlayRef.current;
    const cx = x + size / 2;
    const cy = y + size / 2;
    if (Math.hypot(mx - cx, my - cy) < size / 2) {
      draggingRef.current = { ox: mx - x, oy: my - y };
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    overlayRef.current.x = mx - draggingRef.current.ox;
    overlayRef.current.y = my - draggingRef.current.oy;
  };

  const handleMouseUp = () => { draggingRef.current = null; };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { stopCamera(); onBack(); }}
          className="text-muted-foreground hover:text-foreground transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-heading text-xl font-semibold">Photo Booth</h2>
          <p className="text-sm text-muted-foreground">with {companionName}</p>
        </div>
      </div>

      {!cameraOn ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30">
            <img src={companionPortrait} alt={companionName} className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-semibold mb-2">Take a photo with {companionName}</p>
            <p className="text-sm text-muted-foreground">Your camera + {companionName} in the same frame. Drag their circle to position it.</p>
          </div>
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Start camera
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-black">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas
              ref={canvasRef}
              className="w-full h-auto cursor-grab active:cursor-grabbing rounded-2xl"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-8xl font-bold drop-shadow-lg">{countdown}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Drag {companionName}'s circle to reposition them
          </p>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={startCountdown}
              disabled={countdown !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {countdown !== null ? `${countdown}…` : "3-2-1 snap!"}
            </button>
            <button
              onClick={snap}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm hover:bg-muted transition-colors"
            >
              <Camera className="w-4 h-4" />
              Snap now
            </button>
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Stop
            </button>
          </div>

          {/* Snaps */}
          {snaps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Your photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {snaps.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-border aspect-video">
                    <img src={url} alt={`Snap ${i + 1}`} className="w-full h-full object-cover" />
                    <a
                      href={url}
                      download={`glimr-photo-${i + 1}.png`}
                      className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                    </a>
                  </div>
                ))}
              </div>
              {snaps.length >= 2 && (
                <button
                  onClick={buildStrip}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Build photo strip
                </button>
              )}
              {stripUrl && (
                <div className="space-y-2">
                  <img src={stripUrl} alt="Photo strip" className="w-full max-w-xs mx-auto rounded-xl border border-border" />
                  <div className="flex justify-center">
                    <a
                      href={stripUrl}
                      download="glimr-strip.png"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download strip
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
