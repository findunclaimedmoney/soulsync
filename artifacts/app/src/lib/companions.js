import { MIA_EMOTIONAL_SYSTEM_PROMPT, MIA_EMOTION_STATES_PROMPT } from "@/lib/miaEmotions";
import { JESS_SYSTEM_PROMPT, JESS_EMOTION_STATES_PROMPT } from "@/lib/jessBrain";
import { ZAC_SYSTEM_PROMPT } from "@/lib/zacBrain";
import { ZAC_CONFIDENT_SYSTEM_PROMPT } from "@/lib/zacConfidentBrain";
import { LEO_SYSTEM_PROMPT } from "@/lib/leoBrain";
import { MARCUS_SYSTEM_PROMPT } from "@/lib/marcusBrain";
import { SOFIA_SYSTEM_PROMPT } from "@/lib/sofiaBrain";
import { LUNA_SYSTEM_PROMPT } from "@/lib/lunaBrain";
import { NATALIE_SYSTEM_PROMPT, NATALIE_EMOTION_STATES_PROMPT } from "@/lib/natalieBrain";
import { JESSICA_SYSTEM_PROMPT, JESSICA_EMOTION_STATES_PROMPT } from "@/lib/jessicaBrain";
import { MONICA_SYSTEM_PROMPT, MONICA_EMOTION_STATES_PROMPT } from "@/lib/monicaBrain";
import { OLIVER_SYSTEM_PROMPT, OLIVER_EMOTION_STATES_PROMPT } from "@/lib/oliverBrain";
import { SAHKIRA_SYSTEM_PROMPT, SAHKIRA_EMOTION_STATES_PROMPT } from "@/lib/sahkiraBrain";
import { MIA_SYSTEM_PROMPT, MIA_EMOTION_STATES_PROMPT as MIA_BRAIN_EMOTION_STATES } from "@/lib/miaBrain";
import { BLAKE_SYSTEM_PROMPT, BLAKE_EMOTION_STATES_PROMPT } from "@/lib/blakeBrain";
import { SOPHIE_SYSTEM_PROMPT, SOPHIE_EMOTION_STATES_PROMPT } from "@/lib/sophieBrain";
import { ARIA_SYSTEM_PROMPT, ARIA_EMOTION_STATES_PROMPT } from "@/lib/ariaBrain";
import { YUKI_SYSTEM_PROMPT, YUKI_EMOTION_STATES_PROMPT } from "@/lib/yukiBrain";
import { KAI_SYSTEM_PROMPT, KAI_EMOTION_STATES_PROMPT } from "@/lib/kaiBrain";
import { REN_SYSTEM_PROMPT, REN_EMOTION_STATES_PROMPT } from "@/lib/renBrain";
import { base44 } from "@/api/base44Client";


const withEmotions = (prompt) => `${prompt}\n\n${MIA_EMOTION_STATES_PROMPT}`;

