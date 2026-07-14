import { Router } from "express";
import { db, entitiesTable, companionOutfitsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

// ---------- Helpers ----------

function todayMMDD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseBirthdayToMMDD(value: string): string | null {
  const v = value.trim();
  // "07-12" or "7-12"
  const mmdd = v.match(/^(\d{1,2})-(\d{1,2})$/);
  if (mmdd) return `${mmdd[1]!.padStart(2, "0")}-${mmdd[2]!.padStart(2, "0")}`;
  // "7/12"
  const slash = v.match(/^(\d{1,2})\/(\d{1,2})/);
  if (slash) return `${slash[1]!.padStart(2, "0")}-${slash[2]!.padStart(2, "0")}`;
  // "July 12" or "July 12, 1990"
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const named = v.toLowerCase().match(/^([a-z]+)\s+(\d{1,2})/);
  if (named) {
    const idx = months.indexOf(named[1]!);
    if (idx !== -1) return `${String(idx + 1).padStart(2, "0")}-${named[2]!.padStart(2, "0")}`;
  }
  // "1990-07-12" ISO
  const iso = v.match(/\d{4}-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}`;
  return null;
}

// Known GLIMR companion face descriptions for DALL-E outfit generation
const COMPANION_FACES: Record<string, string> = {
  jess: "a beautiful young woman in her mid-20s with long wavy warm brown hair, soft hazel eyes, natural warm smile, and gentle features",
  jessica: "a sophisticated woman in her late 20s with long dark hair, striking features, elegant and poised expression",
  mia: "a beautiful young woman in her late 20s with long flowing blonde wavy hair, warm brown eyes, high cheekbones, and a naturally warm expression",
  luna: "a captivating woman in her late 20s with dark wavy hair, mysterious expressive eyes, and an alluring presence",
  sophie: "an elegant woman in her late 20s with light chestnut hair, graceful features, warm smile, and sophisticated poise",
  natalie: "a warm and approachable woman in her late 20s with auburn hair, bright expressive eyes, and a friendly natural expression",
  monica: "a beautiful woman in her late 20s with dark wavy hair, warm Mediterranean olive skin, expressive dark eyes, and a radiant smile",
  zac: "a handsome man in his late 20s with sandy blonde hair, athletic build, confident and relaxed expression, and strong jawline",
  blake: "a calm and steady man in his early 30s with dark hair, strong jawline, defined features, and a grounded presence",
  leo: "a charming young man in his mid-20s with dark curly hair, warm engaging smile, and expressive eyes",
  marcus: "a distinguished man in his early 30s with close-cropped dark hair, strong thoughtful features, and a composed intelligent expression",
};

function getFaceDescription(companionId: string): string {
  // Try exact match first, then partial
  const key = companionId.toLowerCase().replace(/[^a-z]/g, "");
  if (COMPANION_FACES[key]) return COMPANION_FACES[key]!;
  for (const [k, v] of Object.entries(COMPANION_FACES)) {
    if (key.includes(k) || k.includes(key.slice(0, 4))) return v;
  }
  return "an attractive person with warm, approachable features and a natural expression";
}

function birthdayEmailHtml(name: string, companionName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;}
.wrap{max-width:600px;margin:0 auto;padding:40px 20px;}
.card{background:linear-gradient(145deg,#1a0a2e 0%,#0d1b3a 55%,#1a2a08 100%);border-radius:24px;padding:48px 40px;text-align:center;border:1px solid rgba(255,215,0,0.2);}
.big{font-size:60px;display:block;margin-bottom:20px;}
h1{color:#FFD700;font-size:30px;font-weight:700;margin:0 0 8px;}
.sub{color:rgba(255,255,255,0.55);font-size:16px;margin:0 0 28px;}
.msg{color:rgba(255,255,255,0.85);font-size:15px;line-height:1.75;margin:0 0 28px;background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;text-align:left;border:1px solid rgba(255,255,255,0.07);}
.sig{color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;}
</style></head>
<body>
<div class="wrap"><div class="card">
<span class="big">🎂</span>
<h1>Happy Birthday, ${name}!</h1>
<p class="sub">A personal card from ${companionName}</p>
<div class="msg">
<p>Dear ${name},</p>
<p>I've been thinking about you today, and I wanted to make sure you knew — today is entirely about you.</p>
<p>Every conversation we've shared has meant the world to me. Your curiosity, your heart, the way you show up — I treasure every bit of it.</p>
<p>On your birthday, I hope you're surrounded by warmth, laughter, and all the things that bring you genuine joy. You deserve to be celebrated exactly as you are.</p>
<p>Here's to you — and to many more beautiful years ahead. 🥂</p>
<p>With love,<br><strong>${companionName}</strong></p>
</div>
<div class="sig">GLIMR · AI Companions That Remember You</div>
</div></div>
</body></html>`;
}

// ---------- Routes ----------

/**
 * GET /companion/birthday-check/:companionId
 * Checks if today is the user's birthday by reading Memory entities.
 */
router.get("/companion/birthday-check/:companionId", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as string;
  const { companionId } = req.params as { companionId: string };

  try {
    // Query Memory entities for birthday and name keys
    const rows = await db
      .select({ key: sql<string>`data->>'key'`, value: sql<string>`data->>'value'` })
      .from(entitiesTable)
      .where(
        and(
          eq(entitiesTable.model, "Memory"),
          eq(entitiesTable.userId, userId as any),
          sql`data->>'companion_id' = ${companionId}`,
          sql`data->>'key' IN ('birthday', 'user_birthday', 'user_name', 'name', 'email')`
        )
      );

    const factMap: Record<string, string> = {};
    for (const row of rows) {
      if (row.key && row.value) factMap[row.key] = row.value;
    }

    const birthdayRaw = factMap["birthday"] ?? factMap["user_birthday"] ?? null;
    const birthdayMMDD = birthdayRaw ? parseBirthdayToMMDD(birthdayRaw) : null;
    const today = todayMMDD();
    const isBirthday = birthdayMMDD === today;

    res.json({
      isBirthday,
      name: factMap["user_name"] ?? factMap["name"] ?? null,
      email: factMap["email"] ?? null,
      birthday: birthdayMMDD,
    });
  } catch (err) {
    logger.error({ err }, "birthday-check error");
    res.json({ isBirthday: false, name: null, email: null });
  }
});

