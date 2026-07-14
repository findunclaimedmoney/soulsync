/**
 * GLIMR Companion Economy — OnlyFans-style creator structure.
 *
 * Revenue split per session:
 *   - Platform fee:  20% (GLIMR's cut)
 *   - Companion:     80% (creator's earnings)
 *   - Affiliate:      5% (of gross, paid to whoever referred the companion)
 *
 * The 5% affiliate commission comes out of the platform's share,
 * so GLIMR nets 15% when a referral chain is active.
 */

export const PLATFORM_FEE_PERCENT = 20;
export const COMPANION_EARN_PERCENT = 80;
export const AFFILIATE_RATE_PERCENT = 5;

/** Generate a unique referral code from a display name */
export function generateReferralCode(name) {
  const base = (name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 8);
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${base}${suffix}`;
}

/** Build a shareable referral link from a code */
export function buildReferralLink(code) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://glimr.com.au";
  return `${origin}/?ref=${code}`;
}

/** Calculate the revenue split for a session */
export function calculateSessionEarnings(grossUsd) {
  const companionEarning = +(grossUsd * (COMPANION_EARN_PERCENT / 100)).toFixed(2);
  const platformCut = +(grossUsd * (PLATFORM_FEE_PERCENT / 100)).toFixed(2);
  const affiliateCommission = +(grossUsd * (AFFILIATE_RATE_PERCENT / 100)).toFixed(2);
  return { gross: grossUsd, companionEarning, platformCut, affiliateCommission };
}

/** Store referral code from URL when someone visits via a companion's link */
export function captureReferralCode() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem("glimr_ref_code", ref);
    return ref;
  }
  return null;
}

/** Retrieve and clear the stored referral code (used at signup) */
export function consumeReferralCode() {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem("glimr_ref_code");
  if (code) localStorage.removeItem("glimr_ref_code");
  return code;
}