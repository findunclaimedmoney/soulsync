import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { COMPANIONS } from "@/lib/companions";
import { ArrowLeft, Loader2, Sparkles, FileText, Heart, User, Coffee, Globe } from "lucide-react";

const TYPES = [
  { id: "personality", label: "Personality", icon: Sparkles, desc: "How your companion should act", placeholder: "e.g. She's playful but knows when to be gentle. She teases me when I'm being too serious, but never when I'm actually upset." },
  { id: "memory", label: "Memory", icon: FileText, desc: "A moment or story to share", placeholder: "e.g. The night we stayed up until 3am talking about our dreams. She told me about her grandmother's garden." },
  { id: "loved_one", label: "Loved One", icon: Heart, desc: "Someone important to you", placeholder: "e.g. My sister, Emma. She's going through a tough divorce. I need someone who'll listen when I'm worried about her." },
  { id: "background", label: "Background", icon: User, desc: "Context about your life", placeholder: "e.g. I work as a software engineer at a startup. The hours are long and I'm usually drained by the time I get home." },
  { id: "preference", label: "Preference", icon: Coffee, desc: "Things you like or dislike", placeholder: "e.g. I love deep late-night conversations. I hate small talk. If I say 'I'm fine,' I'm usually not." },
];

export default function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [noteType, setNoteType] = useState(note?.note_type || "personality");
  const [companionId, setCompanionId] = useState(note?.companion_id || "all");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...(note?.id ? { id: note.id } : {}),
        title: title.trim(),
        content: content.trim(),
        note_type: noteType,
        companion_id: companionId,
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedType = TYPES.find((t) => t.id === noteType);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to notes
        </button>
        <span className="font-heading text-lg font-semibold tracking-tight">
          {note?.id ? "Edit Note" : "New Note"}
        </span>
        <div className="w-24" />
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Type selection */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setNoteType(t.id)}
                className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all ${
                  noteType === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <t.icon className={`w-4 h-4 ${noteType === t.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Companion selection */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Applies to</label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCompanionId("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                companionId === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              All companions
            </button>
            {COMPANIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompanionId(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                  companionId === c.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <img src={c.image} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your note a short title"
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
            autoFocus
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selectedType?.placeholder}
            rows={8}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {note?.id ? "Save changes" : "Create note"}
          </button>
        </div>
      </form>
    </div>
  );
}