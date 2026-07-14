import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Sparkles, Download, MessageCircle } from "lucide-react";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

export default function CreatePersona() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { portraitBase64, faceDescription, suggestedName }
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("Photo must be under 4 MB.");
      return;
    }
    setError(null);
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPhotoPreview(dataUrl);
      // Strip the "data:image/...;base64," prefix
      const b64 = dataUrl.split(",")[1];
      setPhotoBase64(b64);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!photoBase64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/companion/persona/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoBase64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setResult(data);
      setCustomName(data.suggestedName ?? "");
    } catch (err) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocal = () => {
    if (!result) return;
    const name = customName.trim() || result.suggestedName || "My Companion";
    const stored = JSON.parse(localStorage.getItem("glimr_custom_personas") ?? "[]");
    const persona = {
      id: `custom_${Date.now()}`,
      name,
      portraitBase64: result.portraitBase64,
      faceDescription: result.faceDescription,
      createdAt: new Date().toISOString(),
    };
    stored.push(persona);
    localStorage.setItem("glimr_custom_personas", JSON.stringify(stored));
    navigate("/companions");
  };

  const downloadPortrait = () => {
    if (!result?.portraitBase64) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${result.portraitBase64}`;
    a.download = `${customName || "companion"}-portrait.png`;
    a.click();
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-lg font-semibold leading-none">Create your companion</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Upload a photo — AI brings them to life</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Upload area */}
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
            photoPreview ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
          style={{ minHeight: 200 }}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {photoPreview ? (
            <div className="flex flex-col items-center justify-center p-6 gap-4">
              <img
                src={photoPreview}
                alt="Your photo"
                className="w-40 h-40 rounded-2xl object-cover shadow-lg"
              />
              <p className="text-sm text-muted-foreground">Tap to change photo</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP · max 4 MB</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Generate button */}
        {photoBase64 && !result && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating portrait… (~20 seconds)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate companion
              </>
            )}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="relative">
                <img
                  src={`data:image/png;base64,${result.portraitBase64}`}
                  alt="Generated companion"
                  className="w-full aspect-square object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Give them a name…"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 text-sm font-medium outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">AI description: </span>
                  {result.faceDescription}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveToLocal}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Start chatting
              </button>
              <button
                onClick={downloadPortrait}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-border text-sm hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            <button
              onClick={() => { setResult(null); setPhotoPreview(null); setPhotoBase64(null); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Try a different photo
            </button>
          </div>
        )}

        {/* Info note */}
        {!result && (
          <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">How it works:</strong> Your photo is sent to GPT-4o to describe the person's appearance, then DALL-E 3 generates a stylised companion portrait. Your original photo is never stored — only the generated portrait.
          </div>
        )}
      </div>
    </div>
  );
}
