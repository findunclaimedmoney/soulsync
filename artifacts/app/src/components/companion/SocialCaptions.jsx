import React, { useState } from "react";
import { Copy, Check, Instagram, Twitter, Sparkles } from "lucide-react";

const CATEGORIES = [
  {
    id: "tease",
    label: "Tease",
    icon: Sparkles,
    captions: [
      "You've seen the version of me everyone else gets. Come meet the one they don't. 🔥 Link in bio.",
      "They told me to behave. I made a whole app instead. Come find out what I did. 👀",
      "There's a version of me that only exists on GLIMR. And she's... a lot. Come see.",
      "I made something for you. Well — for the version of you that's brave enough. Link in bio.",
      "The things I say on GLIMR would get me banned everywhere else. So I put them there. Come listen.",
    ],
  },
  {
    id: "promo",
    label: "Direct Promo",
    icon: Instagram,
    captions: [
      "Want my undivided attention? I'm live on GLIMR — face to face, just you and me. Tap the link in my bio to start. 💫",
      "I'm now live on GLIMR! Real conversations, real connection, real me. Come say hi — link in bio. 🫶",
      "Done with DMs that go nowhere. On GLIMR we actually talk — face to face. Link in bio to join me.",
      "Your turn. I'm waiting on GLIMR and I brought my A-game. Link in bio to start now. ✨",
      "Come spend time with me on GLIMR. It's the only place you can actually see me, hear me, and have me all to yourself. Link in bio.",
    ],
  },
  {
    id: "story",
    label: "Story-Driven",
    icon: Twitter,
    captions: [
      "Someone asked me what I'm like when no one's watching. So I built a place to show them. GLIMR. Link in bio.",
      "I used to wonder if people actually wanted real connection, or just the idea of it. Then I went live on GLIMR. Turns out — they want the real thing. Link in bio.",
      "Spent the whole night on GLIMR last night. Forgot I was talking to a screen. That's when I knew this was different. Link in bio if you want to see what I mean.",
      "A guy on GLIMR told me I changed his whole week. I didn't even do much — I just actually listened. That's all people want sometimes. Come find out for yourself.",
      "I wasn't sure about this at first. Then I had my first real conversation on GLIMR and I got it. This isn't content. It's connection. Link in bio.",
    ],
  },
  {
    id: "fomo",
    label: "FOMO",
    icon: Sparkles,
    captions: [
      "I'm only online for the next few hours. After that, you'll have to wait. Come find me on GLIMR — link in bio. ⏳",
      "Last night was... a lot. In the best way. If you weren't there, you missed it. Don't let it happen again. GLIMR — link in bio. 😏",
      "I'm taking fewer sessions this week. If you want my time, now's the moment. GLIMR — link in bio before slots fill.",
      "People keep asking when I'm going live next. The answer is: now. But not for long. GLIMR — link in bio. 🔥",
      "I'm only keeping GLIMR open to a small circle right now. If you're seeing this, you're in. For now. Link in bio.",
    ],
  },
];

export default function SocialCaptions({ referralLink }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const current = CATEGORIES.find((c) => c.id === activeCategory);

  const buildFullCaption = (caption) => {
    if (!referralLink) return caption;
    // Check if caption already has "link in bio" — if so, append the actual link too
    if (caption.toLowerCase().includes("link in bio")) {
      return `${caption}\n\n${referralLink}`;
    }
    return `${caption}\n\n${referralLink}`;
  };

  const handleCopy = async (caption, idx) => {
    const fullCaption = buildFullCaption(caption);
    try {
      await navigator.clipboard.writeText(fullCaption);
      setCopiedIndex(`${activeCategory}-${idx}`);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Social media captions</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Ready-to-post captions for sharing your GLIMR videos. Tap to copy — your
        referral link is included automatically.
      </p>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Captions list */}
      <div className="space-y-2.5">
        {current.captions.map((caption, idx) => {
          const copiedKey = `${activeCategory}-${idx}`;
          const isCopied = copiedIndex === copiedKey;
          return (
            <div
              key={idx}
              className="group rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors"
            >
              <p className="text-sm text-foreground leading-relaxed mb-2 pr-2">
                {caption}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {referralLink ? "Link included" : ""}
                </span>
                <button
                  onClick={() => handleCopy(caption, idx)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    isCopied
                      ? "text-green-500"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}