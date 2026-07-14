import React, { useState } from "react";
import { Copy, Users, Sparkles, Loader2, Check, Clock, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const PACKAGES = [
  {
    months: 3,
    credits: 15,
    usd: 75,
    perMonth: 25,
    label: "3 Months",
    popular: false,
  },
  {
    months: 6,
    credits: 25,
    usd: 125,
    perMonth: 20.83,
    label: "6 Months",
    popular: true,
    savings: "Save 17%",
  },
  {
    months: 12,
    credits: 40,
    usd: 200,
    perMonth: 16.67,
    label: "12 Months",
    popular: false,
    savings: "Save 33%",
  },
];

export default function TwinCloneCard({ companion }) {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !imageFile) return;
    setSubmitting(true);
    try {
      // Upload image
      const uploadRes = await base44.integrations.Core.UploadFile({ file: imageFile });
      const imageUrl = uploadRes.file_url;

      // Create twin clone
      const res = await base44.functions.invoke("createTwinClone", {
        image_url: imageUrl,
        package_months: selectedPackage.months,
      });

      toast({
        title: "Twin clone created!",
        description: `${selectedPackage.credits} credits deducted. Your twin is processing — live within 24 hours.`,
      });
      setSelectedPackage(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't create twin",
        description: err.response?.data?.error || err.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-primary">Twin Clone</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Create an AI twin of yourself that's available 24/7 — even when you're
        offline. Clients can book sessions with your twin anytime.
      </p>

      {/* Revenue split info */}
      <div className="grid grid-cols-3 gap-2 mb-5 text-center">
        <div className="rounded-xl bg-background border border-border p-2.5">
          <p className="font-heading text-base font-semibold text-foreground">60%</p>
          <p className="text-[10px] text-muted-foreground">You keep</p>
        </div>
        <div className="rounded-xl bg-background border border-border p-2.5">
          <p className="font-heading text-base font-semibold text-foreground">20%</p>
          <p className="text-[10px] text-muted-foreground">Platform fee</p>
        </div>
        <div className="rounded-xl bg-background border border-border p-2.5">
          <p className="font-heading text-base font-semibold text-foreground">20%</p>
          <p className="text-[10px] text-muted-foreground">Twin revenue</p>
        </div>
      </div>

      {/* Package selection */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Choose your package
      </p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {PACKAGES.map((pkg) => {
          const selected = selectedPackage?.months === pkg.months;
          return (
            <button
              key={pkg.months}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative rounded-xl border p-3 text-center transition-all ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/30"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  POPULAR
                </span>
              )}
              <p className="text-sm font-semibold text-foreground">{pkg.label}</p>
              <p className="font-heading text-xl font-bold text-primary mt-1">
                {pkg.credits}
              </p>
              <p className="text-[10px] text-muted-foreground">credits</p>
              <p className="text-[10px] text-muted-foreground mt-1">${pkg.usd}</p>
              {pkg.savings && (
                <p className="text-[9px] text-green-500 mt-0.5">{pkg.savings}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Image upload */}
      {selectedPackage && (
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Upload your photo
          </p>
          <label className="cursor-pointer block">
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Twin source" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tap to upload</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Use a clear, front-facing photo for best results
          </p>
        </div>
      )}

      {/* Submit */}
      {selectedPackage && (
        <Button
          onClick={handleSubmit}
          className="w-full h-11 font-medium"
          disabled={submitting || !imageFile}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating your twin...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create twin — {selectedPackage.credits} credits
            </>
          )}
        </Button>
      )}

      {/* Fine print */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Twin goes live within 24 hours of photo submission</span>
        </div>
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
          <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            GLIMR takes 20% of all twin session revenue (in addition to the
            standard 20% platform fee). You keep 60% of twin sessions.
          </span>
        </div>
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
          <Users className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Your twin operates independently — clients can book sessions with
            your twin even when you're offline. All earnings flow to your
            account.
          </span>
        </div>
      </div>
    </div>
  );
}