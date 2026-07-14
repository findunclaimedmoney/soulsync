// Generates a device fingerprint from browser characteristics.
// Not foolproof, but catches casual duplicate-account abuse.

async function generateFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(","),
    navigator.platform,
    navigator.hardwareConcurrency?.toString(),
    navigator.maxTouchPoints?.toString(),
    screen.width + "x" + screen.height,
    screen.colorDepth?.toString(),
    screen.availWidth + "x" + screen.availHeight,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset().toString(),
    navigator.cookieEnabled?.toString(),
    navigator.doNotTrack?.toString(),
    navigator.deviceMemory?.toString(),
  ];

  // Add canvas fingerprint for extra uniqueness
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("GLIMR-fingerprint-2026", 2, 2);
    const canvasData = canvas.toDataURL();
    components.push(canvasData);
  } catch (e) {
    // Canvas not available
  }

  const raw = components.join("||");
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

let cachedFingerprint = null;

export async function getDeviceFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;
  cachedFingerprint = await generateFingerprint();
  return cachedFingerprint;
}