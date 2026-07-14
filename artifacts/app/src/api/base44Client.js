/**
 * base44 compatibility shim — replaces the Base44 SDK with calls to our own backend.
 * The interface is intentionally identical so existing component code requires no changes.
 */

const API = '/api';

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
    body: opts.body !== undefined ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.error || j.message || msg; } catch {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

function createEntityClient(model) {
  return {
    async list(sortBy, limit) {
      const params = new URLSearchParams();
      if (sortBy) params.set('sort', sortBy);
      if (limit) params.set('limit', String(limit));
      return apiFetch(`/entities/${model}?${params}`);
    },
    async filter(filters = {}, sortBy, limit) {
      const params = new URLSearchParams();
      if (sortBy) params.set('sort', sortBy);
      if (limit) params.set('limit', String(limit));
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== null) params.set(`filter_${k}`, String(v)); });
      return apiFetch(`/entities/${model}?${params}`);
    },
    async get(id) {
      return apiFetch(`/entities/${model}/${id}`);
    },
    async create(data) {
      return apiFetch(`/entities/${model}`, { method: 'POST', body: data });
    },
    async update(id, data) {
      return apiFetch(`/entities/${model}/${id}`, { method: 'PUT', body: data });
    },
    async delete(id) {
      return apiFetch(`/entities/${model}/${id}`, { method: 'DELETE' });
    },
    async deleteMany(filters = {}) {
      return apiFetch(`/entities/${model}/delete-many`, { method: 'POST', body: { filters } });
    },
  };
}

const entityCache = {};
const entitiesProxy = new Proxy(entityCache, {
  get(target, model) {
    if (!target[model]) target[model] = createEntityClient(model);
    return target[model];
  },
});

const auth = {
  async me() {
    return apiFetch('/auth/me');
  },
  async isAuthenticated() {
    try {
      await apiFetch('/auth/me');
      return true;
    } catch {
      return false;
    }
  },
  async loginViaEmailPassword(email, password) {
    return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  },
  async register(data) {
    return apiFetch('/auth/register', { method: 'POST', body: data });
  },
  async verifyOtp({ email, otpCode } = {}) {
    return apiFetch('/auth/verify-otp', { method: 'POST', body: { email, otpCode } });
  },
  async resendOtp(email) {
    return apiFetch('/auth/resend-otp', { method: 'POST', body: { email } });
  },
  async logout(redirectUrl) {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = redirectUrl || '/login';
  },
  loginWithProvider(provider, redirectUrl) {
    // Google OAuth not configured — redirect to login with a message
    const returnTo = encodeURIComponent(redirectUrl || '/');
    window.location.href = `/login?social_unavailable=1&return_to=${returnTo}`;
  },
  setToken(token) {
    // No-op — we use session cookies, not tokens
  },
  async updateMe(data) {
    return apiFetch('/auth/me', { method: 'PATCH', body: data });
  },
  async resetPasswordRequest(email) {
    return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
  },
  // Called as resetPassword({ resetToken, newPassword }) from ResetPassword.jsx
  async resetPassword({ resetToken, newPassword, token, password } = {}) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: { token: resetToken || token, newPassword: newPassword || password },
    });
  },
};

const Core = {
  async InvokeLLM({ prompt, response_json_schema } = {}) {
    return apiFetch('/integrations/llm', { method: 'POST', body: { prompt, response_json_schema } });
  },
  async GenerateImage({ prompt, aspect_ratio } = {}) {
    return apiFetch('/integrations/image', { method: 'POST', body: { prompt, aspect_ratio } });
  },
  async GenerateSpeech({ text, voice } = {}) {
    return apiFetch('/integrations/speech', { method: 'POST', body: { text, voice } });
  },
  async TranscribeAudio({ file } = {}) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/integrations/transcribe`, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || res.statusText); }
    return res.json();
  },
  async UploadFile({ file } = {}) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/integrations/upload`, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || res.statusText); }
    return res.json();
  },
  async SendEmail({ to, subject, body, html } = {}) {
    return apiFetch('/integrations/email', { method: 'POST', body: { to, subject, body, html } });
  },
};

const functions = {
  async invoke(name, params = {}) {
    return apiFetch(`/functions/${name}`, { method: 'POST', body: params });
  },
};

export const base44 = {
  entities: entitiesProxy,
  auth,
  integrations: { Core },
  functions,
};

export default base44;
