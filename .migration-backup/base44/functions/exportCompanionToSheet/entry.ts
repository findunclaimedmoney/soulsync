import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const body = await req.json();
    const { companion_id } = body;
    if (!companion_id) return Response.json({ error: 'companion_id is required' }, { status: 400 });

    // Fetch companion config
    const configs = await base44.asServiceRole.entities.CompanionConfig.filter({ companion_id });
    const config = configs[0];
    if (!config) return Response.json({ error: 'Companion not found' }, { status: 404 });

    // Fetch memories and messages
    const memories = await base44.asServiceRole.entities.Memory.filter({ companion_id });
    const messages = await base44.asServiceRole.entities.Message.filter({ companion_id });

    const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');
    if (!conn) return Response.json({ error: 'Google Sheets connector not authorized' }, { status: 500 });

    // Get or create the export spreadsheet
    const sheetConfigs = await base44.asServiceRole.entities.SheetConfig.filter({ purpose: 'companion_export' });
    let sheetConfig = sheetConfigs[0];
    let spreadsheetId;
    let spreadsheetUrl;

    if (!sheetConfig) {
      // Create new spreadsheet with three tabs
      const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: { title: 'GLIMR Companion Data' },
          sheets: [
            { properties: { title: 'Companions' } },
            { properties: { title: 'Memories' } },
            { properties: { title: 'Messages' } },
          ],
        }),
      });
      const sheetData = await createResp.json();
      if (sheetData.error) return Response.json({ error: sheetData.error.message }, { status: 400 });

      spreadsheetId = sheetData.spreadsheetId;
      spreadsheetUrl = sheetData.spreadsheetUrl;

      // Add headers
      await appendRow(conn.accessToken, spreadsheetId, 'Companions', [
        'Companion ID', 'Name', 'Tagline', 'Subtitle', 'Bio', 'Image URL', 'Video URL',
        'Voice ID', 'Voice Name', 'Avatar ID', 'Avatar Status', 'Stripe Price ID', 'Status', 'Created Date'
      ]);
      await appendRow(conn.accessToken, spreadsheetId, 'Memories', [
        'Companion ID', 'Key', 'Value', 'Type', 'Created Date'
      ]);
      await appendRow(conn.accessToken, spreadsheetId, 'Messages', [
        'Companion ID', 'Role', 'Content', 'Image URL', 'Created Date'
      ]);

      sheetConfig = await base44.asServiceRole.entities.SheetConfig.create({
        spreadsheet_id: spreadsheetId,
        sheet_name: 'Companions',
        purpose: 'companion_export',
      });
    } else {
      spreadsheetId = sheetConfig.spreadsheet_id;
    }

    // Append companion profile row
    await appendRow(conn.accessToken, spreadsheetId, 'Companions', [
      config.companion_id || '',
      config.name || '',
      config.tagline || '',
      config.subtitle || '',
      config.bio || '',
      config.image_url || '',
      config.video_url || '',
      config.voice_id || '',
      config.voice_name || '',
      config.avatar_id || '',
      config.avatar_status || '',
      config.stripe_price_id || '',
      config.status || '',
      config.created_date || '',
    ]);

    // Append memories
    for (const m of memories) {
      await appendRow(conn.accessToken, spreadsheetId, 'Memories', [
        m.companion_id || config.companion_id,
        m.key || '',
        m.value || '',
        m.type || '',
        m.created_date || '',
      ]);
    }

    // Append messages (last 200, content truncated to 500 chars)
    const recentMessages = messages.slice(-200);
    for (const msg of recentMessages) {
      await appendRow(conn.accessToken, spreadsheetId, 'Messages', [
        msg.companion_id || config.companion_id,
        msg.role || '',
        (msg.content || '').substring(0, 500),
        msg.image_url || '',
        msg.created_date || '',
      ]);
    }

    // Fetch spreadsheet URL if not already known
    if (!spreadsheetUrl) {
      const metaResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${conn.accessToken}` },
      });
      const metaData = await metaResp.json();
      spreadsheetUrl = metaData.spreadsheetUrl;
    }

    return Response.json({
      success: true,
      spreadsheet_url: spreadsheetUrl,
      companion: config.name,
      memories_count: memories.length,
      messages_count: recentMessages.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function appendRow(accessToken, spreadsheetId, sheetName, values) {
  const range = `${sheetName}!A1`;
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}