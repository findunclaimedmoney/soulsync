import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all users (sorted by newest first, up to 100)
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200);
    const totalUsers = allUsers.length;

    // Users who signed up in the last 24 hours
    const newUsers = allUsers.filter((u) => new Date(u.created_date) > yesterday);

    // Users who signed up 24-48 hours ago (for follow-up)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const recentButNotNew = allUsers.filter((u) => {
      const d = new Date(u.created_date);
      return d <= yesterday && d > twoDaysAgo;
    });

    // Check referral codes for these users (indicates companion/Facebook ad traffic)
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      signed_up_date: { $gte: yesterday.toISOString() },
    }).catch(() => []);

    // Check engagement — how many new users have sent messages
    let engagedCount = 0;
    let notEngagedUsers = [];
    for (const u of newUsers) {
      const messages = await base44.asServiceRole.entities.Message.filter({ created_by_id: u.id });
      if (messages.length > 0) {
        engagedCount++;
      } else {
        notEngagedUsers.push(u);
      }
    }

    // Check subscriptions for new users
    let subscribedCount = 0;
    for (const u of newUsers) {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: u.id });
      if (subs.length > 0 && subs[0].tier && subs[0].tier !== 'free') subscribedCount++;
    }

    // Build the email
    const perthTime = now.toLocaleString('en-AU', { timeZone: 'Australia/Perth', dateStyle: 'full', timeStyle: 'short' });

    let emailBody = `GLIMR Daily Signup Digest\n${perthTime}\n\n`;

    emailBody += `═════════════════════════════════\n`;
    emailBody += `SUMMARY (last 24 hours)\n`;
    emailBody += `═════════════════════════════════\n`;
    emailBody += `New signups: ${newUsers.length}\n`;
    emailBody += `Engaged (sent a message): ${engagedCount}\n`;
    emailBody += `Not yet engaged: ${notEngagedUsers.length}\n`;
    emailBody += `Subscribed (paid tier): ${subscribedCount}\n`;
    emailBody += `Came via companion referral: ${referrals.length}\n`;
    emailBody += `Organic / ad traffic (no referral): ${newUsers.length - referrals.length}\n`;
    emailBody += `Total users now: ${totalUsers}\n\n`;

    if (newUsers.length > 0) {
      emailBody += `═════════════════════════════════\n`;
      emailBody += `NEW SIGNUPS\n`;
      emailBody += `═════════════════════════════════\n`;
      for (const u of newUsers) {
        const msgCount = await base44.asServiceRole.entities.Message.filter({ created_by_id: u.id });
        const time = new Date(u.created_date).toLocaleString('en-AU', { timeZone: 'Australia/Perth', timeStyle: 'short', dateStyle: 'short' });
        emailBody += `• ${u.full_name || 'Unknown'} (${u.email})\n`;
        emailBody += `  Joined: ${time} | Messages: ${msgCount.length}\n`;
      }
      emailBody += `\n`;
    }

    if (notEngagedUsers.length > 0) {
      emailBody += `═════════════════════════════════\n`;
      emailBody += `NEED FOLLOW-UP (signed up but haven't chatted)\n`;
      emailBody += `═════════════════════════════════\n`;
      for (const u of notEngagedUsers) {
        emailBody += `• ${u.full_name || 'Unknown'} — ${u.email}\n`;
      }
      emailBody += `\n`;
    }

    emailBody += `═════════════════════════════════\n`;
    emailBody += `7-DAY TREND\n`;
    emailBody += `═════════════════════════════════\n`;
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSignups = allUsers.filter((u) => new Date(u.created_date) > weekAgo);
    emailBody += `Total signups this week: ${weekSignups.length}\n`;
    emailBody += `Average per day: ${(weekSignups.length / 7).toFixed(1)}\n\n`;

    emailBody += `— GLIMR Auto-Digest\n`;
    emailBody += `(This runs automatically every morning at 8am Perth time)\n`;

    // Send to all admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const admin of admins) {
      if (admin.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          from_name: 'GLIMR Daily Digest',
          subject: `📊 GLIMR Daily: ${newUsers.length} new signups | ${totalUsers} total users`,
          body: emailBody,
        });
      }
    }

    return Response.json({
      success: true,
      new_signups: newUsers.length,
      engaged: engagedCount,
      not_engaged: notEngagedUsers.length,
      total_users: totalUsers,
      referrals: referrals.length,
      week_signups: weekSignups.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});