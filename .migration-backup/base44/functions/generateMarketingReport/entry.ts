import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get admin users to email
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const admins = users.filter((u) => u.role === 'admin');
    if (admins.length === 0) {
      return Response.json({ error: 'No admin users found' }, { status: 400 });
    }

    let facebookData = null;
    let instagramData = null;
    let adsData = null;

    // --- Facebook Page insights ---
    try {
      const fbConn = await base44.asServiceRole.connectors.getConnection('facebook_pages');
      const pagesResp = await fetch(
        'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token',
        { headers: { Authorization: `Bearer ${fbConn.accessToken}` } }
      );
      const pagesData = await pagesResp.json();

      if (pagesData.data && pagesData.data.length > 0) {
        const page = pagesData.data[0];

        const insightsResp = await fetch(
          `https://graph.facebook.com/v25.0/${page.id}/insights?metric=page_impressions,page_post_engagements,page_reach&period=day&date_preset=last_7d&access_token=${page.access_token}`
        );
        const insightsData = await insightsResp.json();

        const postsResp = await fetch(
          `https://graph.facebook.com/v25.0/${page.id}/posts?fields=id,message,created_time,permalink_url,reactions.summary(true),comments.summary(true),shares&limit=10&access_token=${page.access_token}`
        );
        const postsData = await postsResp.json();

        // Aggregate 7-day totals
        let totalImpressions = 0;
        let totalEngagement = 0;
        let totalReach = 0;
        for (const metric of insightsData.data || []) {
          for (const val of metric.values || []) {
            if (metric.name === 'page_impressions') totalImpressions += val.value;
            if (metric.name === 'page_post_engagements') totalEngagement += val.value;
            if (metric.name === 'page_reach') totalReach += val.value;
          }
        }

        facebookData = {
          page_name: page.name,
          impressions_7d: totalImpressions,
          engagement_7d: totalEngagement,
          reach_7d: totalReach,
          recent_posts: (postsData.data || []).map((p) => ({
            message: (p.message || '').substring(0, 120),
            created_time: p.created_time,
            reactions: p.reactions?.summary?.total_count || 0,
            comments: p.comments?.summary?.total_count || 0,
            shares: p.shares?.count || 0,
            link: p.permalink_url,
          })),
        };
      }
    } catch (err) {
      facebookData = { error: err.message };
    }

    // --- Instagram insights ---
    try {
      const igConn = await base44.asServiceRole.connectors.getConnection('instagram');
      const userResp = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${igConn.accessToken}`
      );
      const userData = await userResp.json();
      if (userData.error) throw new Error(userData.error.message);

      const mediaResp = await fetch(
        `https://graph.instagram.com/v25.0/${userData.id}/media?fields=id,caption,like_count,comments_count,media_type,permalink&limit=10&access_token=${igConn.accessToken}`
      );
      const mediaData = await mediaResp.json();

      let totalLikes = 0;
      let totalComments = 0;
      const mediaList = (mediaData.data || []).map((m) => {
        totalLikes += m.like_count || 0;
        totalComments += m.comments_count || 0;
        return {
          caption: (m.caption || '').substring(0, 120),
          likes: m.like_count || 0,
          comments: m.comments_count || 0,
          type: m.media_type,
        };
      });

      instagramData = {
        username: userData.username,
        recent_posts: mediaList.length,
        total_likes: totalLikes,
        total_comments: totalComments,
        media: mediaList,
      };
    } catch (err) {
      instagramData = { error: err.message };
    }

    // --- Meta Ads insights ---
    try {
      const adsConn = await base44.asServiceRole.connectors.getConnection('meta_ads');
      const accountsResp = await fetch(
        'https://graph.facebook.com/v25.0/me/adaccounts?fields=account_id,name,currency',
        { headers: { Authorization: `Bearer ${adsConn.accessToken}` } }
      );
      const accountsData = await accountsResp.json();

      if (accountsData.data && accountsData.data.length > 0) {
        const actId = accountsData.data[0].account_id;
        const insightsResp = await fetch(
          `https://graph.facebook.com/v25.0/act_${actId}/insights?fields=campaign_name,spend,clicks,impressions,reach,actions&level=campaign&date_preset=last_7d`,
          { headers: { Authorization: `Bearer ${adsConn.accessToken}` } }
        );
        const insightsData = await insightsResp.json();

        let totalSpend = 0;
        let totalClicks = 0;
        let totalImpressions = 0;
        let totalReach = 0;
        const campaigns = (insightsData.data || []).map((c) => {
          totalSpend += parseFloat(c.spend || '0');
          totalClicks += parseInt(c.clicks || '0');
          totalImpressions += parseInt(c.impressions || '0');
          totalReach += parseInt(c.reach || '0');
          return {
            name: c.campaign_name,
            spend: c.spend,
            clicks: c.clicks,
            impressions: c.impressions,
            reach: c.reach,
          };
        });

        adsData = {
          account_name: accountsData.data[0].name,
          total_spend_7d: totalSpend.toFixed(2),
          total_clicks_7d: totalClicks,
          total_impressions_7d: totalImpressions,
          total_reach_7d: totalReach,
          cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00',
          campaigns,
        };
      }
    } catch (err) {
      adsData = { error: err.message };
    }

    // --- Generate summary with LLM ---
    const today = new Date().toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const prompt = `You are GLIMR's marketing analyst. Create a clear, actionable weekly marketing report as clean HTML (suitable for email). Do NOT use \`<!DOCTYPE>\` or \`<html>\` tags — just the body content with inline-styled sections.

Structure:
1. <h2>Weekly Marketing Report — GLIMR</h2>
2. Executive summary (2-3 sentences) in a highlighted box
3. Facebook section: impressions, reach, engagement, top posts
4. Instagram section: posts, likes, comments, top content
5. Meta Ads section: spend, clicks, impressions, CPC, campaign breakdown
6. <h3>Recommendations for next week</h3> — 3-5 actionable bullet points

Use <table> for metrics where appropriate. Keep it clean and scannable. Use warm, professional language.

=== DATA ===
Facebook: ${JSON.stringify(facebookData)}
Instagram: ${JSON.stringify(instagramData)}
Meta Ads: ${JSON.stringify(adsData)}
Report date: ${today}`;

    const summary = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const reportHtml =
      typeof summary === 'string'
        ? summary
        : summary?.output || summary?.response || '<p>Report data collection completed but summary generation failed.</p>';

    // --- Send email to all admins ---
    let sent = 0;
    for (const admin of admins) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `GLIMR Weekly Marketing Report — ${today}`,
          body: reportHtml,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to email ${admin.email}:`, err.message);
      }
    }

    return Response.json({
      sent,
      total_admins: admins.length,
      facebook: facebookData?.error ? 'Failed' : 'OK',
      instagram: instagramData?.error ? 'Failed' : 'OK',
      ads: adsData?.error ? 'Failed' : 'OK',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});