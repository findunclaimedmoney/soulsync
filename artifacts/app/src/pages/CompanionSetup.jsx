import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Loader2, CreditCard, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BrainGenerator from "@/components/companion/BrainGenerator";
import VoicePicker from "@/components/companion/VoicePicker";
import AvatarUploader from "@/components/companion/AvatarUploader";
import VideoUploader from "@/components/companion/VideoUploader";
import PublishChecklist from "@/components/companion/PublishChecklist";
import { getCompanionChecklist } from "@/lib/companions";

const slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const EMPTY = {
  name: "", companion_id: "", tagline: "", bio: "",
  personality_description: "", brain: "",
  image_url: "", voice_id: "", voice_name: "",
  avatar_id: "", avatar_status: "pending",
  video_url: "", stripe_price_id: "", price_usd: 9.99,
  voice_locked: false,
};

export default function CompanionSetup() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [creatingStripe, setCreatingStripe] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState(EMPTY);

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    base44.auth.me()
      .then((u) => { setUser(u); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  const handleSave = async () => {
    // Hard guard — re-verify every checklist item before touching the database
    const failures = checklist.filter((c) => !c.passed).map((c) => c.label);
    if (failures.length > 0) {
      toast({
        variant: "destructive",
        title: "Cannot publish — checklist incomplete",
        description: failures.join(" · "),
      });
      return;
    }
    setSaving(true);
    try {
      const slug = data.companion_id || slugify(data.name);
      await base44.entities.CompanionConfig.create({
        companion_id: slug,
        name: data.name,
        tagline: data.tagline,
        bio: data.bio,
        personality: data.brain,
        image_url: data.image_url,
        voice_id: data.voice_id,
        voice_name: data.voice_name,
        avatar_id: data.avatar_id,
        avatar_status: data.avatar_status,
        voice_locked: data.voice_locked,
        status: "active",
      });
      setSaved(true);
      toast({ title: "Companion created!", description: `${data.name} is now live.` });
      // Auto-export to Google Sheet
      exportToSheet(slug);
    } catch (err) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const exportToSheet = async (companionId) => {
    setExporting(true);
    try {
      const res = await base44.functions.invoke("exportCompanionToSheet", { companion_id: companionId });
      if (res.data?.success) {
        toast({ title: "Exported to Google Sheet", description: `${res.data.companion} — ${res.data.memories_count} memories, ${res.data.messages_count} messages` });
      } else if (res.data?.error) {
        toast({ variant: "destructive", title: "Export failed", description: res.data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Export failed", description: err.message });
    } finally {
      setExporting(false);
    }
  };

  const createStripeProduct = async () => {
    setCreatingStripe(true);
    try {
      const slug = data.companion_id || slugify(data.name);
      const res = await base44.functions.invoke("createCompanionProduct", {
        name: data.name,
        price_usd: data.price_usd,
        companion_id: slug,
      });
      if (res.data?.price_id) {
        update("stripe_price_id", res.data.price_id);
        toast({ title: "Stripe product created", description: `$${data.price_usd}/mo recurring` });
      } else if (res.data?.error) {
        toast({ variant: "destructive", title: "Stripe failed", description: res.data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Stripe failed", description: err.message });
    } finally {
      setCreatingStripe(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <p className="text-lg font-medium">Admin access required</p>
      </div>
    );
  }

  if (saved) {
    const slug = data.companion_id || slugify(data.name);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold mb-2">{data.name} is live!</h1>
          <p className="text-muted-foreground mb-8">
            Landing page: <a href={`/companion/${slug}`} className="text-primary underline">/companion/{slug}</a>
            <br />
            Chat: <code className="text-primary">/chat/{slug}</code>
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/chat/${slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
            >
              Open chat
            </a>
            <button
              onClick={() => exportToSheet(slug)}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export to Google Sheet
            </button>
            <button
              onClick={() => { setSaved(false); setData(EMPTY); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const checklist = getCompanionChecklist(data);
  const allChecksPassed = checklist.every((c) => c.passed);
  const canSave = allChecksPassed;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="font-heading text-lg font-semibold">New Companion</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Profile</h2>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => { update("name", e.target.value); update("companion_id", slugify(e.target.value)); }}
              placeholder="e.g. Monica"
              className="mt-1.5 h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">URL: /chat/{data.companion_id || "..."}</p>
          </div>
          <div>
            <Label htmlFor="tagline">Tagline *</Label>
            <Input
              id="tagline"
              value={data.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="e.g. She captivates"
              className="mt-1.5 h-12"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Full description of personality and what they offer..."
              className="mt-1.5 min-h-[100px]"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Personality</h2>
          <BrainGenerator
            name={data.name}
            description={data.personality_description}
            brain={data.brain}
            onChange={update}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avatar</h2>
          <AvatarUploader
            imageUrl={data.image_url}
            avatarId={data.avatar_id}
            avatarStatus={data.avatar_status}
            companionName={data.name}
            onChange={update}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Voice</h2>
          <VoicePicker
            voiceId={data.voice_id}
            voiceLocked={data.voice_locked}
            companionName={data.name}
            onChange={update}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Hero Video</h2>
          <VideoUploader
            videoUrl={data.video_url}
            onChange={update}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Stripe Payment</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="price">Monthly price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={data.price_usd}
                onChange={(e) => update("price_usd", parseFloat(e.target.value) || 0)}
                className="mt-1.5 h-12"
                disabled={!!data.stripe_price_id}
              />
            </div>
            <Button
              onClick={createStripeProduct}
              disabled={!data.name || creatingStripe || !!data.stripe_price_id}
              className="h-12"
            >
              {creatingStripe ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : data.stripe_price_id ? (
                <><Check className="w-4 h-4 mr-2" /> Connected</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Create product</>
              )}
            </Button>
          </div>
          {data.stripe_price_id && (
            <p className="text-xs text-primary">Stripe Price ID: {data.stripe_price_id}</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Publish Checklist</h2>
          <PublishChecklist items={checklist} />
        </section>

        <div className="space-y-2">
          <Button onClick={handleSave} disabled={!canSave || saving} className="w-full h-12">
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" /> Publish companion</>
            )}
          </Button>
          {!canSave && (
            <p className="text-xs text-center text-muted-foreground">
              Complete all checklist items above to publish.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}