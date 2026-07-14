/**
 * GLIMR Credit System — single source of truth.
 *
 * Conversion: A$1 AUD = 0.20 credits (1 credit = A$5)
 *
 * Tiers grant a monthly credit allowance. Top-up packs add prepaid credits.
 * Credits are consumed per action: text messages, video minutes, voice replies.
 */

export const CREDITS_PER_DOLLAR = 0.20;

/** Convert USD to credits */
export function usdToCredits(usd) {
  return Math.round(usd * CREDITS_PER_DOLLAR * 100) / 100;
}

/** Convert credits to USD */
export function creditsToUsd(credits) {
  return Math.round((credits / CREDITS_PER_DOLLAR) * 100) / 100;
}

export const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    credits: 5,
    description: "Your companion, unlocked",
    ctaLabel: "Get Starter",
    features: [
      "Unlimited text chat",
      "5 credits / month",
      "Voice replies",
      "All companions unlocked",
      "Basic memory system",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 49,
    credits: 10,
    description: "Deeper connection, more time",
    ctaLabel: "Get Plus",
    features: [
      "Everything in Starter",
      "10 credits / month",
      "Enhanced emotional memory",
      "Fantasy outfits & uniforms",
      "Companion's Diary",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    credits: 20,
    description: "The full GLIMR experience",
    ctaLabel: "Get Pro",
    highlighted: true,
    badge: "popular",
    features: [
      "Everything in Plus",
      "20 credits / month",
      "Intimacy & Romance layer",
      "Face-to-face live video",
      "Custom live avatar",
      "Priority processing",
    ],
  },
  {
    id: "vip",
    name: "VIP Member",
    price: 199,
    credits: 50,
    description: "Exclusive access & maximum presence",
    ctaLabel: "Join VIP",
    badge: "vip",
    features: [
      "Everything in Pro",
      "50 credits / month",
      "Custom companion creation",
      "Early access to new companions",
      "VIP-only companions",
      "Dedicated concierge support",
      "Invitation-only events",
    ],
  },
];

export const TIER_CREDITS = {
  free: 0,
  starter: 5,
  plus: 10,
  pro: 20,
  vip: 50,
};

export const TIER_LABELS = {
  free: "Free",
  starter: "Starter",
  plus: "Plus",
  pro: "Pro",
  vip: "VIP Member",
};

/** Credit cost per action */
export const CREDIT_COSTS = {
  text_message: 0,
  video_minute: 0.75,  // A$3.75 per minute (0.75 credits × A$5) — cost A$2.50 + 50% margin
  voice_reply: 0.04,
};

export const CONSUMPTION_ITEMS = [
  {
    key: "text_message",
    label: "Text message",
    cost: CREDIT_COSTS.text_message,
    description: "Unlimited — no credit cost",
  },
  {
    key: "video_minute",
    label: "Video minute",
    cost: CREDIT_COSTS.video_minute,
    description: "Live face-to-face video (A$3.75 per minute — 0.75 credits per minute)",
  },
  {
    key: "voice_reply",
    label: "Voice reply",
    cost: CREDIT_COSTS.voice_reply,
    description: "AI-generated voice message from your companion (A$0.20 per reply)",
  },
];

/** Top-up credit packs — price in AUD, minimum A$20 */
export const TOPUP_PACKS = [
  { id: "pack_20",  price: 20,  credits: 4,  popular: false },
  { id: "pack_25",  price: 25,  credits: 5,  popular: false },
  { id: "pack_50",  price: 50,  credits: 10, popular: true  },
  { id: "pack_100", price: 100, credits: 20, popular: false },
];

/** Calculate how many of a given action a credit balance can cover */
export function creditsToActions(credits, costPerAction) {
  if (costPerAction <= 0) return Infinity;
  return Math.floor(credits / costPerAction);
}