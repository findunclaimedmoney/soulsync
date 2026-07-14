---
name: Base44 migration pattern
description: How the GLIMR Base44 app was ported — compatibility shim, DB schema, and backend routes approach
---

The migration replaced the Base44 SDK with a thin compatibility shim so the 40+ existing pages needed no changes.

## Approach

- `artifacts/app/src/api/base44Client.js` — re-exported `base44` object with `entities` (Proxy), `auth`, `integrations.Core`, and `functions` that all call `/api/*` via fetch + credentials: include
- `lib/db/src/schema/entities.ts` — generic JSONB table: `(id, model, data jsonb, created_date, updated_date)`. No per-entity tables needed; filters use `data->>'field' = value` SQL expressions.
- `lib/db/src/schema/users.ts` — standard users table with bcrypt password_hash
- `lib/db/src/schema/otp_tokens.ts` — OTP codes for registration/password reset

## Backend routes
- `artifacts/api-server/src/routes/auth.ts` — session-based auth (express-session + SESSION_SECRET), bcryptjs
- `artifacts/api-server/src/routes/entities.ts` — generic CRUD for any model name
- `artifacts/api-server/src/routes/integrations.ts` — InvokeLLM/GenerateImage/GenerateSpeech/TranscribeAudio/UploadFile (OpenAI); UploadFile uses /tmp/uploads
- `artifacts/api-server/src/routes/functions.ts` — base44.functions.invoke stubs (getSubscription, manageBilling, deleteAccount)

**Why:** Rewriting all 40+ component files using base44.entities/auth/integrations would be slow and error-prone. The Proxy-based shim + compatible API interface preserves all component code intact.

## Tailwind v3 setup
App uses Tailwind v3 (not v4). The copy script removed @tailwindcss/vite and added postcss.config.js. vite.config.ts uses css.postcss.plugins instead of the tailwindcss() vite plugin.

## App details
- Slug: `app`, previewPath: `/`, title: "Companion App" (GLIMR)
- Uses react-router-dom (not wouter) — App.jsx uses BrowserRouter
- Original CSS: dark luxury palette (near-black bg, gold primary #C9A96E), Playfair Display font
