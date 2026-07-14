import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LA_API = 'https://api.liveavatar.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const apiKey = Deno.env.get('LIVEAVATAR_API_KEY');
    if (!apiKey) return Response.json({ error: 'LiveAvatar API key not configured' }, { status: 500 });

    const headers = {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    };

    const body = await req.json();
    const { action, companion_name, image_url } = body;

    // --- List existing avatars (user + public) ---
    if (action === 'list') {
      const [userRes, publicRes] = await Promise.all([
        fetch(`${LA_API}/v1/avatars`, { headers }),
        fetch(`${LA_API}/v1/avatars/public`, { headers }),
      ]);
      const [userData, publicData] = await Promise.all([userRes.json(), publicRes.json()]);
      const userList = userData.data?.results || userData.data || [];
      const publicList = publicData.data?.results || publicData.data || [];
      return Response.json({
        user_avatars: userList.map(a => ({ id: a.avatar_id || a.id, name: a.name, status: a.status })),
        public_avatars: publicList.map(a => ({ id: a.avatar_id || a.id, name: a.name, status: a.status })),
      });
    }

    // --- Create avatar from image ---
    if (action === 'create') {
      if (!companion_name || !image_url) {
        return Response.json({ error: 'companion_name and image_url are required' }, { status: 400 });
      }

      const createRes = await fetch(`${LA_API}/v1/avatars`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: companion_name,
          image_url,
        }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        return Response.json({ error: createData.message || createData.error || 'Avatar creation failed', details: createData }, { status: createRes.status });
      }

      const avatarId = createData.data?.avatar_id || createData.data?.id;
      return Response.json({
        avatar_id: avatarId,
        status: createData.data?.status || 'processing',
        message: avatarId ? 'Avatar created successfully' : 'Avatar creation submitted',
      });
    }

    return Response.json({ error: 'Unknown action. Use "list" or "create".' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});