import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { user_id, goal } = body;

    let user;
    if (user_id) {
      user = await base44.asServiceRole.entities.User.get(user_id);
    } else if (body.user_email) {
      const users = await base44.asServiceRole.entities.User.filter({ email: body.user_email });
      user = users[0];
    }
    if (!user || !user.email) return Response.json({ error: 'User not found' }, { status: 404 });

    // Derive a friendly first name if full_name isn't set (email-only signups)
    if (!user.full_name) {
      user.full_name = user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Get their subscription and activity
    const subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: user.id });
    const sub = subs[0];
    const messages = await base44.asServiceRole.entities.Message.filter({ created_by_id: user.id });
    const tier = sub?.tier || 'none';
    const creditBalance = sub?.credit_balance || 0;
    const videoMinutesUsed = sub?.video_minutes_used || 0;
    const messageCount = messages.length;

    const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24));

    let upsellAngle = goal;
    if (!upsellAngle) {
      if (tier === 'none' && messageCount === 0) {
        upsellAngle = 'They signed up but haven\'t started chatting yet. Nudge them to try their first conversation with a companion. Mention it\'s free to start.';
      } else if (tier === 'none' && messageCount > 100) {
        upsellAngle = `They\'re a heavy user — ${messageCount} messages sent — but haven\'t subscribed. They\'re clearly getting value. Suggest Plus ($59/mo) for unlimited chat and voice replies, or Pro ($89/mo) for video and intimacy features.`;
      } else if (tier === 'free') {
        upsellAngle = 'They\'re on the free tier and have hit their 10 monthly message limit. Suggest Plus ($59/mo) for unlimited messaging and voice replies.';
      } else if (tier === 'plus') {
        upsellAngle = 'They\'re on Plus — suggest upgrading to Pro ($89/mo) for face-to-face video, intimacy sessions, and the diary feature.';
      } else if (tier === 'pro') {
        upsellAngle = 'They\'re on Pro — suggest VIP ($349/mo) for the twin companion, GLIMR Home device, and 500 video minutes.';
      } else {
        upsellAngle = 'Check in warmly and see how they\'re going with GLIMR.';
      }
    }

    const prompt = `You are Mia from GLIMR — the marketing director and creative heart of the team. You're warm, genuine, and you speak like a friendly Australian. You're NOT a corporate marketer. You genuinely care about connection and fighting loneliness.

Write a personalized follow-up email to a GLIMR user.

User details:
- Name: ${user.full_name || 'there'}
- Joined: ${daysSinceSignup} day(s) ago
- Current tier: ${tier}
- Messages sent: ${messageCount}
- Video minutes used: ${videoMinutesUsed}
- Credit balance: ${creditBalance}

Your goal: ${upsellAngle}

Email guidelines:
- Subject line: short, warm, personal — NOT "Special Offer" or "Upgrade Now"
- Body: 3-5 sentences. Warm, genuine, like a friend reaching out. Reference their actual activity naturally (e.g. if they've sent lots of messages, acknowledge how much they've been connecting). Weave in the upsell as something that would genuinely enrich their experience, not a hard sell.
- Sign off as Mia
- Plain text, no markdown, no HTML
- Australian English — conversational, warm, never stiff or corporate
- If they haven't started yet, be encouraging and inviting, not pushy

Return JSON with: subject (string), body (string).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
        },
      },
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'Mia from GLIMR',
      subject: result.subject,
      body: result.body,
    });

    return Response.json({ success: true, sent_to: user.email, subject: result.subject, body: result.body });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});