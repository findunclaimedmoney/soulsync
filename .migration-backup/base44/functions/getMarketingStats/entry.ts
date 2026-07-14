import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const visits = await base44.asServiceRole.entities.PageVisit.filter({}, '-created_date', 1000);
    const campaigns = await base44.asServiceRole.entities.MarketingCampaign.filter({}, '-created_date', 200);

    // Totals
    const totalVisits = visits.length;
    const uniqueVisitors = new Set(visits.map(v => v.visitor_key).filter(Boolean)).size || totalVisits;
    const convertedVisits = visits.filter(v => v.converted).length;
    const conversionRate = totalVisits > 0 ? parseFloat(((convertedVisits / totalVisits) * 100).toFixed(1)) : 0;

    // By companion
    const companionMap = {};
    for (const v of visits) {
      const key = v.companion_id || 'unknown';
      if (!companionMap[key]) companionMap[key] = { companion_id: key, visits: 0, signups: 0, converted: 0 };
      companionMap[key].visits++;
      if (v.converted) companionMap[key].signups++;
    }
    const byCompanion = Object.values(companionMap).map((c: any) => ({
      ...c,
      conversion_rate: c.visits > 0 ? parseFloat(((c.signups / c.visits) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.visits - a.visits);

    const topCompanion = byCompanion[0]?.companion_id || '—';

    // By source
    const sourceMap = {};
    for (const v of visits) {
      const key = v.source || 'direct';
      if (!sourceMap[key]) sourceMap[key] = { source: key, visits: 0, signups: 0 };
      sourceMap[key].visits++;
      if (v.converted) sourceMap[key].signups++;
    }
    const bySource = Object.values(sourceMap).map((s: any) => ({
      ...s,
      conversion_rate: s.visits > 0 ? parseFloat(((s.signups / s.visits) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.visits - a.visits);

    // By campaign (utm_campaign field)
    const campaignMap = {};
    for (const v of visits) {
      const key = v.utm_campaign || v.ref_code || 'organic';
      if (!campaignMap[key]) campaignMap[key] = { campaign: key, visits: 0, signups: 0 };
      campaignMap[key].visits++;
      if (v.converted) campaignMap[key].signups++;
    }
    const byCampaign = Object.values(campaignMap).map((c: any) => ({
      ...c,
      conversion_rate: c.visits > 0 ? parseFloat(((c.signups / c.visits) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.visits - a.visits);

    // Published campaigns with their video URLs
    const publishedCampaigns = campaigns
      .filter(c => c.status === 'published' || c.status === 'approved')
      .map(c => ({
        id: c.id,
        companion_name: c.companion_name,
        topic: c.topic,
        video_url: c.video_url,
        image_url: c.image_url,
        platform: c.platform,
        status: c.status,
        created_date: c.created_date,
      }));

    // Growth: last 14 days
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const growth = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now - i * dayMs);
      const dateStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayVisits = visits.filter(v => v.created_date && new Date(v.created_date).toISOString().slice(0, 10) === dateStr);
      growth.push({
        date: dayLabel,
        visits: dayVisits.length,
        signups: dayVisits.filter(v => v.converted).length,
      });
    }

    return Response.json({
      totals: {
        total_visits: totalVisits,
        unique_visitors: uniqueVisitors,
        total_signups: convertedVisits,
        conversion_rate: conversionRate,
        total_campaigns: publishedCampaigns.length,
        top_companion: topCompanion,
      },
      by_companion: byCompanion,
      by_source: bySource,
      by_campaign: byCampaign,
      published_campaigns: publishedCampaigns,
      growth,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});