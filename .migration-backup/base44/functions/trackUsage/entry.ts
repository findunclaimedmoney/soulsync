import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { minutes } = await req.json();
    if (!minutes || minutes <= 0) return Response.json({ error: 'Invalid minutes' }, { status: 400 });

    const subs = await base44.entities.Subscription.filter({ created_by_id: user.id });

    if (subs.length === 0) {
      return Response.json({
        used: 0,
        limit: 0,
        remaining: 0,
        exceeded: true,
        message: 'No subscription — upgrade to unlock video'
      });
    }

    const sub = subs[0];
    const newUsed = (sub.video_minutes_used || 0) + minutes;
    const limit = sub.video_minutes_limit || 0;
    const exceeded = newUsed >= limit;

    await base44.entities.Subscription.update(sub.id, { video_minutes_used: newUsed });

    return Response.json({
      used: newUsed,
      limit,
      remaining: Math.max(0, limit - newUsed),
      exceeded
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});