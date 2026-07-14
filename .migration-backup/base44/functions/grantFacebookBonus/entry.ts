import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const BONUS_CREDITS = 2; // $10 value ($1 = 0.2 credits, so $10 = 2 credits)

    // Find or create the user's subscription
    let subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: user.id });
    }

    let newBalance;
    if (subs.length === 0) {
      // Create a free-tier subscription with the bonus credits
      await base44.asServiceRole.entities.Subscription.create({
        tier: 'free',
        monthly_credits: 0,
        credits_used: 0,
        credit_balance: BONUS_CREDITS,
        video_minutes_used: 0,
        video_minutes_limit: 0,
        intimacy_package: false,
        intimacy_sessions_completed: 0,
        twin_enabled: false,
        owner_user_id: user.id,
      });
      newBalance = BONUS_CREDITS;
    } else {
      const sub = subs[0];
      newBalance = (sub.credit_balance || 0) + BONUS_CREDITS;
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        credit_balance: newBalance,
      });
    }

    // Notify admin
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          from_name: 'GLIMR Facebook Offer',
          subject: `FB offer claimed: ${user.email}`,
          body: `Someone claimed the Facebook $10 free credits offer!\n\nUser: ${user.full_name || 'Unknown'} (${user.email})\nCredits granted: ${BONUS_CREDITS} ($10 value)\nNew balance: ${newBalance} credits`,
        });
      }
    }

    return Response.json({
      success: true,
      credits_granted: BONUS_CREDITS,
      new_balance: newBalance,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});