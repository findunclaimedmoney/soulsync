import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Video as VideoIcon, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function VideoUploader({ videoUrl, onChange }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = (file) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = async () => {
      const dur = video.duration;
      if (dur < 13 || dur > 17) {
        toast({
          variant: "destructive",
          title: "Video must be ~15 seconds",
          description: `Your video is ${dur.toFixed(1)}s. Please upload a 13–17 second clip.`,
        });
        return;
      }
      setUploading(true);
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result?.file_url) {
          onChange("video_url", result.file_url);
          toast({ title: "Video uploaded", description: `${dur.toFixed(1)}s clip ready.` });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Upload failed", description: err.message });
      } finally {
        setUploading(false);
      }
    };

    video.onerror = () => {
      toast({ variant: "destructive", title: "Could not read video file" });
    };

    video.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-3">
      <Label>Hero video (15 seconds)</Label>
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : videoUrl ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <video src={videoUrl} className="max-h-32 rounded-xl w-full object-cover" controls />
            <div className="flex items-center gap-1.5 text-sm text-primary">
              <Check className="w-3.5 h-3.5" /> Video uploaded
            </div>
          </div>
        ) : (
          <>
            <VideoIcon className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground text-center">
              Click to upload a 15-second video
              <br />
              <span className="text-xs">Must be 13–17 seconds long</span>
            </span>
          </>
        )}
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
    </div>
  );
}