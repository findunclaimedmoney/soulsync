import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { visit_id } = body;

    if (!visit_id) {
      return Response.json({ skipped: true, reason: 'no visit_id' });
    }

    // Mark the visit as converted — called after successful signup
    await base44.asServiceRole.entities.PageVisit.update(visit_id, {
      converted: true,
      converted_date: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});