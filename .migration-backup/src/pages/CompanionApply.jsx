import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateReferralCode } from "@/lib/companionStructure";

export default function CompanionApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [ratePerMinute, setRatePerMinute] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      // Upload profile image if provided
      let imageUrl = "";
      if (profileImage) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: profileImage });
        imageUrl = uploadRes.file_url;
      }

      const refCode = generateReferralCode(displayName);
      const storedRef = localStorage.getItem("glimr_ref_code");

      await base44.entities.HumanCompanion.create({
        display_name: displayName.trim(),
        tagline: tagline.trim() || "Companion",
        bio: bio.trim(),
        profile_image_url: imageUrl,
        rate_per_minute_usd: parseFloat(ratePerMinute) || 0,
        referral_code: refCode,
        referred_by_code: storedRef || null,
        status: "pending",
        platform_fee_percent: 20,
        affiliate_rate_percent: 5,
        payout_method: "manual",
      });

      toast({
        title: "Application submitted!",
        description: "Your referral link is ready. We'll review your profile shortly.",
      });
      navigate("/companion-hub");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: err.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading text-lg font-semibold">Become a Companion</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Revenue split banner */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">How earnings work</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">80%</p>
              <p className="text-xs text-muted-foreground">You keep</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">5%</p>
              <p className="text-xs text-muted-foreground">Referrer earns</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">15%</p>
              <p className="text-xs text-muted-foreground">GLIMR fee</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Earn 5% of gross revenue from every companion you refer. Your referral link
            is generated automatically once your profile is created.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile image */}
          <div className="flex flex-col items-center mb-6">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
            <p className="text-xs text-muted-foreground mt-2">Profile photo</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              placeholder="e.g. Jessica"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="A short descriptor — e.g. Warm & grounded"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell users about yourself — your personality, what you offer, what makes you different."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate per minute (USD)</Label>
            <Input
              id="rate"
              type="number"
              step="0.50"
              min="0"
              placeholder="e.g. 2.00"
              value={ratePerMinute}
              onChange={(e) => setRatePerMinute(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              What users pay you per minute for live sessions. You keep 80%.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-medium"
            disabled={loading || !displayName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating profile...
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          Already have a companion profile?{" "}
          <Link to="/companion-hub" className="text-primary hover:underline">
            View dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}