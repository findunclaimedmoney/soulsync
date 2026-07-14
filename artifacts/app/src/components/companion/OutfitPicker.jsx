import React, { useState } from "react";
import { ArrowLeft, Crown, Check, Loader2, Shirt } from "lucide-react";

export const OUTFITS = [
  { id: "default",          name: "Default",           emoji: "✨", desc: "" },
  { id: "lawyer",           name: "Lawyer",             emoji: "⚖️", desc: "wearing a sharp tailored black blazer and crisp white blouse, courtroom professional attire, confident" },
  { id: "doctor",           name: "Doctor",             emoji: "🩺", desc: "wearing a white medical coat with a stethoscope around neck, warm and professional, clinical setting" },
  { id: "flight-attendant", name: "Flight Attendant",   emoji: "✈️", desc: "wearing an elegant navy blue airline uniform with a silk neck scarf, polished professional" },
  { id: "chef",             name: "Chef",               emoji: "🧑‍🍳", desc: "wearing a white chef's coat and apron, warm kitchen ambiance, culinary professional" },
  { id: "date-night",       name: "Date Night",         emoji: "🌹", desc: "wearing an elegant black cocktail dress, minimal gold jewellery, romantic evening out" },
  { id: "gym",              name: "Gym Wear",           emoji: "💪", desc: "wearing athletic gym wear, sporty and confident, fitness studio setting" },
  { id: "cozy",             name: "Cozy Night In",      emoji: "☕", desc: "wearing an oversized cozy knit sweater, warm home setting, relaxed evening look" },
  { id: "formal-gown",      name: "Formal Gown",        emoji: "👗", desc: "wearing a floor-length elegant evening gown, formal black-tie event, glamorous" },
  { id: "artist",           name: "Artist",             emoji: "🎨", desc: "wearing paint-stained denim overalls over a white shirt, creative studio setting" },
  { id: "business",         name: "Business",           emoji: "💼", desc: "wearing smart business casual attire, confident modern office setting" },
  { id: "beach",            name: "Beach Day",          emoji: "🏖️", desc: "wearing a casual summer beach outfit, relaxed sun-kissed tropical setting" },
  { id: "loungewear",       name: "Loungewear",         emoji: "🌙", desc: "wearing soft comfortable loungewear, cozy home evening setting, relaxed" },
  { id: "college",          name: "College Casual",     emoji: "📚", desc: "wearing casual university student style, campus background, youthful energy" },
  { id: "pilot",            name: "Pilot",              emoji: "🛫", desc: "wearing an airline pilot uniform with epaulettes, authoritative and professional" },
  { id: "scientist",        name: "Scientist",          emoji: "🔬", desc: "wearing a white lab coat and safety glasses, modern research laboratory setting" },
];

export default function OutfitPicker({
  companionId,
  companionName,
  companionImage,
  activeOutfitId,
  onSelect,
  onBack,
}) {
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = async (outfit) => {
    if (outfit.id === "default") {
      onSelect("default", null);
      return;
    }

    // Check localStorage cache first
    const cacheKey = `glimr_outfit_${companionId}_${outfit.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      onSelect(outfit.id, cached);
      return;
    }

    setGenerating(outfit.id);
    setError(null);

    try {
      const res = await fetch("/api/companion/outfit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companionId,
          outfitId: outfit.id,
          outfitDescription: outfit.desc,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Generation failed");
      }

      const data = await res.json();
      localStorage.setItem(cacheKey, data.portraitBase64);
      onSelect(outfit.id, data.portraitBase64);
    } catch (err) {
      setError(`Couldn't generate ${outfit.name}. Try again.`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col">
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 pb-3 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold">{companionName}'s Wardrobe</h2>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5">
            <Crown className="w-3 h-3" />
            Spark+ feature
          </span>
        </div>
      </div>

      <p className="flex-shrink-0 text-sm text-muted-foreground px-4 pt-4 pb-2">
        Choose a look for {companionName}. Each outfit is AI-generated — takes ~20 seconds the first time, instant after.
      </p>

      {error && (
        <div className="flex-shrink-0 mx-4 mb-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto">
          {OUTFITS.map((outfit) => {
            const isDefault = outfit.id === "default";
            const isActive = activeOutfitId === outfit.id;
            const isGenerating = generating === outfit.id;

            return (
              <button
                key={outfit.id}
                onClick={() => !isGenerating && handleSelect(outfit)}
                disabled={isGenerating || (generating !== null && !isGenerating)}
                className={`relative rounded-2xl border p-4 text-center transition-all flex flex-col items-center gap-2 ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                } ${isGenerating ? "opacity-70" : ""}`}
              >
                {isDefault ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {companionImage && (
                      <img src={companionImage} alt="Default" className="w-full h-full object-cover object-top" />
                    )}
                  </div>
                ) : (
                  <span className="text-3xl leading-none">{outfit.emoji}</span>
                )}

                <span className="text-xs font-medium text-foreground/80 leading-tight">{outfit.name}</span>

                {isActive && !isGenerating && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-background/70 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground">Generating…</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
