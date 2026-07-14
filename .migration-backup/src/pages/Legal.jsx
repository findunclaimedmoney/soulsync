import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Legal() {
  const [tab, setTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-heading text-lg font-semibold tracking-tight">GLIMR</span>
        </div>
        <Link to="/" className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight mb-2 text-center">
          Legal
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-10">
          Last updated: July 7, 2026
        </p>

        <div className="flex gap-2 mb-10 p-1 rounded-full bg-muted/50 w-fit mx-auto">
          <button
            onClick={() => setTab("privacy")}
            className={`py-2 px-5 rounded-full text-sm font-medium transition-colors ${tab === "privacy" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setTab("terms")}
            className={`py-2 px-5 rounded-full text-sm font-medium transition-colors ${tab === "terms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Terms of Service
          </button>
        </div>

        {tab === "privacy" ? (
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                GLIMR ("we", "us", "our") operates the glimr.com.au platform, providing AI companion experiences including text chat, voice, video, and photo features. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Account information: email address, name, and authentication details.</li>
                <li>Conversation data: messages, images, and interactions with AI companions.</li>
                <li>Usage data: session duration, features used, and engagement metrics.</li>
                <li>Payment information: processed securely through Stripe or Kraken; we do not store card details or crypto private keys.</li>
                <li>Subscription data: tier, billing period, and credit balances.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>To provide and personalize your AI companion experience.</li>
                <li>To process payments and manage subscriptions.</li>
                <li>To improve our services, including training and refining companion behavior.</li>
                <li>To send service-related communications, including proactive check-ins from companions.</li>
                <li>To ensure security and prevent abuse.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
              <p>
                We share data with trusted third-party providers only as necessary to operate the service:
              </p>
              <ul className="space-y-2 list-disc pl-5 mt-2">
                <li>Stripe — payment processing and subscription management.</li>
                <li>Kraken — cryptocurrency deposit address generation and payment verification.</li>
                <li>LLM providers — generating companion responses and memories.</li>
                <li>Email providers — transactional and welcome emails.</li>
              </ul>
              <p className="mt-2">We do not sell your personal data to third parties.</p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
              <p>
                Conversation data and memories are retained for the lifetime of your account to maintain companion continuity. You may request deletion of your account and associated data at any time by contacting hello@glimr.com.au.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Access and export your personal data.</li>
                <li>Correct inaccurate information.</li>
                <li>Delete your account and associated data.</li>
                <li>Opt out of marketing communications.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">7. Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data transmission, secure authentication, and access controls. Payment data is handled entirely by Stripe and Kraken — we never see or store your card numbers or crypto private keys.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">8. Contact</h2>
              <p>
                For privacy questions or requests, contact us at hello@glimr.com.au.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using GLIMR, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>
                GLIMR provides AI companion experiences including text chat, voice replies, live video sessions, photo sharing, and games. The service is offered in free and paid subscription tiers with varying features and limits.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">3. Subscriptions and Payments</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Paid subscriptions auto-renew monthly unless cancelled.</li>
                <li>Payments are processed via Stripe (card) or Kraken (cryptocurrency).</li>
                <li>Crypto payments require exact amounts to the provided deposit address; partial or incorrect payments may not be credited.</li>
                <li>Credit balances and video minutes reset at the end of each billing period.</li>
                <li>Refunds are handled on a case-by-case basis — contact admin@glimr.com.au.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>You must be 18 years or older to use this service.</li>
                <li>Do not use the service for illegal, harmful, or abusive purposes.</li>
                <li>Do not attempt to reverse-engineer, scrape, or disrupt the platform.</li>
                <li>Content generated by companions is AI-produced and for entertainment purposes only.</li>
                <li>You are responsible for your interactions and any content you share.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">5. AI Companions</h2>
              <p>
                AI companions are fictional personas powered by language models. They are not real people and their responses are generated, not reflective of actual human emotion or intent. Companion memories and personalities are generated based on your interactions and may not always be accurate.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
              <p>
                GLIMR, its branding, companion designs, and platform code are the property of GLIMR. User-generated content remains the user's property, though you grant us a license to process it for providing the service.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
              <p>
                The service is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability shall not exceed the amount paid in the preceding 30 days.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">8. Termination</h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior. You may cancel your subscription at any time; access continues until the end of the current billing period.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use after changes constitutes acceptance of the revised Terms.
              </p>
            </section>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-3">10. Contact</h2>
              <p>
                For questions about these Terms, contact admin@glimr.com.au.
              </p>
            </section>
          </div>
        )}
      </div>

      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm font-semibold tracking-tight">GLIMR</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <a href="mailto:hello@glimr.com.au" className="text-sm text-muted-foreground hover:text-foreground transition-colors">hello@glimr.com.au</a>
          </div>
        </div>
      </footer>
    </div>
  );
}