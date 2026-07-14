import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { base44 } from "@/api/base44Client";
import { COMPANIONS } from "@/lib/companions";
import NoteEditor from "@/components/notes/NoteEditor";
import PullToRefresh from "@/components/PullToRefresh";
import { Sparkles, Plus, ArrowLeft, FileText, Heart, User, Globe, Coffee, Trash2, Loader2 } from "lucide-react";

const TYPE_META = {
  personality: { label: "Personality", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  memory: { label: "Memory", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  loved_one: { label: "Loved One", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
  background: { label: "Background", icon: User, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  preference: { label: "Preference", icon: Coffee, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function Notes() {
  const goBack = useGoBack();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [companionFilter, setCompanionFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await base44.entities.CompanionNote.list("-updated_date", 200);
      setNotes(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (note) => {
    setEditing(null);
    if (note.id) {
      // Optimistic update — patch in place before backend confirms
      const prev = notes;
      setNotes((cur) => cur.map((n) => (n.id === note.id ? { ...n, ...note, updated_date: new Date().toISOString() } : n)));
      try {
        await base44.entities.CompanionNote.update(note.id, note);
      } catch (err) {
        console.error(err);
        setNotes(prev);
      }
    } else {
      // Optimistic create — insert with a temp ID, then swap for the real one
      const tempId = `temp-${Date.now()}`;
      const optimistic = { ...note, id: tempId, updated_date: new Date().toISOString(), created_date: new Date().toISOString() };
      const prev = notes;
      setNotes((cur) => [optimistic, ...cur]);
      try {
        const created = await base44.entities.CompanionNote.create(note);
        setNotes((cur) => cur.map((n) => (n.id === tempId ? created : n)));
      } catch (err) {
        console.error(err);
        setNotes(prev);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await base44.entities.CompanionNote.delete(id);
    } catch (err) {
      console.error(err);
      loadNotes();
    }
  };

  const filtered = notes.filter((n) => {
    if (filter !== "all" && n.note_type !== filter) return false;
    if (companionFilter !== "all" && n.companion_id !== companionFilter && n.companion_id !== "all") return false;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / (1000 * 60);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  if (editing) {
    return (
      <NoteEditor
        note={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hidden md:flex px-6 py-5 items-center justify-between border-b border-border" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
        </Link>
        <button onClick={goBack} className="flex items-center gap-1.5 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors select-none">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <PullToRefresh onRefresh={loadNotes}>
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight mb-1">Personality Notes</h1>
            <p className="text-sm text-muted-foreground">
              Write memories, personality traits, and context that shape how your companion shows up.
            </p>
          </div>
          <button
            onClick={() => setEditing({ title: "", content: "", note_type: "personality", companion_id: "all" })}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-all hover:gap-3 select-none"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {["all", "personality", "memory", "loved_one", "background", "preference"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "All" : TYPE_META[f]?.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setCompanionFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              companionFilter === "all"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All companions
          </button>
          {COMPANIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompanionFilter(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                companionFilter === c.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <img src={c.image} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
              {c.name}
            </button>
          ))}
        </div>

        {/* Notes list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold mb-2">No notes yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Write a memory of a loved one, describe a personality trait, or share context about your life. Your companion will weave it into how they show up.
            </p>
            <button
              onClick={() => setEditing({ title: "", content: "", note_type: "personality", companion_id: "all" })}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm select-none"
            >
              <Plus className="w-4 h-4" />
              Write your first note
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((note) => {
              const meta = TYPE_META[note.note_type] || TYPE_META.personality;
              const companion = COMPANIONS.find((c) => c.id === note.companion_id);
              return (
                <div
                  key={note.id}
                  onClick={() => setEditing(note)}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <meta.icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-sm text-foreground truncate">{note.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground">{formatDate(note.updated_date)}</span>
                      {companion && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <img src={companion.image} alt={companion.name} className="w-3 h-3 rounded-full object-cover" />
                          {companion.name}
                        </span>
                      )}
                      {note.companion_id === "all" && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          All companions
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="opacity-0 group-hover:opacity-100 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0 select-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
      </PullToRefresh>
    </div>
  );
}