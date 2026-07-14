import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { email, role } = await req.json().catch(() => ({}));
    if (!email) return Response.json({ error: 'email is required' }, { status: 400 });

    const result = await base44.users.inviteUser(email, role || 'user');
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});