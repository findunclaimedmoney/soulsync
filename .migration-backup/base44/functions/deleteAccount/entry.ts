import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete all user data across every entity
    await base44.asServiceRole.entities.Message.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.Memory.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.CompanionNote.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.CustomCompanion.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.Subscription.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.SessionLog.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.CryptoOrder.deleteMany({ created_by_id: user.id });

    return Response.json({
      success: true,
      message: 'All account data has been permanently deleted.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});