import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const amount = body.amount || 10;

    // Find the user's subscription (user-scoped first, then service-role by owner)
    let subs = await base44.entities.Subscription.filter({ created_by_id: user.id });
    if (subs.length === 0) {
      subs = await base44.asServiceRole.entities.Subscription.filter({ owner_user_id: user.id });
    }

    if (subs.length === 0) {
      // Create a free subscription with the voice bonus
      await base44.entities.Subscription.create({
        tier: 'free',
        free_voice_messages: amount,
        free_voice_messages_used: 0,
      });
      return Response.json({ success: true, free_voice_messages: amount, free_voice_messages_used: 0 });
    }

    const sub = subs[0];
    const currentFree = sub.free_voice_messages || 0;
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      free_voice_messages: currentFree + amount,
    });

    return Response.json({
      success: true,
      free_voice_messages: currentFree + amount,
      free_voice_messages_used: sub.free_voice_messages_used || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});