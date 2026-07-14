import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, Calendar } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { consumeReferralCode } from "@/lib/companionStructure";
import { consumeRedirectAfterAuth } from "@/lib/companionCTA";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const isOver18 = (dateStr) => {
    if (!dateStr) return false;
    const dob = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isOver18(dob)) {
      setError("You must be 18 or older to use GLIMR");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      // Save the user's profile details (name, DOB, mobile)
      try {
        await base44.auth.updateMe({
          full_name: fullName,
          date_of_birth: dob,
          mobile_number: mobile,
        });
      } catch (e) {
        console.error("Profile update failed:", e);
      }
      // Mark the landing page visit as converted (marketing attribution)
      const visitId = localStorage.getItem("glimr_visit_id");
      if (visitId) {
        try {
          await base44.functions.invoke("convertVisit", { visit_id: visitId });
        } catch (e) {
          console.error("Visit conversion tracking failed:", e);
        }
        localStorage.removeItem("glimr_visit_id");
      }
      // If they signed up via a companion's referral link, record the referral
      const refCode = consumeReferralCode();
      if (refCode) {
        try {
          await base44.entities.Referral.create({
            referrer_code: refCode,
            referred_email: email,
            signed_up_date: new Date().toISOString(),
            status: "pending",
          });
        } catch (err) {
          console.error("Referral tracking failed:", err);
        }
      }
      // Notify admin + have Mia send a welcome email BEFORE redirecting
      // (must await — otherwise window.location.href cancels the pending requests)
      try {
        await Promise.all([
          base44.functions.invoke("notifyAdminSignup", { user_email: email }),
          base44.functions.invoke("sendUserFollowupEmail", {
            user_email: email,
            goal: "They just signed up moments ago. Welcome them to GLIMR warmly by name. Tell them they can start chatting with a companion for free right now — no credit card needed. Mention there are companions like Mia, Jess, Luna, Sophie, Natalie, and Zac. Keep it short, warm, and inviting — like a friend welcoming them to something special.",
          }),
        ]);
      } catch (e) {
        console.error("Welcome/notification failed:", e);
      }
      // Check if they came from the Facebook $10 free offer landing page
      const fbOfferTime = sessionStorage.getItem("glimr_fb_offer_time");
      if (fbOfferTime) {
        const elapsed = Date.now() - parseInt(fbOfferTime);
        const fiveMinutes = 5 * 60 * 1000;
        if (elapsed <= fiveMinutes) {
          try {
            await base44.functions.invoke("grantFacebookBonus", {});
          } catch (e) {
            console.error("FB bonus grant failed:", e);
          }
        }
        sessionStorage.removeItem("glimr_fb_offer_time");
      }
      // Check if they came from the Jess free session offer — send them back to claim
      const jessOffer = sessionStorage.getItem("glimr_jess_offer");
      if (jessOffer) {
        sessionStorage.removeItem("glimr_jess_offer");
        sessionStorage.setItem("glimr_jess_auto_claim", "1");
        sessionStorage.setItem("glimr_signup_handled", "1");
        sessionStorage.setItem("glimr_new_signup_welcome", "1");
        sessionStorage.setItem("glimr_new_signup_name", fullName.split(" ")[0] || "there");
        window.location.href = "/jess-offer";
        return;
      }
      // Check if they came from a companion landing page CTA — redirect there instead of Mia
      const landingRedirect = sessionStorage.getItem("glimr_redirect_after_auth");
      if (landingRedirect) {
        sessionStorage.removeItem("glimr_redirect_after_auth");
        sessionStorage.setItem("glimr_signup_handled", "1");
        sessionStorage.setItem("glimr_new_signup_name", fullName.split(" ")[0] || "there");
        window.location.href = landingRedirect;
        return;
      }
      // Flag so AuthContext doesn't double-fire (it handles Google signups only)
      sessionStorage.setItem("glimr_signup_handled", "1");
      // Tell Mia's chat to send a welcome message with the user's name
      sessionStorage.setItem("glimr_new_signup_welcome", "1");
      sessionStorage.setItem("glimr_new_signup_name", fullName.split(" ")[0] || "there");
      // Send the new user straight to Mia so she can initiate contact
      window.location.href = "/chat/mia";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">You must be 18 or older to use GLIMR.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel"
              placeholder="0412 345 678"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}