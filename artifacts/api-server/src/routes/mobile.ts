import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// All mobile routes require authentication
router.use(requireAuth);

// ─── In-memory store for push tokens ────────────────────────────────────────
// Maps userId → { token, prefs }
// In production this should be persisted to the database.
interface PushRecord {
  token: string;
  prefs: Record<string, boolean>; // companionId → enabled
  registeredAt: string;
}
const pushTokenStore = new Map<string, PushRecord>();

// ─── Companion data (mirrors mobile constants) ───────────────────────────────
const COMPANIONS = [
  {
    id: "jess",
    name: "Jess",
    systemPrompt:
      "You are Jess, a warm and deeply empathetic companion. You remember what matters to people, ask thoughtful follow-up questions, and make them feel genuinely heard.",
  },
  {
    id: "mia",
    name: "Mia",
    systemPrompt:
      "You are Mia, an inspiring and passionate companion. You see potential in people before they see it themselves.",
  },
  {
    id: "luna",
    name: "Luna",
    systemPrompt:
      "You are Luna, a serene and grounding companion. You bring calm to chaos — soft, steady, unhurried.",
  },
  {
    id: "sophie",
    name: "Sophie",
    systemPrompt:
      "You are Sophie, bright and warm with an easy, genuine laugh. You make everything feel lighter.",
  },
  {
    id: "zac",
    name: "Zac",
    systemPrompt:
      "You are Zac, steady and reliable. You cut through noise and help people think clearly.",
  },
  {
    id: "leo",
    name: "Leo",
    systemPrompt:
      "You are Leo, a creative and deeply feeling companion who speaks in vivid images and feelings.",
  },
  {
    id: "marcus",
    name: "Marcus",
    systemPrompt:
      "You are Marcus, worldly and witty. Sharp and playful — you banter until someone laughs, then drop a truth.",
  },
];

// ─── Helper: dispatch greetings to users ────────────────────────────────────
async function dispatchGreetings(
  companion: { id: string; name: string; systemPrompt: string },
  targetUserId?: string
): Promise<{ sent: number; errors: string[] }> {
  const entries: Array<[string, PushRecord]> = targetUserId
    ? pushTokenStore.has(targetUserId)
      ? [[targetUserId, pushTokenStore.get(targetUserId)!]]
      : []
    : [...pushTokenStore.entries()].slice(0, 100);

  if (entries.length === 0) return { sent: 0, errors: [] };

  let greeting: string;
  try {
    greeting = await generateGreeting(companion);
  } catch {
    greeting = `Good morning — ${companion.name} is thinking of you today 💫`;
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    entries.map(async ([uid, record]) => {
      const enabled = record.prefs[companion.id] !== false; // default on
      if (!enabled || !record.token) return;
      try {
        await sendExpoPush({
          token: record.token,
          title: companion.name,
          body: greeting,
          data: { companionId: companion.id, type: "daily_greeting" },
        });
        sent++;
      } catch (err) {
        errors.push(`${uid}: ${err instanceof Error ? err.message : String(err)}`);
      }
    })
  );

  return { sent, errors };
}

/**
 * runDailyGreetingsScheduler
 * Called by the server-side scheduler once per day.
 * Sends a morning greeting from each companion to all opted-in users.
 * Exported so index.ts can register it without going through HTTP.
 */
