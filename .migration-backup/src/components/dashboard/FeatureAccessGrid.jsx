import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mic, Video, Heart, Gamepad2, NotebookPen, Sparkles, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Celebrity Avatar",
    cost: "$129 one-time",
    desc: "Upload anyone's photo & bring them to life",
    to: "/create",
    cta: "Create avatar",
  },
  {
    icon: MessageCircle,
    title: "Live text chat",
    cost: "0.05 credits / message",
    desc: "Real conversations that remember everything",
    to: "/chat/jess",
    cta: "Start chatting",
  },
  {
    icon: Mic,
    title: "Voice replies",
    cost: "0.04 credits / reply",
    desc: "Hear your companion speak to you",
    to: "/chat/jess",
    cta: "Listen",
  },
  {
    icon: Video,
    title: "Face-to-face video",
    cost: "0.10 credits / minute",
    desc: "Live video call with your companion",
    to: "/vip-lounge",
    cta: "Start video",
  },
  {
    icon: Heart,
    title: "Intimacy sessions",
    cost: "From $6 / session",
    desc: "Deepen the bond beyond ordinary chat",
    to: "/pricing",
    cta: "Explore",
  },
  {
    icon: Gamepad2,
    title: "Games",
    cost: "Free with your plan",
    desc: "Play trivia and tic-tac-toe together",
    to: "/games",
    cta: "Play",
  },
  {
    icon: NotebookPen,
    title: "Companion notes",
    cost: "Free with your plan",
    desc: "Shape how your companion behaves",
    to: "/notes",
    cta: "Write",
  },
];

export default function FeatureAccessGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FEATURES.map((f) => (
        <Link
          key={f.title}
          to={f.to}
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <f.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm">{f.title}</h3>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">{f.desc}</p>
            <p className="text-xs font-medium text-primary">{f.cost}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}