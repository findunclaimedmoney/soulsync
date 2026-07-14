import React from "react";

export default function VideoMessages({ videos }) {
  return (
    <section className="px-6 py-16 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-center">
          Video Messages
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Press play and hear what she has to say
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
              <video
                src={v.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}