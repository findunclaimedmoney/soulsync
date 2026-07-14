import React, { useState, useRef, useEffect } from "react";
import { Send, Camera, X } from "lucide-react";
import VoiceRecorderButton from "@/components/VoiceRecorderButton";

export default function ChatInput({ onSend, disabled, messagesRemaining }) {
  const [text, setText] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleVoiceTranscribed = (transcribedText) => {
    if (transcribedText.trim() && !disabled) {
      onSend(transcribedText.trim(), null);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && !pendingPhoto) || disabled) return;
    onSend(trimmed, pendingPhoto);
    setText("");
    setPendingPhoto(null);
    setPhotoPreview(null);
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

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [text]);

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md px-4 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <div className="max-w-2xl mx-auto">
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
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/40 transition-all px-4 py-2.5">
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
            aria-label="Send photo"
          >
            <Camera className="w-4 h-4" />
          </button>
          <VoiceRecorderButton onTranscribed={handleVoiceTranscribed} disabled={disabled} />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={pendingPhoto ? "Add a message…" : "Share what's on your mind…"}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-40"
          />
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !pendingPhoto)}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {messagesRemaining !== null && messagesRemaining !== undefined
            ? messagesRemaining > 0
              ? `${messagesRemaining} free message${messagesRemaining === 1 ? "" : "s"} remaining`
              : "Upgrade to keep chatting"
            : "Your companion is here to listen and chat."}
        </p>
      </div>
    </div>
  );
}