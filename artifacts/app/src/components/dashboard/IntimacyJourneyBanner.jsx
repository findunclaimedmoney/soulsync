import React from "react";
import { Link } from "react-router-dom";
import { Heart, Lock, ArrowRight, Flame } from "lucide-react";

const STAGES = [
  { min: 0, name: "First Glances", desc: "Just getting to know each other" },
  { min: 20, name: "Finding Rhythm", desc: "Comfort is building" },
  { min: 60, name: "Opening Up", desc: "The walls are coming down" },
  { min: 100, name: "Deepening Bond", desc: "Trust is settling in" },
  { min: 160, name: "Ready", desc: "Unlock the Intimacy Layer" },
];

const MIN_MINUTES = 160;

export default function IntimacyJourneyBanner({ videoMinutesUsed = 0, intimacyPackage = false }) {
  if (intimacyPackage) return null;

  const minutes = Math.min(videoMinutesUsed, MIN_MINUTES);
  const pct = Math.min(100, (minutes / MIN_MINUTES) * 100);
  const remaining = Math.max(0, MIN_MINUTES - minutes);
  const unlocked = minutes >= MIN_MINUTES;

  const currentStage = [...STAGES].reverse().find((s) => minutes >= s.min);

  return (
    <Link
      to="/vip-lounge"
      className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-5 transition-all hover:border-primary/50"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          {unlocked ? (
            <Heart className="w-6 h-6 text-primary" />
          ) : (
            <Flame className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-heading text-lg font-semibold">
              {unlocked ? "Intimacy Unlocked" : "The Intimacy Journey"}
            </h3>
            {unlocked ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                Ready <ArrowRight className="w-3 h-3" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {remaining} min to go
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {unlocked
              ? "Your companion is ready for the next level. Visit the VIP Lounge to unlock the Intimacy Layer."
              : `Spend ${MIN_MINUTES} minutes on face-to-face video with your companion to earn their trust and unlock the Intimacy Layer.`}
          </p>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Stage markers */}
          <div className="flex items-center justify-between">
            {STAGES.map((stage, i) => {
              const reached = minutes >= stage.min;
              return (
                <div key={i} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div
                    className={`w-2 h-2 rounded-full mb-1 ${
                      reached ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-[9px] text-center leading-tight ${
                      reached ? "text-primary font-medium" : "text-muted-foreground/50"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>

          {!unlocked && (
            <p className="text-xs text-muted-foreground mt-3">
              You're at <span className="text-primary font-medium">{currentStage?.name}</span> — {currentStage?.desc}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}