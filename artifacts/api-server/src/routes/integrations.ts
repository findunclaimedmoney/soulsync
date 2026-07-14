import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// All integration routes require authentication (except file serving)
router.use((req, res, next) => {
  if (req.path.startsWith("/files/")) return next();
  return requireAuth(req, res, next);
});

// POST /api/integrations/llm — InvokeLLM
router.post("/llm", async (req, res) => {
  const { prompt, response_json_schema } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    req.log.warn("OPENAI_API_KEY not set — returning stub LLM response");
    return res.json({ output: "AI service not configured. Please add OPENAI_API_KEY to secrets." });
  }

  try {
    const messages: { role: string; content: string }[] = [{ role: "user", content: String(prompt) }];
    const body: Record<string, unknown> = { model: "gpt-4o-mini", messages, temperature: 0.8 };
    if (response_json_schema) body.response_format = { type: "json_object" };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    const data = await r.json() as { choices?: { message?: { content?: string } }[] };
    if (!r.ok) {
      const errMsg = (data as { error?: { message?: string } }).error?.message || r.statusText;
      throw new Error(errMsg);
    }
    const content = data.choices?.[0]?.message?.content || "";
    if (response_json_schema) {
      try { return res.json(JSON.parse(content)); } catch {}
    }
    return res.json({ output: content });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "LLM error";
    req.log.error({ err }, "integrations/llm error");
    return res.status(500).json({ error: msg });
  }
});

// POST /api/integrations/image — GenerateImage
router.post("/image", async (req, res) => {
  const { prompt, aspect_ratio } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ url: "https://placehold.co/1024x1024?text=Image+not+configured" });
  }

  try {
    const size = aspect_ratio === "16:9" ? "1792x1024" : aspect_ratio === "9:16" ? "1024x1792" : "1024x1024";
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "dall-e-3", prompt: String(prompt), size, n: 1 }),
    });
    const data = await r.json() as { data?: { url?: string }[]; error?: { message?: string } };
    if (!r.ok) throw new Error(data.error?.message || r.statusText);
    return res.json({ url: data.data?.[0]?.url || "" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Image generation error";
    req.log.error({ err }, "integrations/image error");
    return res.status(500).json({ error: msg });
  }
});

// POST /api/integrations/speech — GenerateSpeech
router.post("/speech", async (req, res) => {
  const { text, voice = "alloy" } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ audio_url: null, error: "TTS not configured" });
  }

  try {
    const voiceName = String(voice) === "sunny" ? "nova" : String(voice);
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "tts-1", input: String(text), voice: voiceName }),
    });
    if (!r.ok) throw new Error(r.statusText);
    const buf = Buffer.from(await r.arrayBuffer());
    const b64 = buf.toString("base64");
    return res.json({ audio_url: `data:audio/mpeg;base64,${b64}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "TTS error";
    req.log.error({ err }, "integrations/speech error");
    return res.status(500).json({ error: msg });
  }
});

// POST /api/integrations/transcribe — TranscribeAudio
router.post("/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ transcript: "Transcription not configured" });
  }

  try {
    const form = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([req.file.buffer as any], { type: req.file.mimetype || "audio/webm" });
    form.append("file", blob, req.file.originalname || "audio.webm");
    form.append("model", "whisper-1");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!r.ok) throw new Error(r.statusText);
    const data = await r.json() as { text?: string };
    return res.json({ transcript: data.text || "" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transcription error";
    req.log.error({ err }, "integrations/transcribe error");
    return res.status(500).json({ error: msg });
  }
});

// POST /api/integrations/upload — UploadFile
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  try {
    const { v4: uuidv4 } = await import("uuid");
    const id = uuidv4();
    const raw = req.file.originalname || "file.bin";
    const ext = raw.includes(".") ? raw.split(".").pop()! : "bin";
    const filename = `${id}.${ext}`;
    const { mkdir, writeFile } = await import("fs/promises");
    await mkdir("/tmp/uploads", { recursive: true });
    await writeFile(`/tmp/uploads/${filename}`, req.file.buffer);
    const url = `/api/integrations/files/${filename}`;
    return res.json({ url, file_url: url, filename });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload error";
    req.log.error({ err }, "integrations/upload error");
    return res.status(500).json({ error: msg });
  }
});

// GET /api/integrations/files/:filename — serve uploaded files (no auth needed)
router.get("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(filename)) {
    return res.status(400).json({ error: "Invalid filename" });
  }
  return res.sendFile(`/tmp/uploads/${filename}`, (err) => {
    if (err) res.status(404).json({ error: "File not found" });
  });
});

// POST /api/integrations/email — SendEmail (stub — wire up email provider to activate)
router.post("/email", async (req, res) => {
  const { to, subject } = req.body || {};
  req.log.info({ to, subject }, "SendEmail stub — configure an email provider to send real emails");
  return res.json({ success: true });
});

export default router;