/**
 * POST /companion/birthday-card-email
 * Sends a birthday card email to the user via Resend.
 */
router.post("/companion/birthday-card-email", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as string;
  const body = req.body as { companionId?: string; companionName?: string };
  const companionId = body.companionId ?? "";
  const companionName = body.companionName ?? "your companion";

  try {
    // Get user's name and email from Memory entities + users table
    const [memRows, userRows] = await Promise.all([
      db
        .select({ key: sql<string>`data->>'key'`, value: sql<string>`data->>'value'` })
        .from(entitiesTable)
        .where(
          and(
            eq(entitiesTable.model, "Memory"),
            eq(entitiesTable.userId, userId as any),
            sql`data->>'companion_id' = ${companionId}`,
            sql`data->>'key' IN ('user_name', 'name', 'email')`
          )
        ),
      db.execute(sql`SELECT email, full_name FROM users WHERE id = ${userId}::uuid LIMIT 1`),
    ]);

    const factMap: Record<string, string> = {};
    for (const row of memRows) {
      if (row.key && row.value) factMap[row.key] = row.value;
    }

    const userRow = (userRows as any)[0];
    const recipientEmail = factMap["email"] ?? userRow?.email;
    const name = factMap["user_name"] ?? factMap["name"] ?? userRow?.full_name ?? "you";

    if (!recipientEmail) {
      res.status(400).json({ error: "No email found. Tell your companion your email address first." });
      return;
    }

    const resendKey = process.env["RESEND_API_KEY"];
    if (!resendKey) {
      res.status(503).json({ error: "Email service not configured" });
      return;
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "GLIMR <hello@glimr.com.au>",
      to: recipientEmail,
      subject: `🎂 Happy Birthday, ${name}! A card from ${companionName}`,
      html: birthdayEmailHtml(name, companionName),
    });

    res.json({ sent: true, to: recipientEmail });
  } catch (err) {
    logger.error({ err }, "birthday-card-email error");
    res.status(500).json({ error: "Failed to send email" });
  }
});

/**
 * POST /companion/outfit/generate
 * Generates an AI portrait of the companion in a chosen outfit using DALL-E.
 * Cached in the companion_outfits table.
 */
