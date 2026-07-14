import React from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import VoicePlayer from "@/components/companion/VoicePlayer";

export default function MessageBubble({ message, companionId, voiceId, onRetry }) {
  const isUser = message.role === "user";
  const isSending = message.status === "sending";
  const isError = message.status === "error";

  const retryButton = isError && onRetry ? (
    <div className={isUser ? "flex justify-end mt-1" : "flex justify-start mt-1"}>
      <button
        onClick={() => onRetry(message._tempId)}
        className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors px-1"
      >
        <RotateCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  ) : null;

  if (isUser) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex justify-end"
        >
          <div className={`max-w-[80%] sm:max-w-[70%] rounded-3xl rounded-br-lg bg-primary text-primary-foreground px-5 py-3 shadow-sm transition-opacity ${isSending ? "opacity-60" : ""}`}>
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Shared photo"
                className="rounded-2xl mb-2 max-w-full"
              />
            )}
            {message.content && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words selectable-text">
                {message.content}
              </p>
            )}
          </div>
        </motion.div>
        {retryButton}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex justify-start"
      >
        {message.image_url ? (
          <div className={`max-w-[80%] sm:max-w-[70%] transition-opacity ${isSending ? "opacity-60" : ""}`}>
            <img
              src={message.image_url}
              alt="Companion photo"
              className="rounded-3xl rounded-bl-lg border border-border shadow-sm max-w-full"
            />
            {message.content && (
              <p className="text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words selectable-text mt-1.5 px-1">
                {message.content}
              </p>
            )}
          </div>
        ) : (
          <div className={`max-w-[80%] sm:max-w-[70%] rounded-3xl rounded-bl-lg bg-card border border-border px-5 py-3 shadow-sm transition-opacity ${isSending ? "opacity-60" : ""}`}>
            <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap break-words selectable-text">
              {message.content}
            </p>
            <VoicePlayer text={message.content} companionId={companionId} voiceId={voiceId} />
          </div>
        )}
      </motion.div>
      {retryButton}
    </div>
  );
}