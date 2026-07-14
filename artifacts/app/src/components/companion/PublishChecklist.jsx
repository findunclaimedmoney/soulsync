import React from "react";
import { Check, AlertCircle } from "lucide-react";

export default function PublishChecklist({ items }) {
  const passedCount = items.filter((i) => i.passed).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{passedCount}/{items.length} complete</p>
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(passedCount / items.length) * 100}%` }}
          />
        </div>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            item.passed ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              item.passed ? "bg-primary" : "bg-muted-foreground/20"
            }`}
          >
            {item.passed ? (
              <Check className="w-3 h-3 text-primary-foreground" />
            ) : (
              <AlertCircle className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${item.passed ? "text-foreground" : "text-muted-foreground"}`}>
              {item.label}
            </p>
            {item.detail && (
              <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}