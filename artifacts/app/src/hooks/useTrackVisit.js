import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Tracks a landing page visit by calling the trackVisit backend function.
 * Stores the visit ID in localStorage so the signup flow can mark it as converted.
 * Fires once per page load — safe to call on every landing page.
 */
export function useTrackVisit(companionId) {
  useEffect(() => {
    if (!companionId) return;

    const params = new URLSearchParams(window.location.search);
    const ref_code = params.get("ref");
    const utm_campaign = params.get("utm_campaign") || params.get("ucampaign");
    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");

    // Determine source from UTM or referrer
    let source = "direct";
    if (utm_source) {
      source = utm_source;
    } else if (ref_code) {
      source = "referral";
    } else if (document.referrer) {
      if (document.referrer.includes("facebook")) source = "facebook";
      else if (document.referrer.includes("instagram")) source = "instagram";
      else if (document.referrer.includes("google")) source = "google";
      else if (document.referrer.includes("t.co")) source = "twitter";
      else source = "referral";
    }

    // Anonymous visitor key for deduplication
    let visitor_key = localStorage.getItem("glimr_visitor_key");
    if (!visitor_key) {
      visitor_key = "vk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("glimr_visitor_key", visitor_key);
    }

    // Remember which companion brought this visitor — used to personalise the post-payment email
    localStorage.setItem("glimr_last_companion", companionId);

    base44.functions
      .invoke("trackVisit", {
        companion_id: companionId,
        ref_code,
        utm_campaign,
        source,
        visitor_key,
      })
      .then((res) => {
        if (res.data?.visit_id) {
          localStorage.setItem("glimr_visit_id", res.data.visit_id);
        }
      })
      .catch(() => {});
  }, [companionId]);
}