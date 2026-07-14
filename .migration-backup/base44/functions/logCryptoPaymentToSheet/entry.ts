import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { order_type, reference, usd_amount, crypto_asset, crypto_amount, status, paid_date, created_date, order_id } = body;

    // Get or create the spreadsheet config
    const configs = await base44.asServiceRole.entities.SheetConfig.filter({ purpose: 'crypto_payment_log' });
    let config = configs[0];

    const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // No spreadsheet yet — create one with headers
    if (!config) {
      const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: { title: 'GLIMR Crypto Payments' },
          sheets: [{ properties: { title: 'Crypto Payments' } }],
        }),
      });
      const sheetData = await createResp.json();
      if (sheetData.error) return Response.json({ error: sheetData.error.message }, { status: 400 });

      const spreadsheetId = sheetData.spreadsheetId;
      const sheetUrl = sheetData.spreadsheetUrl;

      // Add headers
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Crypto Payments!A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [['Date', 'Order ID', 'Type', 'Reference', 'USD Amount', 'Crypto Asset', 'Crypto Amount', 'Status', 'Paid Date']] }),
      });

      // Save config
      config = await base44.asServiceRole.entities.SheetConfig.create({
        spreadsheet_id: spreadsheetId,
        sheet_name: 'Crypto Payments',
        purpose: 'crypto_payment_log',
      });

      // Append the payment row
      await appendRow(conn.accessToken, spreadsheetId, 'Crypto Payments', [
        new Date().toISOString(),
        order_id || '',
        order_type || '',
        reference || '',
        usd_amount || 0,
        crypto_asset || '',
        crypto_amount || 0,
        status || 'paid',
        paid_date || new Date().toISOString(),
      ]);

      return Response.json({ success: true, spreadsheet_url: sheetUrl, message: 'Created new spreadsheet and logged payment' });
    }

    // Spreadsheet exists — just append the row
    await appendRow(conn.accessToken, config.spreadsheet_id, config.sheet_name || 'Crypto Payments', [
      new Date().toISOString(),
      order_id || '',
      order_type || '',
      reference || '',
      usd_amount || 0,
      crypto_asset || '',
      crypto_amount || 0,
      status || 'paid',
      paid_date || new Date().toISOString(),
    ]);

    return Response.json({ success: true, message: 'Payment logged to Google Sheet' });
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