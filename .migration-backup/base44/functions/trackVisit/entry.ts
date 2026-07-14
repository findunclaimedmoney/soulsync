import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { companion_id, ref_code, utm_campaign, source, visitor_key } = body;

    if (!companion_id) {
      return Response.json({ error: 'companion_id required' }, { status: 400 });
    }

    // Use service role — visitors may be unauthenticated
    const visit = await base44.asServiceRole.entities.PageVisit.create({
      companion_id,
      ref_code: ref_code || null,
      utm_campaign: utm_campaign || null,
      source: source || 'direct',
      visitor_key: visitor_key || null,
      converted: false,
    });

    return Response.json({ visit_id: visit.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});