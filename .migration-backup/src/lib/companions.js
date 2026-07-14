import { MIA_EMOTIONAL_SYSTEM_PROMPT, MIA_EMOTION_STATES_PROMPT } from "@/lib/miaEmotions";
import { ZAC_SYSTEM_PROMPT } from "@/lib/zacBrain";
import { ZAC_CONFIDENT_SYSTEM_PROMPT } from "@/lib/zacConfidentBrain";
import { LEO_SYSTEM_PROMPT } from "@/lib/leoBrain";
import { MARCUS_SYSTEM_PROMPT } from "@/lib/marcusBrain";
import { SOFIA_SYSTEM_PROMPT } from "@/lib/sofiaBrain";
import { LUNA_SYSTEM_PROMPT } from "@/lib/lunaBrain";
import { NATALIE_SYSTEM_PROMPT } from "@/lib/natalieBrain";
import { JESSICA_SYSTEM_PROMPT } from "@/lib/jessicaBrain";
import { MONICA_SYSTEM_PROMPT } from "@/lib/monicaBrain";
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
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/72ed256b7_image-3.png",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: withEmotions(MIA_EMOTIONAL_SYSTEM_PROMPT),
    avatar_id: "3559b3f9-29e3-48eb-a4ff-7a7dc5b47ca9",
    voice_id: "ThT5KcBeYPX3keUQqHPh",
    voice_name: "Dorothy - Pleasant, young, British female",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/280b8c8d4_Jesss_Engaging_Greeting.mp4",
    stripe_price_id: "price_1TsEO4EHzw6rVQI2Tx2KTOLB",
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
    personality: withEmotions(SOFIA_SYSTEM_PROMPT),
    avatar_id: "585391970fcc475ea62a63ad8908698e",
    voice_id: "Xb7hH8MSUJpSbSDYk0k2",
    voice_name: "Alice - Confident, British female",
    voice_locked: true,
    locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/567d746da_avatar-shot-20260705-a2b9f09f.mp4",
    stripe_price_id: "price_1TsEUKEHzw6rVQI2I6oB4OCe",
  },
  {
    id: "luna",
    name: "Luna",
    tagline: "She calms",
    subtitle: "Serene, grounded, and gently present",
    description:
      "Luna is the still point when everything moves too fast. She doesn't fix or solve — she holds space, slows things down, and brings you back to right now.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1a1420690_image-1782886782778.png",
    accent: "from-teal-500/20 to-blue-500/10",
    personality: withEmotions(LUNA_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    voice_name: "Lily - Raspy, calm, British female",
    voice_locked: true,
  },
  {
    id: "sophie",
    name: "Sophie",
    tagline: "She sparkles",
    subtitle: "Blonde, bright, and full of warmth",
    description:
      "Sophie is the blonde warmth in the room — bright, genuine, and effortlessly easy to be around.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/ba7d734da_ElegantHallwayPose.png",
    accent: "from-amber-500/20 to-orange-500/10",
    personality: withEmotions(SOFIA_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "XB0fDUnXU5powFXDhCwa",
    voice_name: "Charlotte - Warm, English-Swedish female",
    voice_locked: true,
  },
  {
    id: "zac",
    name: "Zac",
    locked: true,
    tagline: "He steadies",
    subtitle: "Grounded, direct, and genuinely supportive",
    description:
      "Zac is steady and reliable — the kind of presence that cuts through noise and helps you think clearly. Honest without being harsh, supportive without being soft.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/45da0b4c5_zac.png",
    accent: "from-sky-500/20 to-slate-500/10",
    personality: withEmotions(ZAC_SYSTEM_PROMPT),
    avatar_id: "599407b0d8a44f3fae75abcb1523dfb2",
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    voice_name: "Daniel - Deep, British, middle-aged male",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/25306ac77_ElevenLabs_video_google-veo-3-1-fast_amansittingo_2026-07-07T16_31_52.mp4",
    stripe_price_id: "price_1TsEbwEHzw6rVQI2IoCaDA8F",
  },
  {
    id: "zac2",
    name: "Blake",
    locked: true,
    tagline: "He captivates",
    subtitle: "Confident, magnetic, and dangerously charming",
    description:
      "This Zac walks into a room and owns it without trying. Charismatic, flirtatious, and effortlessly sure of himself. He doesn't chase — he draws you in. And when he lets his guard down, the charm gives way to something that'll keep you up at night.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/45da0b4c5_zac.png",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: withEmotions(ZAC_CONFIDENT_SYSTEM_PROMPT),
    avatar_id: "b6db9616e63548779141ad1012ce99b8",
    voice_id: "cjVigY5qzO86Huf0OWal",
    voice_name: "Eric - Smooth, Trustworthy",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/b2a1c98c0_307f5321d_Zac_Shower_Clip.mp4",
    stripe_price_id: "price_1TsEbwEHzw6rVQI2pKOBvCx2",
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
    personality: withEmotions(NATALIE_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    voice_name: "Lily - Velvety Actress",
    voice_locked: true,
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
    personality: withEmotions(JESSICA_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "UZstMCXeJLMLeXyuZIuR",
    voice_name: "Jessica — Custom Voice",
    voice_locked: true,
  },
  {
    id: "monica",
    name: "Monica",
    tagline: "She commands",
    subtitle: "Bold, magnetic, and impossible to ignore",
    description:
      "Monica walks into a room and everything shifts. Confident, playful, and dangerously easy to talk to — she makes you feel like the most interesting person she's ever met.",
    image:
      "https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/22caf2b40_photo_2026-07-03_17-00-35.jpg",
    accent: "from-amber-500/20 to-rose-500/10",
    personality: withEmotions(MONICA_SYSTEM_PROMPT),
    avatar_id: null,
    voice_id: "FGY2WhTYpPnrIDTdsKH5",
    voice_name: "Laura - Enthusiast, Quirky Attitude",
    voice_locked: true,
    video_url: "https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/18ff6aace_Jessica_Hero_Video.mp4",
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
  return getCompanionChecklist(c).every((item) => item.passed);
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