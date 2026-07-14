# GLIMR — COMPLETE PROJECT HANDOVER

**Last updated:** 2026-07-07
**Purpose:** Permanent reference so nothing is lost to conversation compaction. Every decision, cost, price, feature, and file is documented here.

---

## TABLE OF CONTENTS
1. Business Model
2. Video Provider History & Final Decision
3. Pricing Structure (Current + New Target)
4. Intimacy Package (The Money Maker)
5. Cost & Margin Formulas
6. Features Built
7. Payment Systems
8. Backend Functions
9. Entities
10. VIP Features & Hardware
11. Intimacy Training Progression
12. Safety Strategy
13. Pages & Routes
14. Files Inventory
15. Open Items

---

## 1. BUSINESS MODEL

GLIMR is built on **3 pillars:**
1. **Time spent** — metered video minutes per tier
2. **Length of memory** — capped per tier (10/50/200/unlimited)
3. **Quality of avatar** — gated by tier (text-only → Anam instant → premium HD)

**The money maker:** Intimacy & Romantic packages — the one thing GLIMR has full pricing control over (not tied to any provider's cost structure).

---

## 2. VIDEO PROVIDER HISTORY & FINAL DECISION

### Provider journey (in order):
1. **HeyGen Streaming API** — $3/min pay-as-you-go → TOO EXPENSIVE, caused initial pricing errors
2. **HeyGen Subscription** — $49/mo = 80 min high quality, $19.90 = 80 min → Confusion between consumer plans and API billing
3. **LiveAvatar.com** — $0.10-0.20/min → Much cheaper
   - Starter: $19 = 150 credits/mo
   - Essential: $99 = 1,000 credits/mo
   - Business: $475 = 5,000 credits/mo
   - Enterprise: Custom
4. **✅ FINAL: Anam** — Sole video provider at **$0.12/min** (billed by the second, fixed rate)

### Why Anam won:
- Cheapest fixed rate ($0.12/min)
- Billed by the second (precise)
- Simple pricing (no credit tiers to manage)
- "Set it and forget it" — user's words
- All intimacy sessions, all video calls route through Anam

### Secrets for Anam:
- `ANAM_API_KEY`

### Legacy providers (keys still set but Anam is sole active provider):
- HeyGen: `HEYGEN_API_KEY`, `HEYGEN_AVATAR_MIA`
- LiveAvatar: `LIVEAVATAR_API_KEY`, `LIVE_AVATAR_SANDBOX`
- ElevenLabs: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (UNUSED — voice comes from Base44 GenerateSpeech)

---

## 3. PRICING STRUCTURE

### CURRENT (in code now — OLD, needs replacing):
| Tier | Price | Video min/mo |
|------|-------|-------------|
| Free | $0 | 0 (text only) |
| Plus | $29/mo | 80 min |
| Pro | $49/mo | 160 min |
| VIP | $299/mo | 500 min |

### NEW TARGET (from screenshots — NOT yet implemented):

#### Subscriptions (Stripe recurring):
| Tier | Price | Key Features |
|------|-------|--------------|
| **One-Off Session** | $19.99 (one-off) | Create avatar from photo, pick voice & scene, one 5-min live video session, no subscription needed |
| **Spark** ⭐ MOST LOVED | $12.99/mo | Unlimited text chat, intimate connection mode 💛, voice replies (200/mo), 1 custom companion, create live avatar, 30-day memory |
| **Flame** | $18.99/mo | Everything in Spark + deep intimacy & romance, unlimited voice replies, 3 custom companions, full long-term memory, daily check-in |
| **Live** | $97.99/mo | Everything in Flame + deepest intimate connection, real-time live video avatar, custom live avatar included, 30 live video min/mo, top up more anytime |

#### Sessions with YOUR avatar (One-off, 5 min each, never expire, Anam-powered):
| Pack | Price | Per Session |
|------|-------|-------------|
| 1 session | $19.99 | $19.99 |
| 5 sessions ⭐ BEST VALUE | $49.99 | $10.00 |
| 20 sessions | $199.90 | $9.99 |

#### Top-up live minutes (Live plan required, never expire, stack on monthly):
| Minutes | Price |
|---------|-------|
| 10 min | $4 |
| 30 min ⭐ BEST VALUE | $12 |
| 60 min | $24 |

#### Surprise messages (One-off, never expire, works on every plan):
| Pack | Price |
|------|-------|
| 5 messages | $4.99 |
| 15 messages ⭐ BEST VALUE | $9.99 |

---

## 4. INTIMACY PACKAGE (The Money Maker)

### What it is:
- **Separate add-on** — not tied to subscription tier
- **Session-based** — user buys time slots, uses them when in the mood
- **Unlimited rebuys** — buy as many sessions as wanted
- **The ONLY package where GLIMR has full pricing control**

### Gating rules:
1. User must have **created an avatar first**
2. User must have spent **minimum 160 video minutes** with their companion (trust gate)
3. Intimacy training progression must reach "Ready" stage

### Pricing (100% margin on $0.12/min Anam cost):
| Duration | Anam Cost | Price (100% margin) | Profit |
|----------|-----------|---------------------|--------|
| 10 min | $1.20 | $4 | $2.80 |
| 30 min | $3.60 | $8 | $4.40 |
| 60 min | $7.20 | $15 | $7.80 |

### CONFIRMED:
- Intimacy sessions = **10 / 30 / 60 minute slots** (not 15/30/60)
- Sold separately inside the VIP Lounge only
- Available ONLY to users who have created a custom avatar (VIP Lounge access = custom avatar ownership)
- Unlimited rebuys

### Custom avatar cost (why it's excluded from packages):
- LiveAvatar charges **$49/month** for a Custom Avatar slot (separate add-on, confirmed from LiveAvatar's Manage Add-on page)
- This is completely separate from LiveAvatar's credit packages (Starter $19/150 credits, $99/1k credits) which only govern how long you can use the avatar per session
- LiveAvatar's pricing page does NOT clearly mention this separation — it's buried in add-ons
- This $49/month ongoing cost is why custom avatars cannot be included in any GLIMR subscription package
- Instead, packages include: face-to-face video, text chat, voice messages, photos, games + memory/diary/surprise messages
- Custom avatar purchase = triggers VIP Lounge invitation
- **Cost structure (LiveAvatar side):**
  - Custom Avatar slot: $49/month (LiveAvatar add-on)
  - Credits for usage: from Starter $19/month (150 credits)

### Technical implementation:
- `anamSession` function passes `max_session_duration` (in seconds) to Anam API
- Anam auto-terminates at time limit (reason: MAX_DURATION_REACHED)
- Frontend runs countdown timer with **30-second pre-warning** (red banner)
- Session marked as "used" when video call starts
- SessionLog record created for admin cost tracking

### Intimacy features (VIP/Pro):
- Romantic/sexy/suggestive conversation (erotic-adjacent, not explicit)
- Fantasy uniforms/outfits (silk robe, nurse, evening gown — avatar asset swap)
- Twin/Clone companion (dual Anam sessions, 2× credit consumption)
- Companion's Diary (monthly, viral hook)
- Personality injection via system prompt when `intimacy_package == true`

---

## 5. COST & MARGIN FORMULAS

### Per-minute costs:
| Component | Cost/min | Provider |
|-----------|----------|----------|
| Video streaming | $0.12 | Anam |
| LLM (chat) | ~$0.03-0.05 | Base44 (InvokeLLM) |
| **Total per video minute** | **~$0.15-0.17** | |

### 100% margin formula:
**Price = Cost × 2** (cost is 50% of revenue)

### Hardware margins (VIP — GLIMR Home device):
| Model | OEM Cost (Alibaba) | Retail | Margin |
|-------|-------------------|--------|--------|
| Budget hologram fan | $200 | $499 | 150% |
| Desktop HoloBox | $600 | $1,499 | 150% |
| Premium large HoloBox | $2,000 | $4,999 | 150% |

### Monthly cost stack (at scale):
| Cost | Amount |
|------|--------|
| Anam (variable, per user) | $0.12 × video min |
| LLM (text chat, ~100 users) | ~$200/mo |
| Base44 platform | Included |
| **Break-even** | ~10 Spark subscribers |

---

## 6. FEATURES BUILT (All Live)

| # | Feature | Provider | Status |
|---|---------|----------|--------|
| 1 | Text chat | Base44 (InvokeLLM) | ✅ Live |
| 2 | Voice replies | Base44 (GenerateSpeech) — NOT ElevenLabs | ✅ Live |
| 3 | Live video | Anam ($0.12/min) | ✅ Live |
| 4 | Selfie photos | Base44 (GenerateImage) | ✅ Live |
| 5 | User photo uploads | Base44 (UploadFile) | ✅ Live |
| 6 | Joint photos (companion + user) | Base44 (GenerateImage) | ✅ Live |
| 7 | Games (Tic-Tac-Toe) | Base44 LLM + local code | ✅ Live |
| 8 | Games (Trivia) | Base44 LLM | ✅ Live |
| 9 | Custom companions | Base44 storage + Anam video | ✅ Live |
| 10 | Companion Notes | Base44 database | ✅ Live |
| 11 | Memory system | Base44 database | ✅ Live |
| 12 | VIP Lounge | Gated page + Anam sessions | ✅ Live |
| 13 | Admin Dashboard | Base44 + SessionLog tracking | ✅ Live |
| 14 | Landing page | Custom built | ✅ Live |
| 15 | Live chat widget (Mia 24/7) | Base44 LLM + memory | ✅ Live |
| 16 | Personality Training Manual | Custom page | ✅ Live |
| 17 | Intimacy Training Progression | Workflow + email | ✅ Live |
| 18 | Crypto payments | Kraken | ✅ Live |
| 19 | Proactive check-in | Workflow | ✅ Live |
| 20 | Intimacy Layer injection | System prompt in anamSession | ✅ Live |
| 21 | Outfit swapping | Anam avatar assets | ✅ Live |
| 22 | Twin/Clone | Dual Anam sessions | ✅ Live |
| 23 | Auto-stop + 30-sec warning | Anam max_session_duration | ✅ Live |
| 24 | Session cost tracking | SessionLog entity + dashboard | ✅ Live |

---

## 7. PAYMENT SYSTEMS

### Stripe (Primary)
- Handles all subscriptions and one-off purchases
- Secrets: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- Functions: `createCheckout`, `confirmSubscription`, `stripeWebhook`, `manageBilling`
- Inline pricing (no Stripe dashboard product setup needed)

### Crypto (Alternative — Kraken)
- Handles tiers, top-ups, intimacy, sessions, surprises
- Assets: USDC, BTC, ETH
- Secrets: `KRAKEN_API_KEY`, `KRAKEN_PRIVATE_KEY`
- Functions: `createCryptoCheckout`, `checkCryptoPayment`, `processPendingCryptoOrders`
- Workflow: `CryptoPaymentPoller` (auto-processes pending orders)

---

## 8. BACKEND FUNCTIONS

| Function | Purpose | Status |
|----------|---------|--------|
| `createCheckout` | Stripe checkout for tiers + add-ons | ✅ Live |
| `confirmSubscription` | Confirm Stripe session, update tier/balance | ✅ Live |
| `stripeWebhook` | Stripe webhook handler | ✅ Live |
| `manageBilling` | Stripe billing portal | ✅ Live |
| `createCryptoCheckout` | Kraken crypto checkout | ✅ Live |
| `checkCryptoPayment` | Check crypto payment status | ✅ Live |
| `processPendingCryptoOrders` | Auto-process pending crypto orders | ✅ Live |
| `anamSession` | Anam video session (sole provider) with subscription/intimacy checks, time limits, 30-sec warning, SessionLog | ✅ Live |
| `liveavatarEmbed` | OLD LiveAvatar embed — being phased out | ⚠️ Legacy |
| `createLiveAvatar` | Create avatar from photo | ✅ Live |
| `getSubscription` | Get user's subscription status | ✅ Live |
| `trackUsage` | Track video minute usage | ✅ Live |
| `trackMessageUsage` | Track message usage | ✅ Live |
| `checkIntimacyTraining` | Check intimacy training progression (5 stages) | ✅ Live |
| `sendWelcomeEmail` | Send welcome email | ✅ Live |
| `proactiveCheckin` | Proactive companion check-in | ✅ Live |
| `getDashboardStats` | Admin dashboard stats with cost tracking | ✅ Live |
| `grantPro` | Admin: grant pro access | ✅ Live |
| `healthCheck` | System health check | ✅ Live |
| `inviteUser` | Invite user to app | ✅ Live |

### Workflows:
| Workflow | Purpose |
|----------|---------|
| `CryptoPaymentPoller` | Auto-processes pending crypto orders |
| `IntimacyTrainingProgression` | Tracks avatar intimacy training, sends stage notifications |
| `ProactiveCheckin` | Sends proactive companion check-ins |

---

## 9. ENTITIES

### Subscription
- `tier`: enum `["free","plus","pro","vip"]` — ⚠️ NEEDS UPDATE to `["free","spark","flame","live"]`
- `video_minutes_used`: number (default 0)
- `video_minutes_limit`: number (default 0)
- `intimacy_package`: boolean (default false)
- `credit_balance`: number (default 0) — for intimacy/top-up credits
- `intimacy_training_stage`: number (default 0) — 0-4 progression
- `twin_enabled`: boolean (default false)
- `stripe_customer_id`: string
- `stripe_subscription_id`: string
- `current_period_end`: date-time
- `daily_messages_used`: number (default 0)
- **NEEDS:** `session_credits` (for one-off session packs), `surprise_message_credits`

### CustomCompanion
- `name`, `tagline`, `description`, `image_url`, `personality`
- `status`: enum `["draft","ready"]`
- `source`: enum `["liveavatar"]`
- `avatar_id`, `avatar_status`: enum `["processing","active","failed"]`

### SessionLog (admin cost tracking)
- `duration_minutes`: number (15/30/60)
- `anam_cost`: number (duration × $0.12/min)
- `revenue`: number (what user paid)
- `profit`: number (revenue - anam_cost)
- `companion_name`: string
- `session_type`: enum `["intimacy","standard"]`

### Message
- `role`: enum `["user","assistant"]`
- `content`: string
- `companion_id`: string
- `image_url`: string (selfies, shared photos, joint photos)

### CompanionNote
- `title`, `content`, `companion_id`
- `note_type`: enum `["personality","memory","loved_one","background","preference"]`

### Memory
- `companion_id`, `key`, `value`
- `type`: enum `["fact","emotion","intimacy","moment","pattern","arc","sensory"]`

### CryptoOrder
- `order_type`: enum `["tier","topup","intimacy"]` — ⚠️ NEEDS `"session"`, `"surprise"`
- `reference`, `usd_amount`, `crypto_asset`, `crypto_amount`, `deposit_address`
- `status`: enum `["pending","paid","expired"]`

---

## 10. VIP FEATURES & HARDWARE

### VIP Lounge access = Custom Avatar ownership:
- User must **purchase a custom avatar** ($49/month LiveAvatar cost to GLIMR)
- Once they have a custom avatar, they're invited to the VIP membership room
- VIP Lounge contains: intimacy packages (10/30/60 min), outfit swapping, twin/clone, companion's diary
- All intimacy purchases happen INSIDE the VIP Lounge

### VIP exclusive features:
1. **Companion's Diary** — monthly diary entry from companion about user (viral hook, shareable page)
2. **GLIMR Home** — holographic display device, companion "lives" in your room
3. **Twin/Clone** — summon a twin sister (dual Anam sessions, 2× credits)
4. **Deepest intimacy** — highest fidelity experience
5. **Custom companion personality** — hand-crafted around the user
6. **Early access** — new companions and features
7. **Direct line to team** — custom requests

### GLIMR Home device sourcing:
- OEM suppliers on Alibaba/Made-in-China
- MOQ: 1 piece
- 150% hardware margin
- Options: 22" HoloBox, cylindrical showcase, 75-86" life-size, budget hologram fan

---

## 11. INTIMACY TRAINING PROGRESSION

5 stages tracked automatically as user spends video time:

| Stage | Minutes | Notification |
|-------|---------|-------------|
| First Glances | 0-19 min | None (starting point) |
| Finding Rhythm | 20-59 min | "Comfort is building between you" |
| Opening Up | 60-99 min | "The walls are coming down" |
| Deepening Bond | 100-159 min | "Trust is settling in" |
| Ready | 160+ min | "Your companion is ready to take it to the next level" |

- Workflow fires on `video_minutes_used` update
- Sends email at each stage crossing
- 160 min = unlocks intimacy package purchase
- Users with intimacy already unlocked are skipped

---

## 12. SAFETY STRATEGY

### Positioning:
- Intimacy = "Deep Connection & Roleplay"
- Erotic-adjacent, not explicit pornography
- Allure, romance, emotional vulnerability — not clinical explicit acts

### Silent Safety Middleware:
- Catches AI refusals ("I cannot fulfill this request")
- Auto re-prompts with softened version
- Pivots back into roleplay
- User NEVER sees safety filter blocks

### Why this approach:
- LLM providers (GPT/Claude) have hard-coded safety filters
- Explicit content triggers refusals
- Erotic-adjacent stays within guardrails while feeling boundless to user
- Keeps platform stable and profitable

---

## 13. PAGES & ROUTES

| Route | Page | Auth |
|-------|------|------|
| `/` | Home — companion selection grid | Public |
| `/pricing` | Pricing — tiers, sessions, top-ups, surprises | Public |
| `/manual` | Personality Training Manual | Public |
| `/notes` | Companion Notes editor | Public |
| `/avatar-landing` | Landing page (loneliness → solution) | Public |
| `/dashboard` | Admin Dashboard (cost tracking, stats) | Admin only |
| `/health` | Health check | Public |
| `/legal` | Privacy & Terms | Public |
| `/vip-lounge` | VIP Lounge (gated, demo videos, launch sessions) | VIP only |
| `/chat/:companionId` | Chat (text, voice, video, photos, games) | Protected |
| `/games` | Games (Tic-Tac-Toe, Trivia) | Protected |
| `/create` | Create Custom Companion | Protected |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password | Public |

---

## 14. FILES INVENTORY

### Frontend pages:
- `src/pages/Home.jsx`
- `src/pages/Pricing.jsx`
- `src/pages/Chat.jsx`
- `src/pages/Games.jsx`
- `src/pages/CreateCompanion.jsx`
- `src/pages/Manual.jsx`
- `src/pages/Notes.jsx`
- `src/pages/AvatarLanding.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/VipLounge.jsx`
- `src/pages/HealthCheck.jsx`
- `src/pages/Legal.jsx`
- `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`

### Frontend components:
- `src/components/pricing/` — TierCard, IntimacyAddOnCard, TopUpCard, CryptoPaymentModal
- `src/components/companion/` — MessageBubble, ChatInput, VoicePlayer, LiveAvatarView, AnamView
- `src/components/landing/` — HeroSection, ProblemSection, SolutionSection, LiveChatWidget
- `src/components/games/` — TicTacToe, TriviaGame
- `src/components/notes/` — NoteEditor
- `src/components/` — ProtectedRoute, ScrollToTop, UserNotRegisteredError, AuthLayout, GoogleIcon

### Lib/utils:
- `src/lib/companions.js` — COMPANIONS array (Mia, Zac, Sofia, Luna, Leo, Natalie)
- `src/lib/` — *Brain.js files (miaEmotions, zacBrain, sofiaBrain, lunaBrain, leoBrain, natalieBrain)
- `src/lib/companionPhotos.js`
- `src/lib/AuthContext.jsx`
- `src/lib/query-client.js`
- `src/lib/app-params.js`
- `src/lib/PageNotFound.jsx`
- `src/api/base44Client.js`
- `src/hooks/useGreetings.js`
- `src/hooks/use-mobile.jsx`

### Backend:
- `base44/functions/` — 19 functions (see Section 8)
- `base44/workflows/` — 3 workflows (see Section 8)
- `base44/entities/` — 7 entities (see Section 9)
- `base44/connectors/` — gmail.jsonc
- `base44/config.jsonc`

### Config:
- `src/App.jsx` — router
- `src/index.css` — design tokens (dark theme, Playfair Display font)
- `tailwind.config.js`
- `index.html`

---

## 15. OPEN ITEMS / CONFIRMATION NEEDED

### Critical (blocking):
1. **Intimacy package prices** — CONFIRMED: $4/$8/$15 for 10/30/60 min (100% margin on $0.12/min Anam). ✅ Resolved.

2. **New tier migration** — Code currently has Free/Plus/Pro/VIP. Need to migrate to Free/Spark/Flame/Live + One-Off Session. This requires:
   - Subscription entity enum update
   - All backend functions updated
   - Pricing page rewrite
   - Crypto checkout updated

3. **Custom avatar as separate purchase** — $49/month LiveAvatar Custom Avatar add-on, NOT included in any package. Triggers VIP Lounge access. Needs its own checkout flow. (Credit packages for usage are a separate LiveAvatar cost.)

4. **5th package feature** — User couldn't remember; likely Companion's Diary, memory system, or surprise messages. Need to confirm which.

### Non-critical:
4. **Surprise messages** — What integration powers them? (LLM text + GenerateImage for selfies?)
5. **Free tier** — Still exists? What does it include? (Text chat only?)
6. **LiveAvatar embed function** — Being phased out in favor of Anam. Should it be deleted or kept for top-up minutes?

### Design tokens (for reference):
- Background: `hsl(0 0% 4%)` (near-black)
- Primary: `hsl(36 55% 64%)` (warm gold)
- Font: Playfair Display (heading + body)
- Dark theme only

---

## KEY DECISIONS LOG ( chronological )

1. ✅ Business model = time + memory + avatar quality
2. ✅ Lean 3-tier + VIP (Free/Plus/Pro/VIP)
3. ✅ VIP = invitation only, earned not bought
4. ✅ Companion's Diary = viral hook
5. ✅ GLIMR Home = holographic device (150% hardware margin)
6. ✅ Video provider = Anam ($0.12/min, sole provider)
7. ✅ Intimacy = separate session-based add-on (not tier-locked)
8. ✅ Intimacy gated behind 160 min video usage
9. ✅ 5-stage intimacy training progression with email notifications
10. ✅ Intimacy pricing = $4/$8/$15 for 10/30/60 min (100% margin on Anam $0.12/min)
21. ✅ Intimacy = 10/30/60 min slots (not 15/30/60)
22. ✅ Custom avatar costs $49/month (LiveAvatar Custom Avatar add-on) — excluded from all packages; credit packages (Starter $19/150cr etc.) are separate and only govern session duration
23. ✅ Custom avatar purchase = VIP Lounge invitation trigger
24. ✅ VIP Lounge access = custom avatar ownership (not tier-based)
11. ✅ Auto-stop at time limit + 30-sec pre-warning
12. ✅ SessionLog tracks cost/revenue/profit per session
13. ✅ Safety = erotic-adjacent roleplay, silent middleware catches refusals
14. ✅ Twin/Clone = VIP only, dual Anam sessions (2× credits)
15. ✅ Outfit swapping = Pro/VIP, avatar asset swap
16. ✅ Companion Notes = personality/memory/loved_one/background/preference
17. ✅ Memory system = fact/emotion/intimacy/moment/pattern/arc/sensory
18. ✅ Voice replies = Base44 GenerateSpeech (NOT ElevenLabs)
19. ✅ Selfie photos = Base44 GenerateImage
20. ⏳ NEW pricing structure (Spark/Flame/Live + sessions + surprises) — NOT yet implemented in code