import React, { useState, useRef, useEffect } from "react";
import { Send, Camera, X, Loader2, Mic } from "lucide-react";
import VoiceRecorderButton from "@/components/VoiceRecorderButton";

export default function ChatInput({
  onSend,
  disabled,
  messagesRemaining,
  onRequestPhoto,
  photoCredits = 0,
  requestingPhoto = false,
}) {
  const [text, setText] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSendTimer = useRef(null);

  // ── Voice handlers ──────────────────────────────────────────────────────────

  const handleVoiceInterim = (liveText) => {
    setIsListening(true);
    setText(liveText);
    // Cancel any pending auto-send while still speaking
    clearTimeout(autoSendTimer.current);
  };

  const handleVoiceFinal = (finalText) => {
    setIsListening(false);
    setText(finalText);
    // Auto-send after a brief pause so user can see what was transcribed
    autoSendTimer.current = setTimeout(() => {
      if (finalText.trim()) {
        onSend(finalText.trim(), null);
        setText("");
      }
    }, 700);
  };

  // ── Text / send handlers ────────────────────────────────────────────────────

  const handleSend = () => {
    clearTimeout(autoSendTimer.current);
    const trimmed = text.trim();
    if ((!trimmed && !pendingPhoto) || disabled) return;
    onSend(trimmed, pendingPhoto);
    setText("");
    setPendingPhoto(null);
    setPhotoPreview(null);
    setIsListening(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removePhoto = () => {
    setPendingPhoto(null);
    setPhotoPreview(null);
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [text]);

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(autoSendTimer.current), []);

  return (
    <div
      className="border-t border-border bg-background/80 backdrop-blur-md px-4 py-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Photo preview */}
        {photoPreview && (
          <div className="mb-2 relative inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-20 h-20 rounded-2xl object-cover border border-border"
            />
            <button
              onClick={removePhoto}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Photo request button */}
        {onRequestPhoto && photoCredits > 0 && (
          <div className="mb-2">
            <button
              onClick={onRequestPhoto}
              disabled={requestingPhoto || disabled}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-muted transition-all disabled:opacity-50"
            >
              {requestingPhoto
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Camera className="w-3 h-3" />}
              <span>Send me a photo</span>
              <span className="text-muted-foreground">· {photoCredits} left</span>
            </button>
          </div>
        )}

        {/* Input row */}
        <div className={`
          flex items-end gap-2 rounded-3xl border bg-card shadow-sm px-4 py-2.5 transition-all
          ${isListening
            ? "border-primary/60 ring-2 ring-primary/20"
            : "border-border focus-within:ring-2 focus-within:ring-ring/40"}
        `}>
          {/* Photo attach */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30"
            aria-label="Attach photo"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Live mic */}
          <VoiceRecorderButton
            onInterim={handleVoiceInterim}
            onFinal={handleVoiceFinal}
            disabled={disabled}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { clearTimeout(autoSendTimer.current); setText(e.target.value); }}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={isListening ? "Listening…" : pendingPhoto ? "Add a message…" : "Share what's on your mind…"}
              disabled={disabled}
              className={`
                w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground
                placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-40
                ${isListening ? "text-primary" : ""}
              `}
            />
            {/* Listening indicator dot */}
            {isListening && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-primary font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Speaking
              </span>
            )}
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !pendingPhoto)}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Status line */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          {isListening
            ? "Tap the mic to stop — message sends automatically"
            : messagesRemaining !== null && messagesRemaining !== undefined
              ? messagesRemaining > 0
                ? `${messagesRemaining} free message${messagesRemaining === 1 ? "" : "s"} remaining`
                : "Upgrade to keep chatting"
              : "Your companion is here to listen and chat."}
        </p>
      </div>
    </div>
  );
}
