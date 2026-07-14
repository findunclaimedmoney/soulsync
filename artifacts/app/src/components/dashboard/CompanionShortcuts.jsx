import React from "react";
import { Link } from "react-router-dom";
import { COMPANIONS } from "@/lib/companions";
import { ArrowRight } from "lucide-react";

export default function CompanionShortcuts({ customCompanions = [] }) {
  const selectedId = localStorage.getItem("glimr_selected_companion") || "jess";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {COMPANIONS.filter((c) => c.id === selectedId).map((c) => (
        <Link
          key={c.id}
          to={`/chat/${c.id}`}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={c.image}
              alt={c.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="text-[9px] font-medium tracking-wide text-primary uppercase">{c.tagline}</span>
              <h3 className="font-heading text-lg font-semibold text-white">{c.name}</h3>
            </div>
          </div>
        </Link>
      ))}
      {customCompanions.map((c) => (
        <Link
          key={`custom-${c.id}`}
          to={`/chat/custom-${c.id}`}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={c.image_url}
              alt={c.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="text-[9px] font-medium tracking-wide text-primary uppercase">Yours</span>
              <h3 className="font-heading text-lg font-semibold text-white">{c.name}</h3>
            </div>
          </div>
        </Link>
      ))}
      <Link
        to="/create"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 min-h-[120px] p-4 transition-all hover:border-primary/40"
      >
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center mb-2">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground text-center">Create your own</span>
      </Link>
    </div>
  );
}