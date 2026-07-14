import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Video, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AvatarUploader({ imageUrl, avatarId, avatarStatus, companionName, onChange }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleUpload = async (file) => {
    const img = new Image();
    img.onload = async () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w < 1920 || h < 1080) {
        toast({
          variant: "destructive",
          title: "Image too small",
          description: `Image is ${w}×${h}. Minimum required: 1920×1080.`,
        });
        return;
      }
      setUploading(true);
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result?.file_url) onChange("image_url", result.file_url);
      } catch (err) {
        toast({ variant: "destructive", title: "Upload failed", description: err.message });
      } finally {
        setUploading(false);
      }
    };
    img.onerror = () => {
      toast({ variant: "destructive", title: "Could not read image file" });
    };
    img.src = URL.createObjectURL(file);
  };

  const createAvatar = async () => {
    setCreating(true);
    try {
      const res = await base44.functions.invoke("createLiveAvatar", {
        image_url: imageUrl,
        companion_name: companionName,
      });
      if (res.data?.avatar_id) {
        onChange("avatar_id", res.data.avatar_id);
        onChange("avatar_status", res.data.avatar_status || "processing");
        toast({ title: "Avatar submitted", description: "Processing takes up to 24 hours." });
      } else if (res.data?.error) {
        toast({ variant: "destructive", title: "Failed", description: res.data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("createLiveAvatar", { action: "check", avatar_id: avatarId });
      if (res.data?.avatar_status) {
        onChange("avatar_status", res.data.avatar_status);
        toast({ title: res.data.avatar_status === "active" ? "Avatar ready!" : "Still processing" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Check failed", description: err.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Profile photo & avatar</Label>
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Preview" className="max-h-48 rounded-xl object-cover" />
        ) : (
          <>
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload photo</span>
            <span className="text-xs text-muted-foreground/70">Minimum 1920×1080</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
        />
      </label>

      {imageUrl && !avatarId && (
        <Button onClick={createAvatar} disabled={!companionName || creating} className="w-full">
          {creating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating avatar...</>
          ) : (
            <><Video className="w-4 h-4 mr-2" /> Create HeyGen avatar</>
          )}
        </Button>
      )}

      {avatarId && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            {avatarStatus === "active" ? (
              <><Check className="w-4 h-4 text-primary" /><span className="text-sm text-primary font-medium">Avatar ready</span></>
            ) : avatarStatus === "processing" ? (
              <><Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /><span className="text-sm">Processing...</span></>
            ) : (
              <span className="text-sm text-destructive">Failed</span>
            )}
          </div>
          <Button onClick={checkStatus} disabled={checking} variant="ghost" size="sm">
            {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Check
          </Button>
        </div>
      )}
    </div>
  );
}