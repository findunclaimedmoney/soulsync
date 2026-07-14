/**
 * Stores the companion the user clicked on so that:
 * 1. After auth, they're redirected to that companion's chat (not the default /chat/mia)
 * 2. The chat page grants them 10 free voice messages
 */
export function startCompanionChat(companionId) {
  sessionStorage.setItem("glimr_voice_grant", companionId);
  sessionStorage.setItem("glimr_redirect_after_auth", `/chat/${companionId}`);
}

/**
 * Returns the stored redirect URL (or "/" if none) and removes it from storage.
 */
export function consumeRedirectAfterAuth() {
  const url = sessionStorage.getItem("glimr_redirect_after_auth");
  if (url) {
    sessionStorage.removeItem("glimr_redirect_after_auth");
    return url;
  }
  return "/";
}