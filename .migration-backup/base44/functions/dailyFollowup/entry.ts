import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 26 * 60 * 60 * 1000); // 26 hours ago
    const twoDaysAgo = new Date(now.getTime() - 50 * 60 * 60 * 1000); // 50 hours ago

    // Get users who signed up 26-50 hours ago (gives them a day to engage, then follows up)
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 200);
    const needsFollowup = allUsers.filter((u) => {
      const d = new Date(u.created_date);
      return d <= dayAgo && d >= twoDaysAgo;
    });

    let emailed = 0;
    let skipped = 0;

    for (const u of needsFollowup) {
      // Check if they've sent any messages
      const messages = await base44.asServiceRole.entities.Message.filter({ created_by_id: u.id });
      if (messages.length > 0) {
        skipped++;
        continue;
      }

      // Send a personalized follow-up email via the existing function logic
      try {
        await base44.functions.invoke('sendUserFollowupEmail', {
          user_email: u.email,
          goal: `They signed up about a day ago but haven't started chatting yet. Reach out warmly — mention they can start chatting with Mia, Jess, Luna, Sophie, Natalie, or Zac for free right now, no credit card needed. Keep it short, warm, and inviting — like a friend gently nudging them to try something wonderful.`,
        });
        emailed++;
      } catch (err) {
        console.error(`Follow-up email failed for ${u.email}:`, err);
      }
    }

    return Response.json({
      success: true,
      checked: needsFollowup.length,
      emailed,
      skipped_already_engaged: skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});