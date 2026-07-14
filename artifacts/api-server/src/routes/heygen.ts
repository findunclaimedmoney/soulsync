/**
 * HeyGen Streaming Avatar — backend proxy routes
 *
 * Proxies the HeyGen REST API so the frontend can use WebRTC
 * without exposing the API key or hitting CORS restrictions.
 *
 * Endpoints:
 *   POST   /api/heygen/session          — create session (get SDP offer + ICE servers)
 *   POST   /api/heygen/session/:id/start — send SDP answer
 *   POST   /api/heygen/session/:id/ice   — relay ICE candidate
 *   POST   /api/heygen/session/:id/speak — make avatar speak
 *   DELETE /api/heygen/session/:id       — stop session
 */

import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const HEYGEN_BASE = "https://api.heygen.com";

function heygenHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env["HEYGEN_API_KEY"] ?? "",
  };
}

function noKey(res: any) {
  return res.status(503).json({ error: "HeyGen API key not configured" });
}

// ── POST /api/heygen/session ─────────────────────────────────────────────────

router.post("/heygen/session", requireAuth, async (req, res) => {
  if (!process.env["HEYGEN_API_KEY"]) return noKey(res);

  const body = req.body as { avatarId?: string; voiceId?: string; quality?: string };
  const avatarId = body.avatarId || process.env["HEYGEN_AVATAR_MIA"] || "";
  const voiceId  = body.voiceId  || "";
  const quality  = body.quality  || "medium";

  try {
    const upstream = await fetch(`${HEYGEN_BASE}/v1/streaming.new`, {
      method: "POST",
      headers: heygenHeaders(),
      body: JSON.stringify({
        quality,
        avatar_id: avatarId,
        voice: voiceId ? { voice_id: voiceId } : undefined,
      }),
    });

    const data = await upstream.json() as any;
    if (!upstream.ok || data.code !== 100) {
      req.log.error({ status: upstream.status, data }, "HeyGen session.new error");
      return res.status(502).json({ error: data?.message ?? "HeyGen error" });
    }

    const session = data.data;
    return res.json({
      sessionId:  session.session_id,
      sdp:        session.sdp?.sdp ?? session.sdp,
      sdpType:    session.sdp?.type ?? "offer",
      iceServers: session.ice_servers2 ?? session.ice_servers ?? [],
    });
  } catch (err: any) {
    req.log.error({ err }, "heygen session create error");
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/heygen/session/:id/start ───────────────────────────────────────

router.post("/heygen/session/:id/start", requireAuth, async (req, res) => {
  if (!process.env["HEYGEN_API_KEY"]) return noKey(res);
  const { id } = req.params as { id: string };
  const { sdp } = req.body as { sdp: string };

  try {
    const upstream = await fetch(`${HEYGEN_BASE}/v1/streaming.start`, {
      method: "POST",
      headers: heygenHeaders(),
      body: JSON.stringify({ session_id: id, sdp: { type: "answer", sdp } }),
    });
    const data = await upstream.json() as any;
    if (!upstream.ok && data.code !== 100) {
      return res.status(502).json({ error: data?.message ?? "HeyGen start error" });
    }
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/heygen/session/:id/ice ─────────────────────────────────────────

router.post("/heygen/session/:id/ice", requireAuth, async (req, res) => {
  if (!process.env["HEYGEN_API_KEY"]) return noKey(res);
  const { id } = req.params as { id: string };
  const { candidate } = req.body as { candidate: RTCIceCandidateInit };

  try {
    await fetch(`${HEYGEN_BASE}/v1/streaming.ice`, {
      method: "POST",
      headers: heygenHeaders(),
      body: JSON.stringify({ session_id: id, candidate }),
    });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/heygen/session/:id/speak ───────────────────────────────────────

router.post("/heygen/session/:id/speak", requireAuth, async (req, res) => {
  if (!process.env["HEYGEN_API_KEY"]) return noKey(res);
  const { id } = req.params as { id: string };
  const { text, taskType = "repeat" } = req.body as { text: string; taskType?: string };

  try {
    const upstream = await fetch(`${HEYGEN_BASE}/v1/streaming.task`, {
      method: "POST",
      headers: heygenHeaders(),
      body: JSON.stringify({ session_id: id, text, task_type: taskType }),
    });
    const data = await upstream.json() as any;
    if (!upstream.ok) return res.status(502).json({ error: data?.message ?? "HeyGen speak error" });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/heygen/session/:id ───────────────────────────────────────────

router.delete("/heygen/session/:id", requireAuth, async (req, res) => {
  if (!process.env["HEYGEN_API_KEY"]) return noKey(res);
  const { id } = req.params as { id: string };

  try {
    await fetch(`${HEYGEN_BASE}/v1/streaming.stop`, {
      method: "DELETE",
      headers: heygenHeaders(),
      body: JSON.stringify({ session_id: id }),
    });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
