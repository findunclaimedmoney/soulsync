import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all subscriptions (service role bypasses RLS)
    const subscriptions = await base44.asServiceRole.entities.Subscription.list('-created_date', 500);

    // Fetch all users once and build an id → email lookup
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const emailByUserId = {};
    for (const u of users) {
      emailByUserId[u.id] = u.email;
    }

    let notified = 0;
    let reset = 0;
    let skipped = 0;

    for (const sub of subscriptions) {
      const monthlyCredits = sub.monthly_credits || 0;
      const creditBalance = sub.credit_balance || 0;

      // Only check subscriptions that have a monthly credit allowance (skips free tier)
      if (monthlyCredits <= 0) {
        skipped++;
        continue;
      }

      const threshold = monthlyCredits * 0.10;

      if (creditBalance < threshold) {
        // Balance is below 10% — send an email if we haven't already this cycle
        if (sub.low_credit_notified) {
          skipped++;
          continue;
        }

        const email = emailByUserId[sub.created_by_id];
        if (!email) {
          skipped++;
          continue;
        }

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: 'Your GLIMR credits are running low',
            body: `<p>Hi,</p>
<p>Your credit balance has dropped below 10% of your monthly allowance.</p>
<p>You currently have <strong>${creditBalance}</strong> credits remaining out of your monthly allowance of <strong>${monthlyCredits}</strong>.</p>
<p>You can top up your credits or upgrade your plan anytime from your account.</p>
<p>— The GLIMR Team</p>`,
          });
          await base44.asServiceRole.entities.Subscription.update(sub.id, { low_credit_notified: true });
          notified++;
        } catch (err) {
          console.error(`Failed to notify ${email}:`, err.message);
          skipped++;
        }
      } else {
        // Balance is back above the threshold — reset the flag so they can be alerted again
        if (sub.low_credit_notified) {
          await base44.asServiceRole.entities.Subscription.update(sub.id, { low_credit_notified: false });
          reset++;
        } else {
          skipped++;
        }
      }
    }

    return Response.json({ notified, reset, skipped, checked: subscriptions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});