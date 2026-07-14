import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Check, X, Loader2, ExternalLink, Video, MessageCircle, Pencil, Trash2, Upload, Wand2, Volume2, Clapperboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageEnhancer from "@/components/campaign/ImageEnhancer";
import AudioEnhancer from "@/components/campaign/AudioEnhancer";
import VideoEditor from "@/components/campaign/VideoEditor";

export default function CampaignReview() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [enhancer, setEnhancer] = useState(null);

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await base44.entities.MarketingCampaign.list("-created_date", 50);
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handlePublish = async (campaign) => {
    setPublishingId(campaign.id);
    try {
      const res = await base44.functions.invoke("marketingAction", {
        action: "publish_all",
        message: campaign.caption,
        image_url: campaign.image_url || undefined,
        video_url: campaign.video_url || undefined,
      });
      if (res.data?.error) {
        toast({
          variant: "destructive",
          title: "Publish failed",
          description: res.data.error,
        });
      } else {
        const fbId = res.data?.results?.facebook?.post_id || "";
        await base44.entities.MarketingCampaign.update(campaign.id, {
          status: "published",
          fb_post_id: fbId,
        });
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? { ...c, status: "published", fb_post_id: fbId }
              : c
          )
        );
        toast({
          title: res.data?.success ? "Published everywhere!" : "Partially published",
          description: res.data?.message || "Campaign pushed to connected platforms.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: err.message,
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleReject = async (campaign) => {
    try {
      await base44.entities.MarketingCampaign.update(campaign.id, { status: "rejected" });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: "rejected" } : c))
      );
      toast({ title: "Rejected", description: "Campaign marked as rejected." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    }
  };

  const handleEdit = (camp) => {
    setEditingId(camp.id);
    setEditData({ caption: camp.caption || "", image_url: camp.image_url || "", video_url: camp.video_url || "" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = async (camp) => {
    setSavingEdit(true);
    try {
      await base44.entities.MarketingCampaign.update(camp.id, {
        caption: editData.caption,
        image_url: editData.image_url || null,
        video_url: editData.video_url || null,
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === camp.id
            ? { ...c, caption: editData.caption, image_url: editData.image_url, video_url: editData.video_url }
            : c
        )
      );
      setEditingId(null);
      setEditData(null);
      toast({ title: "Saved", description: "Campaign updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (camp) => {
    setDeletingId(camp.id);
    try {
      await base44.entities.MarketingCampaign.delete(camp.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
      toast({ title: "Deleted", description: "Campaign removed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploadingType(type);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      if (res.data?.file_url) {
        setEditData((prev) => ({ ...prev, [type]: res.data.file_url }));
        toast({ title: "Uploaded", description: `${type === "image_url" ? "Image" : "Video"} ready.` });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploadingType(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      draft: "bg-amber-500/10 text-amber-500",
      published: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
      approved: "bg-blue-500/10 text-blue-500",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="flex items-center gap-3 px-6 py-5 border-b border-border"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link
          to="/"
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-semibold">Campaign Review</h1>
          <p className="text-xs text-muted-foreground">
            Mia's daily Facebook campaigns — review, approve & publish.
          </p>
        </div>
        <Link
          to="/mia-marketing"
          className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-4 h-4" />
          Talk to Mia
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Video className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No campaigns yet. Mia generates 3 new ones every morning at 9am.</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(camp.status)}
                      <span className="text-xs text-muted-foreground">
                        {camp.batch_date || new Date(camp.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-semibold">{camp.topic}</h3>
                    {camp.companion_name && (
                      <p className="text-xs text-primary mt-0.5">Featuring {camp.companion_name}</p>
                    )}
                  </div>
                </div>

                {editingId === camp.id ? (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Caption</label>
                      <Textarea
                        value={editData.caption}
                        onChange={(e) => setEditData((p) => ({ ...p, caption: e.target.value }))}
                        className="min-h-[120px] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Image</label>
                      {editData.image_url && (
                        <img src={editData.image_url} alt="Preview" className="w-full max-h-[200px] object-cover rounded-xl mb-2" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={editData.image_url}
                          onChange={(e) => setEditData((p) => ({ ...p, image_url: e.target.value }))}
                          placeholder="Image URL"
                          className="h-10 text-sm"
                        />
                        <label className="min-h-[40px] px-4 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          {uploadingType === "image_url" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files[0], "image_url")}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Video</label>
                      {editData.video_url && (
                        <video src={editData.video_url} controls className="w-full max-h-[200px] object-contain rounded-xl mb-2" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={editData.video_url}
                          onChange={(e) => setEditData((p) => ({ ...p, video_url: e.target.value }))}
                          placeholder="Video URL"
                          className="h-10 text-sm"
                        />
                        <label className="min-h-[40px] px-4 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          {uploadingType === "video_url" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          Upload
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e.target.files[0], "video_url")}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setEnhancer("image")}
                        disabled={!editData.image_url}
                        className="flex-1 min-h-[40px] rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Enhance Image
                      </button>
                      {editData.video_url && (
                        <button
                          onClick={() => setEnhancer("video")}
                          className="flex-1 min-h-[40px] rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Clapperboard className="w-3.5 h-3.5" />
                          Video Editor
                        </button>
                      )}
                      {editData.video_url && (
                        <button
                          onClick={() => setEnhancer("audio")}
                          className="flex-1 min-h-[40px] rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Enhance Audio
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {camp.video_url ? (
                      <div className="rounded-xl overflow-hidden bg-black/50 mb-3 max-h-[400px] flex items-center">
                        <video
                          src={camp.video_url}
                          controls
                          className="w-full max-h-[400px] object-contain"
                        />
                      </div>
                    ) : camp.image_url ? (
                      <div className="rounded-xl overflow-hidden bg-black/50 mb-3">
                        <img
                          src={camp.image_url}
                          alt={camp.companion_name || "Campaign"}
                          className="w-full max-h-[400px] object-cover object-top"
                        />
                      </div>
                    ) : null}

                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {camp.caption}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {camp.status === "draft" && editingId === camp.id && (
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    onClick={() => handleSaveEdit(camp)}
                    disabled={savingEdit}
                    className="flex-1 min-h-[44px] rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="min-h-[44px] px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(camp)}
                    disabled={deletingId === camp.id}
                    className="min-h-[44px] px-6 rounded-full border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deletingId === camp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              )}

              {camp.status === "draft" && editingId !== camp.id && (
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    onClick={() => handlePublish(camp)}
                    disabled={publishingId === camp.id}
                    className="flex-1 min-h-[44px] rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {publishingId === camp.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing to all…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Publish to Facebook + Instagram
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(camp)}
                    className="min-h-[44px] px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleReject(camp)}
                    className="min-h-[44px] px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {camp.status === "published" && camp.fb_post_id && (
                <div className="px-5 pb-5">
                  <a
                    href={`https://facebook.com/${camp.fb_post_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Facebook
                  </a>
                </div>
              )}
            </div>
          ))
        )}
        {enhancer === "image" && editData?.image_url && (
          <ImageEnhancer
            imageUrl={editData.image_url}
            onEnhanced={(url) => { setEditData((p) => ({ ...p, image_url: url })); setEnhancer(null); }}
            onClose={() => setEnhancer(null)}
          />
        )}
        {enhancer === "audio" && editData?.video_url && (
          <AudioEnhancer
            videoUrl={editData.video_url}
            onEnhanced={(url) => { setEditData((p) => ({ ...p, video_url: url })); setEnhancer(null); }}
            onClose={() => setEnhancer(null)}
          />
        )}
        {enhancer === "video" && editData?.video_url && (
          <VideoEditor
            videoUrl={editData.video_url}
            onEdited={(url) => { setEditData((p) => ({ ...p, video_url: url })); setEnhancer(null); }}
            onClose={() => setEnhancer(null)}
          />
        )}
      </div>
    </div>
  );
}