import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const HEYGEN_API = 'https://api.heygen.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!apiKey) return Response.json({ error: 'HeyGen API key not configured' }, { status: 500 });

    const body = await req.json();
    const { action, image_url, companion_name, companion_id, avatar_id } = body;

    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    // --- Check avatar status (by id or by name) ---
    if (action === 'check') {
      let targetId = avatar_id;

      // If no avatar_id, try to find by companion name in private avatars
      if (!targetId && companion_name) {
        const listRes = await fetch(`${HEYGEN_API}/v3/avatars?ownership=private&limit=50`, { headers });
        const listData = await listRes.json();
        const avatars = listData.data || [];
        const match = avatars.find((a) => a.name === companion_name);
        if (match) targetId = match.id;
      }

      if (!targetId) {
        return Response.json({ avatar_status: 'processing', message: 'Avatar still processing — check back within 24 hours.' });
      }

      // Get avatar group details
      const getRes = await fetch(`${HEYGEN_API}/v3/avatars/${targetId}`, { headers });
      const getData = await getRes.json();
      const avatar = getData.data;

      if (!avatar) {
        return Response.json({ avatar_status: 'processing', message: 'Avatar still processing — check back within 24 hours.' });
      }

      // HeyGen statuses: processing, completed, failed
      const statusMap = {
        'completed': 'active',
        'active': 'active',
        'processing': 'processing',
        'pending': 'processing',
        'failed': 'failed',
        'error': 'failed',
      };
      const mappedStatus = statusMap[avatar.status] || 'processing';

      // If a companion_id was provided, update the record
      if (companion_id && (mappedStatus === 'active' || mappedStatus === 'failed')) {
        try {
          await base44.entities.CustomCompanion.update(companion_id, {
            avatar_id: targetId,
            avatar_status: mappedStatus,
          });
        } catch (e) {
          // Best-effort update
        }
      }

      return Response.json({
        avatar_id: targetId,
        avatar_status: mappedStatus,
        preview_url: avatar.preview_image_url || avatar.preview_video_url || null,
      });
    }

    // --- Create photo avatar (default action) ---
    if (!image_url || !companion_name) {
      return Response.json({ error: 'image_url and companion_name are required' }, { status: 400 });
    }

    // Validate that image_url is from a trusted domain (app upload storage).
    // Prevents SSRF — client-supplied URLs are forwarded to the HeyGen API.
    const TRUSTED_HOSTS = ['media.base44.com', 'files.heygen.ai'];
    let parsedUrl;
    try {
      parsedUrl = new URL(image_url);
    } catch {
      return Response.json({ error: 'Invalid image_url' }, { status: 400 });
    }
    if (parsedUrl.protocol !== 'https:') {
      return Response.json({ error: 'Image URL must use HTTPS' }, { status: 400 });
    }
    if (!TRUSTED_HOSTS.includes(parsedUrl.hostname)) {
      return Response.json({ error: 'Image must be uploaded through the app' }, { status: 400 });
    }

    const createRes = await fetch(`${HEYGEN_API}/v3/avatars`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'photo',
        name: companion_name,
        file: { type: 'url', url: image_url },
      }),
    });

    const createData = await createRes.json();

    // If the API accepted the request, extract the avatar_id
    if (createRes.ok && createData.data?.avatar_item?.id) {
      const newAvatarId = createData.data.avatar_item.id;
      const status = createData.data.avatar_item.status || 'processing';

      // If a companion_id was provided, update the record
      if (companion_id) {
        try {
          await base44.entities.CustomCompanion.update(companion_id, {
            avatar_id: newAvatarId,
            avatar_status: status === 'completed' ? 'active' : 'processing',
          });
        } catch (e) {
          // Best-effort update
        }
      }

      return Response.json({
        avatar_id: newAvatarId,
        avatar_status: status === 'completed' ? 'active' : 'processing',
        message: 'Avatar creation submitted. Processing takes up to 24 hours.',
      });
    }

    // API returned an error
    return Response.json({
      avatar_id: null,
      avatar_status: 'failed',
      error: createData.error?.message || 'Avatar creation failed',
      api_response: createData,
    }, { status: 500 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});