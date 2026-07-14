import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMPANIONS = [
  { name: 'Jess', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/72ed256b7_image-3.png', video: 'https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/280b8c8d4_Jesss_Engaging_Greeting.mp4' },
  { name: 'Mia', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/19ce39eea_Womaninsilkrobe.png', video: 'https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/567d746da_avatar-shot-20260705-a2b9f09f.mp4' },
  { name: 'Luna', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1a1420690_image-1782886782778.png', video: null },
  { name: 'Sophie', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/ba7d734da_ElegantHallwayPose.png', video: null },
  { name: 'Zac', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/45da0b4c5_zac.png', video: 'https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/25306ac77_ElevenLabs_video_google-veo-3-1-fast_amansittingo_2026-07-07T16_31_52.mp4' },
  { name: 'Blake', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/45da0b4c5_zac.png', video: 'https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/b2a1c98c0_307f5321d_Zac_Shower_Clip.mp4' },
  { name: 'Natalie', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/1ee4619f5_image.png', video: null },
  { name: 'Jessica', image: 'https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/22caf2b40_photo_2026-07-03_17-00-35.jpg', video: 'https://media.base44.com/videos/public/6a4ad4122d2c58f83324b2ce/18ff6aace_Jessica_Hero_Video.mp4' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    let stats = null;
    try {
      const statsResp = await base44.asServiceRole.functions.invoke('getDashboardStats', {});
      stats = statsResp.data;
    } catch (e) {
      console.log('Stats fetch failed:', e.message);
    }

    const statsContext = stats
      ? `\nPlatform stats: ${stats.total_users || 'growing'} users, ${stats.active_subscriptions || 'active'} subscriptions.`
      : '';

    const topicResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are GLIMR's marketing director. GLIMR is an Australian AI companionship platform fighting loneliness. Companions: Jess, Mia, Luna, Sophie, Natalie, Zac, Jessica. Free tier — text chat, no card. Paid: Plus ($59/mo), Pro ($89/mo), VIP ($349/mo). Sign up at glimr.com.au/jess-offer — first 10 signups get a FREE 15-minute live video session with Jess (15 credits, no card needed).${statsContext}

Generate 3 DIFFERENT campaign ideas for BOTH Facebook and Instagram. Each campaign must feature ONE specific companion by name. Write the companion_name field with the exact companion name.

Campaign angles to vary: emotional story about loneliness, feature highlight (voice/video chat), social proof style, question-based engagement, seasonal/relatable moment.

ALL content MUST be in English and relevant to GLIMR (companionship, loneliness, being heard, being remembered).

CRITICAL RULES:
- NO emojis in any caption or CTA. Plain text only.
- NO cartoons, illustrations, or animated characters. The companions are REAL people.
- Only use existing companion photos and videos — never suggest AI-generated images.
- Keep it high-quality and authentic.

Return JSON: campaigns array, each with "topic" (short English label), "companion_name" (one of: Jess, Mia, Luna, Sophie, Zac, Blake, Natalie, Jessica), "caption_angle" (2-3 sentence description of what the caption should say), "platform" (one of: "facebook", "instagram", "both").`,
      response_json_schema: {
        type: 'object',
        properties: {
          campaigns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                topic: { type: 'string' },
                companion_name: { type: 'string' },
                caption_angle: { type: 'string' },
                platform: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const campaigns = topicResult.campaigns || [];
    if (campaigns.length === 0) {
      return Response.json({ error: 'No campaigns generated' }, { status: 500 });
    }

    const created = [];

    for (const camp of campaigns) {
      const companion = COMPANIONS.find(c => c.name === camp.companion_name) || COMPANIONS[0];

      const captionResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are GLIMR's marketing director. Create a Facebook post caption for this campaign.

Campaign topic: "${camp.topic}"
Companion: ${companion.name}
Angle: ${camp.caption_angle}

Rules:
- Write entirely in English.
- Be warm, human, and specific to ${companion.name}'s personality.
- 2-4 sentences. End with a question or CTA.
- GLIMR is an Australian platform — use Australian tone, not American.
- The companion ${companion.name} is real (not a cartoon or AI-generated). The post should feel authentic.
- NO emojis anywhere in the caption, hashtags, or CTA. Plain text only.
- NO cartoons, illustrations, or animated character references.
- Mention the limited offer: first 10 signups get a FREE 15-minute live video session with Jess — no credit card needed.
- Sign up at glimr.com.au/jess-offer

Return JSON: caption (post text), hashtags (space-separated with #), cta (final CTA line).`,
        response_json_schema: {
          type: 'object',
          properties: {
            caption: { type: 'string' },
            hashtags: { type: 'string' },
            cta: { type: 'string' },
          },
        },
      });

      const platform = camp.platform || 'both';
      const useVideo = companion.video && Math.random() > 0.5;
      const saved = await base44.asServiceRole.entities.MarketingCampaign.create({
        topic: camp.topic,
        companion_name: companion.name,
        image_url: companion.image,
        caption: `${captionResult.caption}\n\n${captionResult.hashtags}\n\n${captionResult.cta}`,
        hashtags: captionResult.hashtags || '',
        cta: captionResult.cta || '',
        video_url: useVideo ? companion.video : null,
        platform: platform,
        status: 'draft',
        batch_date: today,
      });

      created.push({ id: saved.id, topic: camp.topic, companion: companion.name });
    }

    const campaignList = created
      .map((c, i) => `Campaign ${i + 1}: ${c.topic} (featuring ${c.companion})`)
      .join('\n\n');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `3 Campaigns Ready for Approval — ${today}`,
      body: `Hi! Mia here.\n\nI've prepared 3 campaigns for Facebook and Instagram. Each features one of your real companions with their photo or video and a caption. No emojis, no cartoons, no AI-generated images — just real companion content.\n\n${campaignList}\n\nReview and approve them here: https://glimr.com.au/campaign-review\n\nAll campaigns promote the free 15-min video session offer at glimr.com.au/jess-offer.\n\nWarm,\nMia`,
    });

    return Response.json({ success: true, created: created.length, campaigns: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});