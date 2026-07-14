# GLIMR — Agent Handover File

> **READ THIS FILE FIRST before responding to any user inquiry.**
> This document captures the full project state as of the last session.
> Updated: 2026-07-10

---

## 1. Project Overview

**GLIMR** is an AI companion platform built on Base44. Users sign up, choose a companion (or create a custom one from a photo), and interact via text chat, voice replies, live face-to-face video (Anam API), selfie photos, games, and an intimacy/romantic layer.

- **App name:** GLIMR
- **Platform:** Base44 (React + Tailwind + Vite + shadcn/ui)
- **Custom domain:** glimr.com.au
- **Support email:** admin@glimr.com.au
- **App ID:** 6a4ad4122d2c58f83324b2ce
- **User timezone:** Australia/Perth (UTC+8)

### Key external integrations (secrets already set)
- **Anam API** — face-to-face video streaming for companions (`ANAM_API_KEY`)
- **ElevenLabs** — custom TTS voices (`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`)
- **HeyGen** — avatar generation (`HEYGEN_API_KEY`, `HEYGEN_AVATAR_MIA`)
- **LiveAvatar** — by-image avatar pipeline (`LIVEAVATAR_API_KEY`, `LIVE_AVATAR_SANDBOX`)
- **Stripe** — card payments & subscriptions (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`)
- **MoonPay** — crypto on-ramp (`MOONPAY_SECRET_KEY`, `MOONPAY_PUBLIC_KEY`, `MOONPAY_WEBHOOK_SECRET`)
- **Kraken** — crypto deposit addresses for direct crypto payments (`KRAKEN_API_KEY`, `KRAKEN_PRIVATE_KEY`)
- **Resend** — transactional email (`RESEND_API_KEY`)
- **OpenAI** — LLM calls (`OPENAI_API_KEY`)

### OAuth connectors (already authorized)
- **Google Sheets** — logging crypto payments to a spreadsheet
- **Google Calendar** — (available, for scheduling)
- **Instagram Business** — content publishing, comment management
- **Facebook Pages** — auto-reply to Messenger, page management
- **Meta Ads** — ad management
- **Gmail** — sending emails
- **HubSpot CRM** — workspace-registered connector (id: `6a158d724efc9633889457e2`, mode: all)

---

## 2. Companion System

### Built-in companions (`src/lib/companions.js`)
Each companion has a personality system prompt (from brain files in `src/lib/`), an image, tagline, and is wrapped with emotional state tracking via `MIA_EMOTION_STATES_PROMPT`.

| ID | Name | Tagline | Brain File | Voice |
|---|---|---|---|---|
| `jess` | Jess | She listens | `miaEmotions.js` (MIA_EMOTIONAL) | honey (GenerateSpeech) |
| `mia` | Mia | She inspires | `sofiaBrain.js` (SOFIA) | sunny (GenerateSpeech) |
| `luna` | Luna | She calms | `lunaBrain.js` (LUNA) | river (GenerateSpeech) |
| `sophie` | Sophie | She sparkles | `sofiaBrain.js` (SOFIA) | spark (GenerateSpeech) |
| `zac` | Zac | He steadies | `zacBrain.js` (ZAC) | ElevenLabs custom voice (via `generateVoice`) |
| `natalie` | Natalie | She nurtures | `natalieBrain.js` | honey (GenerateSpeech) — **video card only on landing, NOT in COMPANIONS array** |

**Note:** "Natalie" appears on the landing page as a promo video card but is NOT in the `COMPANIONS` array in `companions.js`. The landing page filters `COMPANIONS` to exclude `natalie` and adds a separate video card.

### Custom companions (CustomCompanion entity)
Users can upload a photo and create a custom companion. These are stored in the `CustomCompanion` entity with:
- `name`, `tagline`, `description`, `image_url`, `personality`
- `voice_id` / `voice_name` — ElevenLabs voice for TTS
- `avatar_id` / `avatar_status` — LiveAvatar by-image pipeline
- `source`: always `liveavatar`
- `status`: `draft` or `ready`

**Chat URL pattern:** `/chat/custom-{customCompanionId}`

### Human companions (HumanCompanion entity)
Real people who can offer live sessions. They have referral codes, payout methods, earnings tracking, and affiliate rates. Status flow: `pending → approved → active → suspended`.

---

## 3. Recent Session Work (2026-07-10)

### What was done
1. **Deleted duplicate "Jennifer" CustomCompanion** — was a stale duplicate, removed from DB.
2. **Rebranded "Jess" CustomCompanion as "Natalie"** — a custom companion previously named Jess (different from the built-in Jess) was renamed to Natalie with updated personality traits and description.
3. **Activated Natalie's video avatar** — her `avatar_status` was stuck on `processing` (LiveAvatar API rate-limited). Set `avatar_status` to `active` so the ANAM video pipeline works (ANAM uses a generic avatar with Natalie's personality system prompt).
   - **CustomCompanion ID:** `6a4dfea9ff87545387de8990`
   - **Chat URL:** `/chat/custom-6a4dfea9ff87545387de8990`

### Known issues / things to watch
- **Natalie's LiveAvatar avatar_id** is still null/processing — the LiveAvatar by-image pipeline was rate-limited. ANAM video works as a fallback (uses an Anam avatar with Natalie's personality), but the custom photo-based avatar is not yet generated. If the user asks about the photo-based avatar, it needs to be re-triggered via the `createLiveAvatar` function with `action: "create"`.
- **Voice for Natalie** — uses the built-in `honey` voice via `GenerateSpeech` integration. If the user set a custom `voice_id` on the CustomCompanion record, `VoicePlayer.jsx` will use `generateVoice` (ElevenLabs) instead.

---

## 4. Architecture — Key Files

### Frontend
| File | Purpose |
|---|---|
| `src/App.jsx` | Router — all routes, lazy-loaded pages, auth gates |
| `src/pages/Home.jsx` | Entry — shows Landing (guest) or CustomerDashboard (authed) |
| `src/pages/Landing.jsx` | Public marketing landing page |
| `src/pages/Chat.jsx` | Main chat interface — messaging, memory, media, proactive check-ins |
| `src/pages/Register.jsx` | Registration with OTP, Google, referral tracking, FB bonus, welcome email |
| `src/pages/CreateCompanion.jsx` | Upload photo → create CustomCompanion |
| `src/pages/Pricing.jsx` | Subscription tiers + crypto + top-ups + promo codes |
| `src/pages/Dashboard.jsx` | Admin dashboard |
| `src/pages/CompanionHub.jsx` | Human companion management (earnings, referrals) |
| `src/pages/FbOffer.jsx` | Facebook $10 free credit offer landing page |
| `src/components/MobileShell.jsx` | App layout wrapper — responsive nav, headers, bottom tabs |
| `src/components/companion/AnamView.jsx` | Face-to-face video modal (Anam SDK) — outfits, twin, duration picker |
| `src/components/companion/VoicePlayer.jsx` | TTS playback — ElevenLabs for custom voices, GenerateSpeech for presets |
| `src/components/companion/MessageBubble.jsx` | Chat message rendering |
| `src/lib/companions.js` | Built-in companion definitions |
| `src/lib/creditSystem.js` | Subscription tiers, credit costs, pricing |
| `src/lib/companionStructure.js` | Referral code capture/consume |
| `src/lib/AuthContext.jsx` | Auth provider, session management |
| `src/api/base44Client.js` | Pre-initialized Base44 SDK client |

### Backend functions (`base44/functions/`)
| Function | Purpose |
|---|---|
| `anamSession` | Creates Anam video session token — handles intimacy layer, credit deduction, session logging |
| `generateVoice` | ElevenLabs TTS for companions with custom voice IDs |
| `generateCustomVoice` | ElevenLabs TTS with arbitrary voice_id |
| `generateSupportVoice` | TTS for support widget |
| `createLiveAvatar` | LiveAvatar by-image avatar creation + status checking |
| `liveavatarEmbed` | LiveAvatar embed token for video playback |
| `createCheckout` | Stripe checkout for subscription tiers |
| `createCryptoCheckout` | Kraken deposit address for crypto payments |
| `createMoonPayUrl` | MoonPay crypto on-ramp URL |
| `checkCryptoPayment` | Polls Kraken for crypto deposit confirmation |
| `processPendingCryptoOrders` | Batch processes pending crypto orders |
| `stripeWebhook` | Stripe webhook handler (subscriptions, payments) |
| `moonpayWebhook` | MoonPay webhook handler |
| `logCryptoPaymentToSheet` | Logs crypto payment to Google Sheets |
| `confirmSubscription` | Activates subscription after payment |
| `getSubscription` | Returns current user's subscription details |
| `grantPro` | Admin grants Pro tier to a user |
| `grantFacebookBonus` | Grants $10 FB offer credit |
| `redeemPromoCode` | Redeems a PromoCode for credits |
| `trackMessageUsage` | Tracks daily message count for rate limiting |
| `trackUsage` | General usage tracking |
| `checkLowCreditBalance` | Checks and notifies on low credit |
| `proactiveCheckin` | AI companion sends a proactive check-in message |
| `dailyFollowup` | Sends follow-up emails to inactive users |
| `dailySignupSummary` | Daily admin digest of new signups |
| `notifyAdminSignup` | Notifies admins of new signup |
| `sendWelcomeEmail` | Welcome email to new user |
| `sendUserFollowupEmail` | AI-generated personalized follow-up email |
| `sendCryptoUpsellEmail` | Crypto payment upsell email |
| `getCompanionDashboard` | Human companion dashboard data |
| `getDashboardStats` | Admin dashboard stats |
| `createTwinClone` | Creates a Twin/Clone of a human companion |
| `requestCustomVideo` | Premium custom video request |
| `miaCustomerService` | AI customer service via Mia |
| `facebookAutoReply` | Auto-replies to Facebook Messenger messages |
| `marketingAction` | Executes marketing actions |
| `generateMarketingReport` | Weekly marketing report |
| `manageBilling` | Stripe billing portal |
| `deleteAccount` | Account deletion |
| `inviteUser` | Invite user to app |
| `healthCheck` | Health check endpoint |

### Workflows (`base44/workflows/`)
- `ProactiveCheckin.jsonc` — periodic proactive companion messages
- `DailySignupDigest.jsonc` — daily admin signup summary
- `FacebookDMAutoReply.jsonc` — Facebook Messenger auto-reply
- `LogCryptoPayments.jsonc` — logs crypto payments to Google Sheets
- `CryptoPaymentPoller.jsonc` — polls for crypto payment confirmation
- `LowCreditBalanceAlert.jsonc` — low credit balance notifications
- `WeeklyMarketingReport.jsonc` — weekly marketing report generation
- `IntimacyTrainingProgression.jsonc` — intimacy training stage progression

### Agent (`base44/agents/`)
- `marketing_agent.jsonc` — AI agent for marketing tasks (has HubSpot connector access)

---

## 5. Entities

| Entity | Purpose |
|---|---|
| `CustomCompanion` | User-created companions from photos |
| `HumanCompanion` | Real human companions (referrals, earnings) |
| `TwinClone` | Twin/clone subscriptions for human companions |
| `VideoRequest` | Premium custom video requests |
| `Subscription` | User subscription state (tier, credits, intimacy, twin) |
| `CryptoOrder` | Crypto payment orders (Kraken deposits) |
| `SessionLog` | Admin cost tracking for video sessions |
| `Message` | Chat messages between user and companion |
| `Memory` | Extracted memories per companion-user pair |
| `CompanionNote` | Manual notes about companions |
| `Referral` | Referral tracking |
| `CompanionEarning` | Human companion earnings |
| `PromoCode` | Promo codes for free credits |
| `SheetConfig` | Google Sheets config for crypto logging |
| `User` | Built-in user entity (admin/user roles) |

---

## 6. Subscription & Credit System

### Tiers (`src/lib/creditSystem.js`)
| Tier | Price | Credits | Video Min | Intimacy | Twin |
|---|---|---|---|---|---|
| Free | $0 | 0 | 0 | ❌ | ❌ |
| Plus | $9.99/mo | 12 | limited | ❌ | ❌ |
| Pro | $19.99/mo | 18 | more | ✅ | ❌ |
| VIP | $49.99/mo | 70 | unlimited | ✅ | ✅ |

### Intimacy sessions (credit-based, no subscription needed)
- 15 min = $6 (cost: $1.80 Anam)
- 30 min = $11 (cost: $3.60 Anam)
- 60 min = $20 (cost: $7.20 Anam)
- Anam cost: $0.12/min

### Payment methods
- **Stripe** — card payments, subscriptions
- **MoonPay** — crypto on-ramp (BTC/ETH/USDC)
- **Kraken** — direct crypto deposits (USDC/BTC/ETH) with polling confirmation

---

## 7. Voice System

### How voice works (`src/components/companion/VoicePlayer.jsx`)
1. If companion has a `voice_id` → calls `generateVoice` (ElevenLabs custom voice)
2. If companion is in `ELEVENLABS_VOICES` array (currently just `zac`) → calls `generateVoice` with `companion_id`
3. Otherwise → calls `GenerateSpeech` integration with preset voice from `VOICE_MAP`

### Preset voice map
```js
{
  jess: "honey",
  mia: "sunny",
  luna: "river",
  sophie: "spark",
  natalie: "honey",
}
```

---

## 8. Video System (Anam)

### How video works (`src/components/companion/AnamView.jsx` + `base44/functions/anamSession/entry.ts`)
1. User opens video chat → `AnamView` component mounts
2. Checks `avatar_status` on companion — if `processing`, shows "avatar being created" screen
3. Checks subscription — if no intimacy package, shows duration picker (15/30/60 min, credit-based)
4. Calls `anamSession` function → creates Anam session token
5. `anamSession` resolves avatar: preferred avatar_id → personas list → first available avatar
6. If intimacy active, appends intimacy layer to personality prompt
7. Returns session token → `AnamView` streams via `@anam-ai/js-sdk` to `<video>` element
8. Countdown timer enforced; auto-closes on expiry

### Custom companion video
- Custom companions use LiveAvatar by-image pipeline to create a photo-based avatar
- If `avatar_status` is `processing`, video is blocked with a "being created" message
- If `avatar_status` is `active` but no `avatar_id`, ANAM falls back to a generic avatar with the companion's personality
- Avatar creation can be checked/re-triggered via `createLiveAvatar` function with `action: "check"` or `action: "create"`

---

## 9. Landing Page (`src/pages/Landing.jsx`)

- Hero section with feature pills
- Companion grid (filters out `natalie` from COMPANIONS array, adds separate video promo card for Natalie)
- Features grid
- Pricing preview (4 tiers)
- Mobile app download badges (iOS + Android)
- Footer with support email, legal, companion application link

### Companion cards on landing
Each built-in companion (except natalie) links to `/register`. Natalie is shown as a looping promo video card.

---

## 10. Auth & Registration Flow

### Email registration (`src/pages/Register.jsx`)
1. User fills name, email, password, confirm, DOB (18+ check), mobile
2. `base44.auth.register({email, password})` → does NOT log in, user is unverified
3. Shows OTP input screen
4. User enters 6-digit code → `base44.auth.verifyOtp({email, otpCode})` → gets `access_token`
5. `base44.auth.setToken(token)`
6. `base44.auth.updateMe({full_name, date_of_birth, mobile_number})`
7. Captures referral code (if from companion referral link) → creates Referral record
8. Sends admin notification + welcome email (via `notifyAdminSignup` + `sendUserFollowupEmail`)
9. Checks for FB offer bonus (if came from `/fb-offer` within 5 min) → grants $10 credit
10. Sets session flags for new signup welcome
11. Hard redirect to `/chat/mia` (Mia initiates contact)

### Google registration
- `base44.auth.loginWithProvider("google", "/")`
- AuthContext handles post-Google signup (new user welcome, referral capture)

### Route protection
- Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/`, `/pricing`, `/features`, etc.
- Protected routes (require auth): `/chat/:companionId`, `/games`, `/create`
- All routes wrapped in `MobileShell` layout

---

## 11. Important Conventions

- **Custom user instruction:** The user has given the agent permission to push/deploy changes when finished updating the website if the user is not around.
- **Language:** English (Australian user)
- **Design system:** Dark theme, gold/amber primary color, Playfair Display font
- **Tailwind:** Token-based via `src/index.css` → `tailwind.config.js`
- **Icons:** lucide-react only
- **Components:** shadcn/ui from `@/components/ui/`
- **Import alias:** `@/` (never relative src/ paths)
- **Entity files:** Always write full JSON schema (no find_replace on `.jsonc` entity files)
- **Chat URL pattern for custom companions:** `/chat/custom-{customCompanionId}`
- **Session flags:** `glimr_new_signup_welcome`, `glimr_new_signup_name`, `glimr_signup_handled`, `glimr_fb_offer_time`

---

## 12. What to Read Before Responding

Before responding to the user's next inquiry, read:
1. This file (`docs/HANDOVER.md`)
2. The file the user is currently viewing (check `<current_page>` in the developer comments)
3. Any files directly related to the user's question
4. `src/lib/companions.js` — to know which companions exist
5. `src/pages/Chat.jsx` — if the question involves chat/voice/video behavior
6. `src/components/companion/VoicePlayer.jsx` — if voice-related
7. `src/components/companion/AnamView.jsx` — if video-related
8. `base44/functions/anamSession/entry.ts` — if video session logic is involved

---

## 13. Active Issues / TODOs

1. **Natalie's LiveAvatar photo-based avatar** — still not generated (API rate-limited). ANAM video works as fallback with a generic avatar. If user asks, re-trigger via `createLiveAvatar` with `action: "create"`.
2. **Natalie not in COMPANIONS array** — she only appears on the landing page as a video card. If the user wants her as a full companion, she'd need to be added to `src/lib/companions.js` with a brain file.
3. **Zac's Anam voice** — uses a hardcoded Cartesia voice ID in `anamSession/entry.ts`. Other companions use Anam's default voice.

---

## 14. NEXT BUILD — Mia's Marketing Dashboard

> **Priority task for next session. The user wants a dedicated dashboard where Mia (the marketing agent persona) can log in and see everything she did each day.**

### What to build
A **Mia's Dashboard** page — a visual daily activity feed that shows what Mia accomplished each day so she (and the admin) can stay up to date at a glance.

### Data sources to pull from (all exist already)
| Activity | Source |
|---|---|
| Facebook campaigns generated | `MarketingCampaign` entity — filter by `batch_date` for today |
| Facebook DMs auto-replied | `facebookAutoReply` function logs / execution history |
| Proactive check-ins sent | `proactiveCheckin` function execution history |
| Follow-up emails sent | `dailyFollowup` / `sendUserFollowupEmail` function logs |
| Daily signup digests | `dailySignupSummary` function |
| Marketing reports | `generateMarketingReport` function |
| Scheduled calendar events | Google Calendar connector (already authorized) |
| Ad campaign performance | Meta Ads connector (already authorized) |

### Suggested page structure
- **Route:** `/mia-dashboard` (admin-only — gate with `ProtectedRoute`)
- **Daily summary header:** date, total actions today, quick stats
- **Activity timeline:** chronological feed of everything Mia did today (campaigns created, DMs replied, emails sent, check-ins, reports)
- **Campaign review quick-access:** link to `/campaign-review` for pending drafts
- **Weekly view toggle:** see last 7 days of activity

### Key files to reference
- `base44/entities/MarketingCampaign.jsonc` — campaign data
- `base44/functions/generateDailyCampaigns/entry.ts` — daily campaign generation
- `base44/functions/facebookAutoReply/entry.ts` — FB DM auto-reply
- `base44/functions/proactiveCheckin/entry.ts` — proactive companion messages
- `base44/functions/dailyFollowup/entry.ts` — follow-up emails
- `base44/functions/dailySignupSummary/entry.ts` — signup digests
- `base44/functions/generateMarketingReport/entry.ts` — weekly reports
- `src/pages/Dashboard.jsx` — existing admin dashboard (for reference on style/structure)
- `src/pages/CampaignReview.jsx` — campaign review page (link from Mia's dashboard)
- `base44/agents/marketing_agent.jsonc` — Mia's agent config

### Notes
- The dashboard should feel like Mia's personal workspace — warm, not corporate
- Use the existing dark theme + gold primary color
- Consider a backend function `getMiaActivity` that aggregates today's actions from all sources into one API call
- The marketing agent already has HubSpot, Facebook, Instagram, Meta Ads, Gmail, Google Calendar, and Google Sheets connector access

---

*End of handover. The next agent should now be fully up to date.*