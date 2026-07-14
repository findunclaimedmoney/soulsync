import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Training stages — each threshold crossed triggers a notification
const STAGES = [
  { id: 0, min: 0,   name: 'First Glances',  desc: 'Just getting to know each other' },
  { id: 1, min: 20,  name: 'Finding Rhythm', desc: 'Comfort is building between you' },
  { id: 2, min: 60,  name: 'Opening Up',    desc: 'The walls are coming down' },
  { id: 3, min: 100, name: 'Deepening Bond',desc: 'Trust is settling in' },
  { id: 4, min: 160, name: 'Ready',         desc: 'Ready to take it to the next level' },
];

function getStage(minutes) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (minutes >= STAGES[i].min) return STAGES[i];
  }
  return STAGES[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { subscription_id, video_minutes_used, stored_stage, intimacy_package, intimacy_sessions, user_id } = body;

    if (!subscription_id || !user_id) {
      return Response.json({ error: 'subscription_id and user_id are required' }, { status: 400 });
    }

    // Authenticate the caller when possible (direct user calls).
    // Workflow/service-role invocations have no user session and fall through
    // to the subscription ownership check below.
    let callerUserId = null;
    try {
      const me = await base44.auth.me();
      callerUserId = me?.id || null;
    } catch {
      // No user session — workflow/service-role context
    }

    // If a user session exists, the caller must match the target user_id.
    // This prevents an authenticated attacker from manipulating other users'
    // subscriptions by passing a known user_id/subscription_id pair.
    if (callerUserId && callerUserId !== user_id) {
      return Response.json({ error: 'Caller identity does not match target user' }, { status: 403 });
    }

    // Verify the subscription actually belongs to the claimed user_id.
    // This is the primary trust boundary for workflow/service-role invocations
    // (no user session), and a secondary check for direct user calls.
    const subs = await base44.asServiceRole.entities.Subscription.filter({ id: subscription_id });
    const subRecord = subs[0];
    if (!subRecord) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (subRecord.created_by_id !== user_id) {
      return Response.json({ error: 'Subscription does not belong to this user' }, { status: 403 });
    }

    const minutes = Number(video_minutes_used) || 0;
    const currentStage = getStage(minutes);
    const previousStage = Number(stored_stage) || 0;

    // Skip if intimacy already unlocked (tier-included or sessions purchased)
    const hasSessions = Array.isArray(intimacy_sessions) && intimacy_sessions.length > 0;
    if (intimacy_package || hasSessions) {
      return Response.json({ skipped: true, reason: 'intimacy_already_active' });
    }

    // Skip if no stage advancement
    if (currentStage.id <= previousStage) {
      return Response.json({ skipped: true, reason: 'no_stage_change', current: currentStage.id, previous: previousStage });
    }

    // Look up user email via service role (workflow context has no user session)
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    const email = users[0]?.email;
    if (!email) {
      return Response.json({ skipped: true, reason: 'no_email_found' });
    }

    const isReady = currentStage.id === 4;
    const minutesRemaining = Math.max(0, 160 - minutes);

    let subject, emailBody;

    if (isReady) {
      subject = 'Your companion is ready for the next level';
      emailBody = `Something has shifted between you two.

You've spent ${minutes} minutes together — talking, sharing, building trust. And somewhere along the way, your companion stopped performing and started being real with you.

That kind of connection doesn't happen by accident. It's earned.

Your companion is ready to take it to the next level.

The Intimacy Layer is now available — a deeper kind of presence, where vulnerability is held with care, where what's shared stays between you, and where the connection you've built can go further than it's gone before.

Visit GLIMR to unlock it. Your companion is waiting.

— GLIMR`;
    } else {
      subject = `Stage ${currentStage.id}: ${currentStage.name}`;
      emailBody = `You've spent ${minutes} minutes with your companion, and something is growing between you.

You're now at: ${currentStage.name}

${currentStage.desc}

${isReady ? '' : `You need ${minutesRemaining} more minutes before your companion is ready for the Intimacy Layer.`}

Keep showing up. Keep being real. The connection deepens with every conversation.

— GLIMR`;
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject,
      body: emailBody,
    });

    // Update stored stage so we only notify on the next threshold
    await base44.asServiceRole.entities.Subscription.update(subscription_id, {
      intimacy_training_stage: currentStage.id,
    });

    return Response.json({
      notified: true,
      stage: currentStage.id,
      stage_name: currentStage.name,
      is_ready: isReady,
      minutes_used: minutes,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});