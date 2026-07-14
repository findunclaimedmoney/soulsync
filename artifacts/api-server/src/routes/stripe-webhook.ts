import { Router } from "express";
import { db, usersTable, entitiesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

async function getStripe() {
  const { default: Stripe } = await import("stripe");
  return new Stripe(process.env["STRIPE_LIVE_SECRET_KEY"] as string);
}

async function getSubEntity(userId: string) {
  const rows = await db
    .select()
    .from(entitiesTable)
    .where(and(eq(entitiesTable.model, "Subscription"), eq(entitiesTable.userId, userId as any)))
    .orderBy(desc(entitiesTable.updatedDate))
    .limit(1);
  return rows[0] ?? null;
}

async function upsertSubEntity(userId: string, existing: any, patch: Record<string, unknown>) {
  const merged = { ...(existing?.data ?? {}), ...patch };
  if (existing) {
    await db.update(entitiesTable)
      .set({ data: merged, updatedDate: new Date() })
      .where(eq(entitiesTable.id, existing.id));
  } else {
    await db.insert(entitiesTable).values({ model: "Subscription", userId: userId as any, data: merged });
  }
  return merged;
}

const TIER_CREDITS: Record<string, number> = { starter: 5, plus: 10, pro: 20, vip: 50 };

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

  if (!webhookSecret) {
    (req as any).log?.warn("STRIPE_WEBHOOK_SECRET not set");
    return res.sendStatus(400);
  }

  const stripe = await getStripe();
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    (req as any).log?.warn({ err: err.message }, "Stripe webhook signature failed");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ── Checkout completed (subscriptions + one-time payments) ─────────────
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const meta = session.metadata ?? {};
        const userId = meta.userId as string | undefined;
        if (!userId) break;

        const customerId = session.customer as string;
        if (customerId) {
          await db.update(usersTable)
            .set({ stripeCustomerId: customerId })
            .where(eq(usersTable.id, userId as any));
        }

        const existing = await getSubEntity(userId);

        if (meta.tier) {
          const credits = TIER_CREDITS[meta.tier] ?? 0;
          const currentBalance = (existing?.data as any)?.creditBalance ?? 0;
          await upsertSubEntity(userId, existing, {
            tier: meta.tier,
            status: "active",
            stripeCustomerId: customerId,
            stripeSubscriptionId: session.subscription as string,
            monthlyCredits: credits,
            creditBalance: currentBalance + credits,
          });

          // Store order record + fire all emails — fire and forget
          try {
            const userRow = await db.select({ email: usersTable.email, fullName: usersTable.fullName })
              .from(usersTable).where(eq(usersTable.id, userId as any)).limit(1);
            const user = userRow[0];
            const tierNames: Record<string, string> = { starter: "GLIMR Starter", plus: "GLIMR Plus", pro: "GLIMR Pro", vip: "GLIMR VIP" };
            const tierAmounts: Record<string, number> = { starter: 2900, plus: 4900, pro: 9900, vip: 19900 };
            const companionId = (meta.companion_id as string) || "mia";
            const planLabel = tierNames[meta.tier] ?? meta.tier;
            const amountAud = tierAmounts[meta.tier] ?? 0;

            // Persist order to DB
            await db.insert(entitiesTable).values({
              model: "Order",
              userId: userId as any,
              data: {
                type: "subscription",
                tier: meta.tier,
                plan_label: planLabel,
                amount_aud: amountAud,
                companion_id: companionId,
                email: user?.email ?? "",
                name: user?.fullName ?? "",
                stripe_session_id: session.id,
                status: "paid",
                paid_at: new Date().toISOString(),
              },
            });

            if (user) {
              const { sendCompanionWelcomeEmail, dispatchOrderToMia } = await import("../lib/mailer");
              const firstName = (user.fullName ?? "").split(" ")[0] || "there";
              sendCompanionWelcomeEmail(user.email, firstName, companionId, meta.tier).catch(() => {});
              dispatchOrderToMia({ email: user.email, name: user.fullName ?? "", tier: meta.tier, companionId, amountAud, planLabel }).catch(() => {});
            }
          } catch (e: any) {
            (req as any).log?.warn({ err: e.message }, "Order record/email failed — non-fatal");
          }
        } else if (meta.photo_credits) {
          const add = parseInt(meta.photo_credits, 10);
          const current = (existing?.data as any)?.photoCredits ?? 0;
          await upsertSubEntity(userId, existing, { photoCredits: current + add });
        } else if (meta.credits) {
          const add = parseInt(meta.credits, 10);
          const current = (existing?.data as any)?.creditBalance ?? 0;
          const extra = meta.addon === "intimacy" ? { intimacyPackage: true } : {};
          await upsertSubEntity(userId, existing, { creditBalance: current + add, ...extra });
        }
        break;
      }

      // ── Monthly renewal — top up credits ───────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        if (!customerId || invoice.billing_reason === "subscription_create") break;
        // subscription_create is handled by checkout.session.completed; skip to avoid double credit

        const users = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId as any, customerId))
          .limit(1);
        const user = users[0];
        if (!user) break;

        const existing = await getSubEntity(user.id as string);
        const subData = (existing?.data ?? {}) as any;
        const tier = subData.tier as string | undefined;
        if (!tier || tier === "free") break;

        const monthly = TIER_CREDITS[tier] ?? 0;
        await upsertSubEntity(user.id as string, existing, {
          creditBalance: (subData.creditBalance ?? 0) + monthly,
          creditsUsed: 0,
          status: "active",
        });
        break;
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const users = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId as any, customerId))
          .limit(1);
        const user = users[0];
        if (!user) break;

        const existing = await getSubEntity(user.id as string);
        await upsertSubEntity(user.id as string, existing, {
          tier: "free",
          status: "cancelled",
          monthlyCredits: 0,
        });
        break;
      }

      // ── Payment failed / subscription paused ───────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const status = subscription.status as string;

        if (!["past_due", "unpaid", "paused"].includes(status)) break;

        const users = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.stripeCustomerId as any, customerId))
          .limit(1);
        const user = users[0];
        if (!user) break;

        const existing = await getSubEntity(user.id as string);
        await upsertSubEntity(user.id as string, existing, { status });
        break;
      }
    }
  } catch (err: any) {
    (req as any).log?.error({ err, eventType: event.type }, "Stripe webhook processing error");
    // Still return 200 so Stripe doesn't retry for app-level errors
  }

  return res.json({ received: true });
});

export default router;
