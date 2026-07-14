import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Check, Sparkles } from "lucide-react";

export default function OnlyFansCard({ companion, onSaved }) {
  const [url, setUrl] = useState(companion.onlyfans_url || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.HumanCompanion.update(companion.id, {
        onlyfans_url: url.trim(),
      });
      setSaved(true);
      onSaved?.(url.trim());
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">GLIMRME link</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Add your external profile URL (OnlyFans, GLIMRME, etc.) so users can find you there too. Shown on your public companion card.
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="https://onlyfans.com/yourusername"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-11"
        />
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-4 flex-shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-3"
        >
          <ExternalLink className="w-3 h-3" />
          View your profile
        </a>
      )}
    </div>
  );
}