import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, usersTable, otpTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";

const resend = process.env["RESEND_API_KEY"] ? new Resend(process.env["RESEND_API_KEY"]) : null;
const FROM = "GLIMR <hello@glimr.com.au>";
const APP_URL = process.env["REPLIT_DEV_DOMAIN"]
  ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
  : process.env["APP_URL"] ?? "https://glimr.com.au";

async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!resend) { console.warn("[auth] RESEND_API_KEY not set — OTP not emailed:", code); return; }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your GLIMR verification code",
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#0a0a0a;color:#fff;border-radius:12px;">
        <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;">GLIMR</h1>
        <p style="color:#999;margin:0 0 32px;font-size:14px;">Your companion is waiting.</p>
        <p style="font-size:16px;margin:0 0 24px;">Here's your verification code:</p>
        <div style="background:#1a1a1a;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px;">
          <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#fff;">${code}</span>
        </div>
        <p style="color:#666;font-size:13px;margin:0;">This code expires in 15 minutes. If you didn't request this, you can safely ignore it.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  if (!resend) { console.warn("[auth] RESEND_API_KEY not set — reset link not emailed:", token); return; }
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your GLIMR password",
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#0a0a0a;color:#fff;border-radius:12px;">
        <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;">GLIMR</h1>
        <p style="color:#999;margin:0 0 32px;font-size:14px;">Password reset request</p>
        <p style="font-size:16px;margin:0 0 24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#fff;color:#000;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;margin:0 0 24px;">Reset Password</a>
        <p style="color:#666;font-size:13px;margin:0;">If you didn't request this, you can safely ignore it. Your password won't change.</p>
      </div>
    `,
  });
}

const router = Router();

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const session = req.session as any;
  if (!session?.userId) return res.status(401).json({ error: "Not authenticated" });
  try {
    const [user] = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      fullName: usersTable.fullName,
      full_name: usersTable.fullName,
      dateOfBirth: usersTable.dateOfBirth,
      date_of_birth: usersTable.dateOfBirth,
      mobileNumber: usersTable.mobileNumber,
      mobile_number: usersTable.mobileNumber,
      avatarUrl: usersTable.avatarUrl,
      avatar_url: usersTable.avatarUrl,
      role: usersTable.role,
      emailVerified: usersTable.emailVerified,
      email_verified: usersTable.emailVerified,
      createdDate: usersTable.createdDate,
      created_date: usersTable.createdDate,
    }).from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) { req.session.destroy(() => {}); return res.status(401).json({ error: "User not found" }); }
    return res.json(user);
  } catch (err) {
    req.log.error({ err }, "auth/me error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, String(email).toLowerCase()));
    if (!user?.passwordHash) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    (req.session as any).userId = user.id;
    return res.json({ id: user.id, email: user.email, fullName: user.fullName, full_name: user.fullName });
  } catch (err) {
    req.log.error({ err }, "auth/login error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, String(email).toLowerCase()));
    if (existing) return res.status(400).json({ error: "An account with this email already exists" });
    const hash = await bcrypt.hash(String(password), 12);
    const [user] = await db.insert(usersTable).values({ email: String(email).toLowerCase(), passwordHash: hash, emailVerified: false }).returning({ id: usersTable.id, email: usersTable.email });
    const code = await _generateOtp(String(email).toLowerCase(), "registration");
    await sendOtpEmail(String(email).toLowerCase(), code);
    req.log.info({ email }, "Registration OTP sent via Resend");
    return res.json({ message: "Check your email for a verification code.", email: user.email });
  } catch (err) {
    req.log.error({ err }, "auth/register error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otpCode } = req.body || {};
  if (!email || !otpCode) return res.status(400).json({ error: "Email and OTP required" });
  try {
    const now = new Date();
    const [token] = await db.select().from(otpTokensTable).where(
      and(
        eq(otpTokensTable.email, String(email).toLowerCase()),
        eq(otpTokensTable.code, String(otpCode)),
        eq(otpTokensTable.tokenType, "registration"),
        eq(otpTokensTable.used, false),
        gt(otpTokensTable.expiresAt, now),
      )
    );
    if (!token) return res.status(400).json({ error: "Invalid or expired verification code" });
    await db.update(otpTokensTable).set({ used: true }).where(eq(otpTokensTable.id, token.id));
    await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.email, String(email).toLowerCase()));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, String(email).toLowerCase()));
    if (user) (req.session as any).userId = user.id;

    // Fire welcome + admin notification in background — don't block the response
    if (user) {
      const { sendWelcomeEmail, notifyAdminNewSignup } = await import("../lib/mailer");
      const firstName = ((user.fullName ?? "") as string).split(" ")[0] || "there";
      sendWelcomeEmail(user.email, firstName).catch(() => {});
      notifyAdminNewSignup(user.email, user.fullName ?? "").catch(() => {});
    }

    return res.json({ success: true, access_token: "session" });
  } catch (err) {
    req.log.error({ err }, "auth/verify-otp error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const code = await _generateOtp(String(email).toLowerCase(), "registration");
    await sendOtpEmail(String(email).toLowerCase(), code);
    req.log.info({ email }, "OTP resent via Resend");
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "auth/resend-otp error");
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/auth/me
router.patch("/me", async (req, res) => {
  const session = req.session as any;
  if (!session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const body = req.body || {};
  try {
    const updates: Record<string, unknown> = { updatedDate: new Date() };
    const fullName = body.full_name ?? body.fullName;
    const dateOfBirth = body.date_of_birth ?? body.dateOfBirth;
    const mobileNumber = body.mobile_number ?? body.mobileNumber;
    const avatarUrl = body.avatar_url ?? body.avatarUrl;
    if (fullName !== undefined) updates.fullName = fullName;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (mobileNumber !== undefined) updates.mobileNumber = mobileNumber;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, session.userId)).returning({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName });
    return res.json({ ...user, full_name: user.fullName });
  } catch (err) {
    req.log.error({ err }, "auth/me patch error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  return res.json({ success: true });
});

// POST /api/auth/forgot-password
// Generates a secure UUID reset token (not a guessable 6-digit code)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (email) {
    try {
      const token = await _generateResetToken(String(email).toLowerCase());
      await sendPasswordResetEmail(String(email).toLowerCase(), token);
      req.log.info({ email }, "Password reset email sent via Resend");
    } catch (err) {
      req.log.error({ err }, "forgot-password token error");
    }
  }
  // Always return success to prevent email enumeration
  return res.json({ success: true, message: "If an account exists, you'll receive a reset link." });
});

// POST /api/auth/reset-password
// Accepts { token, newPassword } — token is a UUID issued by forgot-password.
// Email is resolved server-side from the stored token record; not accepted from client.
router.post("/reset-password", async (req, res) => {
  const body = req.body || {};
  const token = body.token ?? body.resetToken;
  const password = body.newPassword ?? body.password;
  if (!token || !password) return res.status(400).json({ error: "Reset token and new password required" });
  if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  try {
    const now = new Date();
    // Token is a UUID — look up by code, type=password_reset, not yet used, not expired
    const [otp] = await db.select().from(otpTokensTable).where(
      and(
        eq(otpTokensTable.code, String(token)),
        eq(otpTokensTable.tokenType, "password_reset"),
        eq(otpTokensTable.used, false),
        gt(otpTokensTable.expiresAt, now),
      )
    );
    if (!otp) return res.status(400).json({ error: "Invalid or expired reset link" });

    // Email is taken from the stored token — never trusts client-provided email
    const hash = await bcrypt.hash(String(password), 12);
    await db.update(usersTable).set({ passwordHash: hash, updatedDate: new Date() }).where(eq(usersTable.email, otp.email));
    // Mark all reset tokens for this email as used
    await db.update(otpTokensTable).set({ used: true }).where(
      and(eq(otpTokensTable.email, otp.email), eq(otpTokensTable.tokenType, "password_reset"))
    );
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "reset-password error");
    return res.status(500).json({ error: "Server error" });
  }
});

// --- Helpers ---

/** Generate a 6-digit OTP for email verification (registration type). */
async function _generateOtp(email: string, type: "registration"): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await db.insert(otpTokensTable).values({ email, code, tokenType: type, expiresAt });
  return code;
}

/** Generate a cryptographically secure UUID reset token (password_reset type). */
async function _generateResetToken(email: string): Promise<string> {
  const token = randomUUID(); // 128-bit random, not guessable
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db.insert(otpTokensTable).values({ email, code: token, tokenType: "password_reset", expiresAt });
  return token;
}

export default router;
