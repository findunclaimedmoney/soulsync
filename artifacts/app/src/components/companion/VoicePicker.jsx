import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function VoicePicker({ voiceId, voiceLocked, companionName, onChange }) {
  const { toast } = useToast();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    base44.functions.invoke("setupCompanion", { action: "list_voices" })
      .then((res) => { if (!res.data?.voices) return; setVoices(res.data.voices); })
      .catch((err) => toast({ variant: "destructive", title: "Failed to load voices", description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const preview = async (id) => {
    setPreviewing(id);
    try {
      const res = await base44.functions.invoke("generateVoice", {
        text: `Hi, I'm ${companionName || "your companion"}. I can't wait to get to know you.`,
        voice_id: id,
      });
      if (res.data?.url) new Audio(res.data.url).play().catch(() => {});
    } catch (err) {
      toast({ variant: "destructive", title: "Preview failed", description: err.message });
    } finally {
      setPreviewing(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (voiceLocked) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5">
        <Mic className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Voice locked — custom voice assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
      {voices.map((v) => (
        <div
          key={v.id}
          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${voiceId === v.id ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <button
            onClick={() => { onChange("voice_id", v.id); onChange("voice_name", v.name); }}
            className="flex-1 text-left"
          >
            <p className="text-sm font-medium">{v.name}</p>
            <p className="text-xs text-muted-foreground">
              {v.labels?.gender || ""} {v.labels?.accent || ""} {v.labels?.age || ""}
            </p>
          </button>
          <button
            onClick={() => preview(v.id)}
            disabled={previewing === v.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            {previewing === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
            Preview
          </button>
        </div>
      ))}
    </div>
  );
}