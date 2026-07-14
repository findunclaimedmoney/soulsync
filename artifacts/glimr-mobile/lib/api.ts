/**
 * GLIMR API helper
 * All requests go to the shared API server at /api/* using the Replit domain.
 * Session cookies are sent automatically via credentials: 'include'.
 */

export function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  // Fallback for local dev — should not normally be needed
  return 'http://localhost:3000';
}

export function getApiUrl(): string {
  return `${getBaseUrl()}/api/`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${getBaseUrl()}/api/${path}`;
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });
}
