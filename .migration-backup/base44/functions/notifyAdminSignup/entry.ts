import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_email, user_name } = body;

    // Find admin users to notify
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) return Response.json({ error: 'No admin users found' }, { status: 404 });

    let newUsers;
    let totalUsers;

    if (user_email) {
      // Direct notification for a specific user — look up their actual profile
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
      totalUsers = allUsers.length;
      const matchedUser = allUsers.find((u) => u.email === user_email);
      newUsers = [{ email: user_email, full_name: matchedUser?.full_name || user_name || user_email.split('@')[0] }];
    } else {
      // Check for users created in the last 30 minutes
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
      totalUsers = allUsers.length;
      newUsers = allUsers.filter((u) => new Date(u.created_date) > cutoff);
    }

    if (newUsers.length === 0) {
      return Response.json({ success: true, message: 'No new signups since last check', notified: false });
    }

    const userList = newUsers.map((u) => `  • ${u.full_name || 'Unknown'} (${u.email})`).join('\n');

    const subject = newUsers.length === 1
      ? `New signup: ${newUsers[0].full_name || newUsers[0].email}`
      : `${newUsers.length} new signups!`;

    const emailBody = `Hi,

${newUsers.length === 1 ? 'A new user just signed up to GLIMR:' : `${newUsers.length} new users just signed up to GLIMR:`}

${userList}

Time: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' })} (Perth time)
Total users now: ${totalUsers}

— GLIMR`;

    for (const admin of admins) {
      if (admin.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          from_name: 'GLIMR Signups',
          subject,
          body: emailBody,
        });
      }
    }

    return Response.json({ success: true, notified: true, new_users: newUsers.length, total_users: totalUsers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});