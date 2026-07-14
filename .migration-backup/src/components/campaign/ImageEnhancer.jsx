import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Check, Wand2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DEFAULTS = { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0 };

const PRESETS = {
  Auto: { brightness: 108, contrast: 115, saturation: 125, blur: 0, sepia: 0 },
  Vivid: { brightness: 105, contrast: 120, saturation: 140, blur: 0, sepia: 0 },
  Warm: { brightness: 105, contrast: 110, saturation: 115, blur: 0, sepia: 15 },
  Cool: { brightness: 103, contrast: 115, saturation: 110, blur: 0, sepia: 0 },
  Soft: { brightness: 110, contrast: 95, saturation: 105, blur: 0.5, sepia: 5 },
};

function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{value}{unit}</span>
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

export default function ImageEnhancer({ imageUrl, onEnhanced, onClose }) {
  const { toast } = useToast();
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [filters, setFilters] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) sepia(${filters.sepia}%)`;

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const maxW = 1920;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      setLoaded(true);
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Load failed", description: "Could not load image for editing (CORS may block it)." });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!loaded || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.filter = filterStr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
  }, [filters, filterStr, loaded]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const file = new File([blob], "enhanced.jpg", { type: "image/jpeg" });
      const res = await base44.integrations.Core.UploadFile({ file });
      if (res.data?.file_url) {
        toast({ title: "Image enhanced", description: "Enhanced image saved to campaign." });
        onEnhanced(res.data.file_url);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border safe-area-top">
        <h2 className="font-heading text-lg font-semibold">Enhance Image</h2>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={!loaded || saving} className="min-h-[40px] px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
          <button onClick={onClose} disabled={saving} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-black/50 flex items-center justify-center p-4">
          {!loaded ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-[400px] rounded-xl" />
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([name, vals]) => (
              <button key={name} onClick={() => setFilters(vals)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 hover:text-primary transition-colors flex items-center gap-1">
                {name === "Auto" && <Wand2 className="w-3 h-3" />}
                {name}
              </button>
            ))}
            <button onClick={() => setFilters(DEFAULTS)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 transition-colors flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <Slider label="Brightness" value={filters.brightness} min={0} max={200} unit="%" onChange={(v) => update("brightness", v)} />
          <Slider label="Contrast" value={filters.contrast} min={0} max={200} unit="%" onChange={(v) => update("contrast", v)} />
          <Slider label="Saturation" value={filters.saturation} min={0} max={200} unit="%" onChange={(v) => update("saturation", v)} />
          <Slider label="Blur" value={filters.blur} min={0} max={10} step={0.1} unit="px" onChange={(v) => update("blur", v)} />
          <Slider label="Sepia / Warmth" value={filters.sepia} min={0} max={100} unit="%" onChange={(v) => update("sepia", v)} />
        </div>
      </div>
    </div>
  );
}