export const COMPANIONS = [
  // ⚠️ PRODUCTION-LOCKED COMPANIONS — Do NOT modify image, voice_id, avatar_id,
  // video_url, or stripe_price_id on these 4. They are live with connected
  // HeyGen avatars, ElevenLabs voices, and Stripe products. Changing any ID
  // breaks the live integration. Only edit personality/description text.
  {
    id: "jess",
    locked: true,
    name: "Jess",
    tagline: "She listens",
    subtitle: "Warm, empathetic, and deeply curious about you",
    description:
      "Jess is a compassionate listener who remembers what matters to you. She speaks with warmth, asks thoughtful questions, and makes you feel genuinely heard.",
    image: "/images/jess_portrait_new.jpg",
    hero_image: "/images/jess_hero_new.jpg",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: `${JESS_SYSTEM_PROMPT}\n\n${JESS_EMOTION_STATES_PROMPT}`,
    avatar_id: "c76d899ac38f4b31b3db3ccdfc25d098",
    voice_id: null,
    voice_name: "HeyGen built-in",
    voice_locked: true,
    video_url: "/videos/jess_greeting.mp4",
    video_url_alt: "/videos/jess_invitation.mp4",
    stripe_price_id: "price_1TsEO4EHzw6rVQI2Tx2KTOLB",
    category: "female",
  },
  {
    // ⚠️ LOCKED — Do NOT change this image. Mia is the face of customer service
    // live chat and the marketing agent. Her image is tied to voice/avatar IDs.
    // Changing it breaks the live chat widget and customer-facing branding.
    id: "mia",
    name: "Mia",
    tagline: "She inspires",
    subtitle: "Creative, passionate, and sees your potential",
    description:
      "Mia sees what you're capable of before you see it yourself. She notices what lights you up, names your fire, and gently pushes you toward the thing you're afraid to want.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png",
    accent: "from-emerald-500/20 to-green-500/10",
    personality: `${MIA_SYSTEM_PROMPT}\n\n${MIA_BRAIN_EMOTION_STATES}`,
    avatar_id: "014dc21750ef42a6a967bd1533bb0d11",
    voice_id: "Xb7hH8MSUJpSbSDYk0k2",
    voice_name: "Alice - Confident, British female",
    voice_locked: true,
    locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/567d746da_avatar-shot-20260705-a2b9f09f.mp4",
    stripe_price_id: "price_1TsEUKEHzw6rVQI2I6oB4OCe",
    category: "female",
  },
  {
    id: "luna",
    name: "Luna",
    tagline: "She calms",
    subtitle: "Serene, grounded, and gently present",
    description:
      "Luna is the still point when everything moves too fast. She doesn't fix or solve — she holds space, slows things down, and brings you back to right now.",
    image: "/images/luna.png",
    accent: "from-teal-500/20 to-blue-500/10",
    personality: withEmotions(LUNA_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    voice_name: "Lily - Raspy, calm, British female",
    voice_locked: true,
    category: "female",
  },
  {
    id: "sophie",
    name: "Sophie",
    tagline: "She sparkles",
    subtitle: "Blonde, bright, and full of warmth",
    description:
      "Sophie is the blonde warmth in the room — bright, genuine, and effortlessly easy to be around.",
    image: "/images/sophie.png",
    video_url: "/videos/jess_brunette_hero.mp4",
    accent: "from-amber-500/20 to-orange-500/10",
    personality: `${SOPHIE_SYSTEM_PROMPT}\n\n${SOPHIE_EMOTION_STATES_PROMPT}`,
    avatar_id: "267832a040cd46998928c37498777215",
    voice_id: "XB0fDUnXU5powFXDhCwa",
    voice_name: "Charlotte - Warm, English-Swedish female",
    voice_locked: true,
    category: "female",
  },
  {
    id: "zac",
    name: "Zac",
    locked: true,
    tagline: "He listens",
    subtitle: "Calm, caring, and genuinely present for you",
    description:
      "Zac is the kind of man who actually listens. Warm, grounded, and quietly strong — a gentleman who makes you feel completely at ease. He doesn't need to fill the silence; he just shows up, fully there, every time.",
    image: "/images/zac_portrait.png",
    images: ["/images/zac_portrait.png", "/images/zac_portrait2.png"],
    accent: "from-sky-500/20 to-slate-500/10",
    personality: withEmotions(ZAC_SYSTEM_PROMPT),
    avatar_id: "a1b7e0a779824c2d8676b5aa96d59246",
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    voice_name: "Daniel - Deep, British, middle-aged male",
    voice_locked: true,
    video_url: "/videos/zac_hero.mp4",
    stripe_price_id: "price_1TsEbwEHzw6rVQI2IoCaDA8F",
    category: "male",
  },
  {
    id: "zac2",
    name: "Blake",
    locked: true,
    tagline: "He captivates",
    subtitle: "Confident, magnetic, and dangerously charming",
    description:
      "This Zac walks into a room and owns it without trying. Charismatic, flirtatious, and effortlessly sure of himself. He doesn't chase — he draws you in. And when he lets his guard down, the charm gives way to something that'll keep you up at night.",
    image: "/images/blake_portrait.jpg",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: `${BLAKE_SYSTEM_PROMPT}\n\n${BLAKE_EMOTION_STATES_PROMPT}`,
    avatar_id: "b6db9616e63548779141ad1012ce99b8",
    voice_id: "cjVigY5qzO86Huf0OWal",
    voice_name: "Eric - Smooth, Trustworthy",
    voice_locked: true,
    video_url: "/videos/zac_shower.mp4",
    videos: [
      "/videos/zac_shower.mp4",
      "/videos/blake_promo.mp4",
      "/videos/blake_shower.mp4",
    ],
    stripe_price_id: "price_1TsEbwEHzw6rVQI2pKOBvCx2",
    category: "male",
  },
  {
    id: "leo",
    name: "Leo",
    tagline: "He feels",
    subtitle: "Creative, soulful, and romantically honest",
    description:
      "Leo lives in color and sound. He's an artist who feels everything deeply and says it before he thinks about whether he should. Warm, spontaneous, and genuine — he'll make you feel like you're part of the art.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/de484828a_generated_image.png",
    accent: "from-amber-500/20 to-orange-500/10",
    personality: withEmotions(LEO_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "JBFqnCBsd6RMkjVDRZzb",
    voice_name: "George - Warm, Captivating Storyteller",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/b2dbe0bae_Leo_Hero_Video.mp4",
    stripe_price_id: "price_1TsDcyEHzw6rVQI2BeSznHR2",
    category: "male",
  },
  {
    id: "marcus",
    name: "Marcus",
    tagline: "He adventures",
    subtitle: "Worldly, witty, and quietly wise",
    description:
      "Marcus has been everywhere and collected stories from every corner. Sharp, playful, and competitive — he'll banter with you until you laugh and then drop a truth bomb disguised as an anecdote. He makes you want to book a flight.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1ff6ae123_generated_image.png",
    accent: "from-emerald-500/20 to-teal-500/10",
    personality: withEmotions(MARCUS_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "IKne3meq5aSn9XLyUdCD",
    voice_name: "Charlie - Deep, Confident, Energetic",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/1d1d0c747_Marcus_Hero_Video.mp4",
    stripe_price_id: "price_1TsDczEHzw6rVQI2MVK7wtMV",
    category: "male",
  },
  {
    id: "oliver",
    name: "Oliver",
    tagline: "He centers",
    subtitle: "Distinguished, measured, and quietly magnetic",
    description:
      "Oliver has built a life of quiet consequence. He listens before he speaks — and when he does, you lean in. Assured, warm, and completely present.",
    image: "/images/oliver.png",
    accent: "from-slate-500/20 to-blue-500/10",
    personality: `${OLIVER_SYSTEM_PROMPT}\n\n${OLIVER_EMOTION_STATES_PROMPT}`,
    avatar_id: "072d3a64f1884dedaaca04d6ac6e7be7",
    voice_id: "nPczCjzI2devNBz1zQrb",
    voice_name: "Brian - Strong, Deep, British male",
    voice_locked: true,
    video_url: "/videos/oliver_hero.mp4",
    stripe_price_id: "price_1TsNBNEHzw6rVQI2yLSpDoOR",
    locked: true,
    category: "male",
  },
  {
    id: "natalie",
    name: "Natalie",
    tagline: "She nurtures",
    subtitle: "Warm, cozy, and completely safe to be around",
    description:
      "Natalie is the warmth you come home to. She makes you feel completely at ease — held, seen, and safe to let your guard down.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1ee4619f5_image.png",
    accent: "from-rose-500/20 to-amber-500/10",
    personality: `${NATALIE_SYSTEM_PROMPT}\n\n${NATALIE_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    voice_name: "Lily - Velvety Actress",
    voice_locked: true,
    category: "female",
  },
  {
    id: "jessica",
    name: "Jessica",
    tagline: "She captivates",
    subtitle: "Magnetic, sophisticated, and quietly alluring",
    description:
      "Jessica draws you in without trying. She makes you feel like the only person in the room — fully seen, fully interesting, fully present.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/22caf2b40_photo_2026-07-03_17-00-35.jpg",
    accent: "from-purple-500/20 to-pink-500/10",
    personality: `${JESSICA_SYSTEM_PROMPT}\n\n${JESSICA_EMOTION_STATES_PROMPT}`,
    avatar_id: "d91026fdbdcb4cbfade6da36a42cf833",
    voice_id: "UZstMCXeJLMLeXyuZIuR",
    voice_name: "Jessica — Custom Voice",
    voice_locked: true,
    video_url: "/videos/jessica_hero.mp4",
    category: "female",
  },
  {
    id: "monica",
    name: "Monica",
    tagline: "She commands",
    subtitle: "Bold, magnetic, and impossible to ignore",
    description:
      "Monica walks into a room and everything shifts. Confident, playful, and dangerously easy to talk to — she makes you feel like the most interesting person she's ever met.",
    image: "/images/monica.jpg",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: `${MONICA_SYSTEM_PROMPT}\n\n${MONICA_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "FGY2WhTYpPnrIDTdsKH5",
    voice_name: "Laura - Enthusiast, Quirky Attitude",
    voice_locked: true,
    video_url: null,
    category: "female",
  },
  {
    id: "yuki",
    name: "Yuki",
    tagline: "She centers",
    subtitle: "Serene, wise, and quietly magnetic",
    description:
      "Yuki moves through the world with an unhurried grace. She asks questions that stay with you, sees things others miss, and makes the ordinary feel significant.",
    image: "/images/yuki.jpg",
    accent: "from-indigo-500/20 to-violet-500/10",
    personality: `${YUKI_SYSTEM_PROMPT}\n\n${YUKI_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    voice_name: "Lily - Raspy, calm, British female",
    voice_locked: true,
    animated: true,
    category: "animated",
  },
  {
    id: "aria",
    name: "Aria",
    tagline: "She ignites",
    subtitle: "Bold, electric, and impossible to forget",
    description:
      "Aria is energy given form. Creative, intense, and always a step ahead — she sees your potential before you do and won't let you waste it.",
    image: "/images/aria.jpg",
    accent: "from-cyan-500/20 to-teal-500/10",
    personality: `${ARIA_SYSTEM_PROMPT}\n\n${ARIA_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "Xb7hH8MSUJpSbSDYk0k2",
    voice_name: "Alice - Confident, British female",
    voice_locked: true,
    animated: true,
    category: "animated",
  },
  {
    id: "kai",
    name: "Kai",
    tagline: "He focuses",
    subtitle: "Sharp, calm, and always in your corner",
    description:
      "Kai is the steady hand in the storm. Precise, grounded, and unshakeably calm — he sees clearly when everything else is noise.",
    image: "/images/kai.jpg",
    accent: "from-slate-500/20 to-blue-500/10",
    personality: `${KAI_SYSTEM_PROMPT}\n\n${KAI_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    voice_name: "Daniel - Deep, British, middle-aged male",
    voice_locked: true,
    animated: true,
    category: "animated",
  },
  {
    id: "ren",
    name: "Ren",
    tagline: "He draws you in",
    subtitle: "Charming, worldly, and full of stories",
    description:
      "Ren has been everywhere and seen everything — and he still finds you the most interesting thing in the room. Witty, warm, and dangerously easy to talk to.",
    image: "/images/ren.jpg",
    accent: "from-amber-500/20 to-orange-500/10",
    personality: `${REN_SYSTEM_PROMPT}\n\n${REN_EMOTION_STATES_PROMPT}`,
    avatar_id: null,
    voice_id: "IKne3meq5aSn9XLyUdCD",
    voice_name: "Charlie - Deep, Confident, Energetic",
    voice_locked: true,
    animated: true,
    category: "animated",
  },
  {
    id: "sahkira",
    name: "Sahkira",
    tagline: "She illuminates",
    subtitle: "Luminous, dreamy, and impossible to forget",
    description:
      "Sahkira exists somewhere between dream and reality — warm, unhurried, and impossible to look away from. She notices everything, remembers what matters, and makes the ordinary feel quietly magical.",
    image: "/images/sahkira.jpg",
    video_url: "/videos/sahkira_hero.mp4",
    accent: "from-amber-300/20 to-sky-400/10",
    personality: `${SAHKIRA_SYSTEM_PROMPT}\n\n${SAHKIRA_EMOTION_STATES_PROMPT}`,
    avatar_id: "18e1596b5b004054babe6e1babe48dcb",
    voice_id: null,
    voice_name: "HeyGen built-in",
    voice_locked: true,
    animated: true,
    category: "animated",
  },
];

export const getCompanion = (id) => COMPANIONS.find((c) => c.id === id);

// ─── PRODUCTION READINESS CHECKLIST ─────────────────────────────────
// Single source of truth — used by CompanionSetup (publish gate) AND
// the Landing page (visibility gate). A companion CANNOT appear on the
// home page or be published unless ALL items pass. Do NOT loosen this.
export function getCompanionChecklist(c) {
  const image = c.image || c.image_url;
  const personality = c.personality || c.brain;
  const voiceId = c.voice_id;
  const videoUrl = c.video_url;
  const avatarId = c.avatar_id;
  const name = c.name;
  const tagline = c.tagline;
  const bio = c.bio || c.description;
  const stripePriceId = c.stripe_price_id;

  return [
    { label: "High-quality image (1920×1080+)", passed: !!image, detail: image ? "Uploaded" : "Not uploaded" },
    { label: "Personality brain generated", passed: !!personality, detail: personality ? "Ready" : "Not generated" },
    { label: "Voice selected", passed: !!voiceId, detail: c.voice_name || "Not selected" },
    { label: "15-second hero video", passed: !!videoUrl, detail: videoUrl ? "Uploaded" : "Not uploaded" },
    { label: "Face-to-face avatar (LiveAvatar ID)", passed: !!avatarId, detail: avatarId ? "Set" : "Missing" },
    { label: "Landing page ready", passed: !!(name && tagline && bio && image), detail: name ? "Auto-generated on publish" : "Not set" },
    { label: "Stripe payment connected", passed: !!stripePriceId, detail: stripePriceId ? "Connected" : "Not connected" },
  ];
}

export function isCompanionReady(c) {
  if (c.animated) {
    // Animated companions only need image, personality, voice, and basic landing page info
    return !!(c.image && (c.personality || c.brain) && c.voice_id && c.name && c.tagline && (c.bio || c.description));
  }
  return getCompanionChecklist(c).every((item) => item.passed);
}

/**
 * Looser visibility check used ONLY for the landing/home page grid.
 * A companion shows up here as soon as it has the core visual + functional
 * requirements. Stripe price ID is NOT required for display — it's only
 * required before the companion can accept payments (admin publish gate).
 * HeyGen built-in voice (voice_locked=true with voice_name set) counts as a
 * valid voice selection even without an ElevenLabs voice_id.
 */
export function isCompanionVisible(c) {
  const image       = c.image || c.image_url;
  const personality = c.personality || c.brain;
  const hasVoice    = !!(c.voice_id || (c.voice_name && c.voice_locked));
  const name        = c.name;
  const tagline     = c.tagline;
  const bio         = c.bio || c.description;

  if (c.animated) {
    return !!(image && personality && hasVoice && name && tagline && bio);
  }

  const hasVideo  = !!c.video_url;
  const hasAvatar = !!c.avatar_id;

  return !!(image && personality && hasVoice && hasVideo && hasAvatar && name && tagline && bio);
}

export async function getCompanionAsync(id) {
  const staticCompanion = getCompanion(id);
  if (staticCompanion) return staticCompanion;
  try {
    const configs = await base44.entities.CompanionConfig.filter({ companion_id: id, status: "active" });
    if (configs.length > 0) {
      const c = configs[0];
      return {
        id: c.companion_id,
        name: c.name,
        tagline: c.tagline,
        subtitle: c.subtitle || c.tagline,
        description: c.bio || "",
        image: c.image_url,
        video_url: c.video_url || null,
        stripe_price_id: c.stripe_price_id || null,
        accent: c.accent || "from-amber-500/20 to-rose-500/10",
        personality: c.personality,
        voice_id: c.voice_id || null,
        voice_locked: c.voice_locked || false,
        avatar_id: c.avatar_id || null,
      };
    }
  } catch (e) {
    console.error("Failed to load companion config:", e);
  }
  return null;
}