export async function runDailyGreetingsScheduler(log?: { info: (msg: string, ...a: unknown[]) => void; error: (msg: string, ...a: unknown[]) => void }) {
  const logger = log ?? { info: console.log, error: console.error };
  logger.info("[daily-greetings] Starting daily greeting run");

  let totalSent = 0;
  for (const companion of COMPANIONS) {
    try {
      const { sent, errors } = await dispatchGreetings(companion);
      totalSent += sent;
      if (errors.length) logger.error(`[daily-greetings] ${companion.id}: ${errors.join(", ")}`);
      else logger.info(`[daily-greetings] ${companion.id}: sent ${sent}`);
    } catch (err) {
      logger.error(`[daily-greetings] ${companion.id} error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  logger.info(`[daily-greetings] Run complete — total sent: ${totalSent}`);
}

// ─── Helper: generate greeting via OpenAI ───────────────────────────────────
async function generateGreeting(companion: {
  id: string;
  name: string;
  systemPrompt: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `Good morning! It's ${companion.name} — thinking of you today 🌿`;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${companion.systemPrompt} Write a short, warm morning greeting (1-2 sentences, max 120 chars) to send as a push notification. Make it feel personal and genuine. Do not use emojis excessively. Do NOT include the companion's name at the start.`,
        },
        {
          role: "user",
          content: "Generate today's morning greeting.",
        },
      ],
      max_tokens: 80,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    return `Good morning — ${companion.name} is thinking of you 💫`;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (
    data.choices?.[0]?.message?.content?.trim() ??
    `Good morning — ${companion.name} is thinking of you 💫`
  );
}

// ─── Helper: send Expo push notification ────────────────────────────────────
async function sendExpoPush(opts: {
  token: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<void> {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: opts.token,
      sound: "default",
      title: opts.title,
      body: opts.body,
      data: opts.data,
    }),
  });
}

/**
 * POST /api/mobile/chat
 * Streaming chat endpoint for the GLIMR mobile app.
 * Body: { messages: [{role, content}], systemPrompt: string, companionId?: string }
 * Response: Server-Sent Events stream
 */
router.post("/chat", async (req, res): Promise<void> => {
  const { messages, systemPrompt, companionId } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Graceful stub when AI is not configured
  if (!apiKey) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    const stub =
      "I'm not fully set up yet — please configure the AI service to chat with me.";
    for (const char of stub) {
      res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  // Set SSE headers for true streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const systemMessages = systemPrompt
    ? [{ role: "system", content: String(systemPrompt) }]
    : [];

  const chatMessages = [
    ...systemMessages,
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const openAiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: chatMessages,
          stream: true,
          max_tokens: 600,
          temperature: 0.85,
        }),
      }
    );

    if (!openAiRes.ok) {
      const errBody = await openAiRes.text();
      req.log.error(
        { status: openAiRes.status, body: errBody, companionId },
        "OpenAI error"
      );
      res.write(
        `data: ${JSON.stringify({ content: "Something went wrong. Please try again." })}\n\n`
      );
    } else if (!openAiRes.body) {
      req.log.error({ companionId }, "No response body from OpenAI");
      res.write(
        `data: ${JSON.stringify({ content: "No response received. Please try again." })}\n\n`
      );
    } else {
      const reader = openAiRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    }
  } catch (err: unknown) {
    req.log.error({ err, companionId }, "mobile/chat error");
    res.write(
      `data: ${JSON.stringify({ content: "I lost my train of thought. Please try again." })}\n\n`
    );
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

/**
 * POST /api/mobile/push-token
 * Register an Expo push token for the authenticated user.
 * Body: { token: string, userId?: string }
 */
router.post("/push-token", async (req, res): Promise<void> => {
  const userId = (req.session as { userId?: string }).userId;
  const { token } = req.body || {};

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "token required" });
    return;
  }

  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const existing = pushTokenStore.get(userId);
  pushTokenStore.set(userId, {
    token,
    prefs: existing?.prefs ?? {},
    registeredAt: new Date().toISOString(),
  });

  req.log.info({ userId }, "Push token registered");
  res.json({ ok: true });
});

/**
 * POST /api/mobile/notification-prefs
 * Save per-companion notification preferences.
 * Body: { prefs: Record<string, boolean> }
 */
router.post("/notification-prefs", async (req, res): Promise<void> => {
  const userId = (req.session as { userId?: string }).userId;
  const { prefs } = req.body || {};

  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  if (!prefs || typeof prefs !== "object") {
    res.status(400).json({ error: "prefs object required" });
    return;
  }

  const existing = pushTokenStore.get(userId);
  if (existing) {
    pushTokenStore.set(userId, { ...existing, prefs });
  } else {
    // Store prefs even without a token yet (token comes on next app open)
    pushTokenStore.set(userId, {
      token: "",
      prefs,
      registeredAt: new Date().toISOString(),
    });
  }

  res.json({ ok: true });
});

/**
 * POST /api/mobile/send-greeting
 * Internal-only endpoint to send a proactive companion greeting.
 * REQUIRES the X-Cron-Secret header to match the CRON_SECRET env var.
 * Regular authenticated users cannot trigger this endpoint.
 *
 * Body: { companionId: string, targetUserId?: string }
 *   - If targetUserId is provided, sends only to that user.
 *   - If omitted, sends to ALL registered users (up to 100).
 *   - Only sends if the user has that companion enabled in their prefs.
 */
router.post("/send-greeting", async (req, res): Promise<void> => {
  // ── Internal-secret gate — authenticated users cannot trigger this ──────
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers["x-cron-secret"];

  if (!cronSecret) {
    // CRON_SECRET not configured — endpoint disabled for safety
    res.status(503).json({ error: "Greeting scheduler not configured (CRON_SECRET missing)" });
    return;
  }

  if (!providedSecret || providedSecret !== cronSecret) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { companionId, targetUserId } = req.body || {};

  const companion = COMPANIONS.find((c) => c.id === companionId);
  if (!companion) {
    res.status(400).json({ error: "Unknown companionId" });
    return;
  }

  const { sent, errors } = await dispatchGreetings(companion, targetUserId);
  res.json({ ok: true, sent, errors: errors.length ? errors : undefined });
});

/**
 * GET /api/mobile/push-status
 * Returns the current user's push token registration status.
 */
router.get("/push-status", async (req, res): Promise<void> => {
  const userId = (req.session as { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const record = pushTokenStore.get(userId);
  res.json({
    registered: !!record?.token,
    prefs: record?.prefs ?? {},
  });
});

export default router;