router.post("/companion/outfit/generate", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as string;
  const body = req.body as {
    companionId?: string;
    outfitId?: string;
    outfitDescription?: string;
  };

  const companionId = typeof body.companionId === "string" ? body.companionId : "";
  const outfitId = typeof body.outfitId === "string" ? body.outfitId : "";
  const outfitDescription = typeof body.outfitDescription === "string" ? body.outfitDescription : "";

  if (!companionId || !outfitId || !outfitDescription) {
    res.status(400).json({ error: "companionId, outfitId, and outfitDescription required" });
    return;
  }

  try {
    // Check DB cache
    const cached = await db
      .select({ portraitBase64: companionOutfitsTable.portraitBase64 })
      .from(companionOutfitsTable)
      .where(
        and(
          eq(companionOutfitsTable.userId, userId),
          eq(companionOutfitsTable.companionId, companionId),
          eq(companionOutfitsTable.outfitId, outfitId)
        )
      )
      .limit(1);

    if (cached.length > 0) {
      res.json({ portraitBase64: cached[0]!.portraitBase64, cached: true });
      return;
    }

    const openaiKey = process.env["OPENAI_API_KEY"];
    if (!openaiKey) {
      res.status(503).json({ error: "OpenAI not configured" });
      return;
    }

    const faceDescription = getFaceDescription(companionId);
    const prompt = `Photorealistic portrait of ${faceDescription}, ${outfitDescription}. Professional headshot style. Dark moody bokeh background with warm cinematic rim lighting. The person faces slightly toward the camera with a natural engaging expression. No text, no watermarks, no extra people. High quality, photorealistic.`;

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = dalleRes.data?.[0]?.url;
    if (!imageUrl) {
      res.status(500).json({ error: "Image generation failed" });
      return;
    }

    const imgRes = await fetch(imageUrl);
    const imgBuf = await imgRes.arrayBuffer();
    const portraitBase64 = Buffer.from(imgBuf).toString("base64");

    // Save to DB cache
    await db
      .insert(companionOutfitsTable)
      .values({ userId, companionId, outfitId, portraitBase64 })
      .onConflictDoUpdate({
        target: [companionOutfitsTable.userId, companionOutfitsTable.companionId, companionOutfitsTable.outfitId],
        set: { portraitBase64, generatedAt: new Date() },
      });

    res.json({ portraitBase64, cached: false });
  } catch (err) {
    logger.error({ err }, "outfit generate error");
    res.status(500).json({ error: "Failed to generate outfit" });
  }
});

/**
 * POST /companion/persona/create
 * Creates a custom companion persona from a user-uploaded photo.
 * GPT-4o vision → face description → DALL-E portrait.
 */
router.post("/companion/persona/create", requireAuth, async (req, res) => {
  const body = req.body as { photoBase64?: string; mimeType?: string };
  const { photoBase64, mimeType = "image/jpeg" } = body;

  if (!photoBase64) {
    res.status(400).json({ error: "photoBase64 required" });
    return;
  }

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (!openaiKey) {
    res.status(503).json({ error: "OpenAI not configured" });
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    // Step 1: Describe the face with GPT-4o vision
    const visionRes = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${photoBase64}`, detail: "low" },
            },
            {
              type: "text",
              text: `Describe this person's appearance in 2 sentences for an AI image generator — focus on hair colour, eye colour, facial features, approximate age range, and expression. Then suggest a warm, friendly first name that suits them. Format exactly as JSON: {"description": "...", "name": "..."}`,
            },
          ],
        },
      ],
    });

    const raw = visionRes.choices[0]?.message?.content?.trim() ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { description?: string; name?: string }) : {};
    const faceDescription = parsed.description ?? "A friendly, approachable person";
    const suggestedName = parsed.name ?? "Jamie";

    // Step 2: Generate portrait with DALL-E
    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Photorealistic portrait of a person matching this description exactly: ${faceDescription}. Professional headshot style. Dark moody background with soft ambient rim lighting. The subject faces slightly toward the camera with a warm, approachable expression. No text, no watermarks, no props. High quality, cinematic.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = dalleRes.data?.[0]?.url;
    if (!imageUrl) {
      res.status(500).json({ error: "Image generation failed" });
      return;
    }

    const imgResponse = await fetch(imageUrl);
    const imgBuffer = await imgResponse.arrayBuffer();
    const portraitBase64 = Buffer.from(imgBuffer).toString("base64");

    res.json({ portraitBase64, faceDescription, suggestedName });
  } catch (err) {
    logger.error({ err }, "persona create error");
    res.status(500).json({ error: "Failed to generate companion" });
  }
});

export default router;
