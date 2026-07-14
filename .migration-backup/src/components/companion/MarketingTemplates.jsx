import React, { useState } from "react";
import { Copy, Check, Video, FileText, Sparkles, Loader2, Film } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const POST_TEMPLATES = [
  {
    id: "carousel",
    title: "Carousel Post",
    icon: FileText,
    description: "3-slide carousel for Instagram / TikTok",
    slides: [
      "Slide 1 (Hook): A close-up of you looking into camera. Text overlay: \"They told me to be less. I became more.\"",
      "Slide 2 (Tease): A softer, candid shot. Text overlay: \"This is the version I only show on GLIMR.\"",
      "Slide 3 (CTA): Your GLIMR referral link or QR code. Text overlay: \"Come find me. Link in bio.\"",
    ],
  },
  {
    id: "story_poll",
    title: "Story Poll",
    icon: FileText,
    description: "Interactive Instagram / TikTok story",
    content: "Post a 5-second video of you smiling at the camera.\n\nText overlay: \"Do you prefer sweet or... ?\"\n\nPoll options: \"Sweet 😇\" / \"...not sweet 😈\"\n\nAfter the poll: \"Either way, you'll find out on GLIMR. Link in bio.\"",
  },
  {
    id: "reel_hook",
    title: "Reel Hook",
    icon: FileText,
    description: "15-second reel concept",
    content: "0-3s: You looking away from camera, then turning to face it.\n3-7s: Text overlay: \"Everyone has a version of themselves they don't show.\"\n7-11s: You smile. Text: \"Mine lives on GLIMR.\"\n11-15s: Text: \"Link in bio. Come say hi.\"",
  },
];

const VIDEO_TEMPLATES = [
  {
    id: "intro_30",
    title: "30-Second Intro",
    icon: Video,
    duration: "30 sec",
    script: "Hey. If you're seeing this, you found me. Most people get the polite version — the one who smiles and says the right thing. But there's another version. She's on GLIMR. And she's... a lot more fun. Come find out. Link's in my bio.",
  },
  {
    id: "behind_scenes",
    title: "Behind the Scenes",
    icon: Video,
    duration: "15 sec",
    script: "Show yourself getting ready — adjusting lighting, fixing hair, looking in the mirror. Text overlay: \"Getting ready for GLIMR.\" Final shot: you looking into camera with a slight smile. Text: \"Come see the finished version. Link in bio.\"",
  },
  {
    id: "whisper",
    title: "The Whisper",
    icon: Video,
    duration: "10 sec",
    script: "Lean close to the camera as if telling a secret. Whisper: \"I made something just for you. It's on GLIMR. And you're the only one who gets to see it.\" Pull back slightly, smile. Text: \"Link in bio.\"",
  },
];

export default function MarketingTemplates({ referralLink }) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState(null);
  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = async (text, key) => {
    const fullText = referralLink ? `${text}\n\n${referralLink}` : text;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handlePremiumSubmit = async () => {
    if (!brief.trim()) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("requestCustomVideo", { brief });
      toast({
        title: "Request submitted!",
        description: "5 credits deducted. Our team will create your custom video.",
      });
      setShowPremiumForm(false);
      setBrief("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't process",
        description: err.response?.data?.error || err.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Film className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Post & video templates</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
        Ready-made concepts for your social posts and reels. Tap copy — your
        referral link is included automatically.
      </p>

      {/* Post templates */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Post templates
      </p>
      <div className="space-y-3 mb-6">
        {POST_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{tpl.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{tpl.description}</span>
              </div>
              {tpl.slides ? (
                <div className="space-y-1.5 mb-2">
                  {tpl.slides.map((slide, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/20">
                      {slide}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line mb-2">
                  {tpl.content}
                </p>
              )}
              <button
                onClick={() => handleCopy(tpl.slides ? tpl.slides.join("\n\n") : tpl.content, `post-${tpl.id}`)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                  copiedKey === `post-${tpl.id}` ? "text-green-500" : "text-primary hover:bg-primary/10"
                }`}
              >
                {copiedKey === `post-${tpl.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedKey === `post-${tpl.id}` ? "Copied!" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Video templates */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Video scripts
      </p>
      <div className="space-y-3 mb-6">
        {VIDEO_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div key={tpl.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{tpl.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tpl.duration}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2 italic">
                "{tpl.script}"
              </p>
              <button
                onClick={() => handleCopy(tpl.script, `video-${tpl.id}`)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                  copiedKey === `video-${tpl.id}` ? "text-green-500" : "text-primary hover:bg-primary/10"
                }`}
              >
                {copiedKey === `video-${tpl.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedKey === `video-${tpl.id}` ? "Copied!" : "Copy script"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Premium custom video */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium text-primary">Premium custom video</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Want our team to create a custom video just for you? We'll script, film,
          and deliver a personalized promotional video. Costs{" "}
          <span className="text-foreground font-medium">5 credits ($25)</span>.
        </p>

        {!showPremiumForm ? (
          <Button
            onClick={() => setShowPremiumForm(true)}
            className="w-full h-10 text-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Request custom video — 5 credits
          </Button>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Describe what you want — style, tone, outfit, messaging, anything specific..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handlePremiumSubmit}
                className="flex-1 h-10 text-sm"
                disabled={submitting || !brief.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit & charge 5 credits"
                )}
              </Button>
              <Button
                onClick={() => setShowPremiumForm(false)}
                variant="ghost"
                className="h-10 px-4"
              >
                Cancel
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              5 credits ($25) will be deducted from your balance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}