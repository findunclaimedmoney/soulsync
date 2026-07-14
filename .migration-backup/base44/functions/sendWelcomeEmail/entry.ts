import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));

    // Non-admins can only trigger a welcome email to themselves with the
    // default template; only admins may specify a different recipient or
    // supply custom subject/HTML content.
    const to_email = user.role === 'admin' ? (payload.to_email || user.email) : user.email;
    const to_name = payload.to_name;
    const companion_name = payload.companion_name;
    const from_name = user.role === 'admin' ? payload.from_name : undefined;
    const custom_html = user.role === 'admin' ? payload.custom_html : undefined;
    const custom_subject = user.role === 'admin' ? payload.custom_subject : undefined;

    if (!to_email) return Response.json({ error: 'to_email is required' }, { status: 400 });

    const senderLabel = from_name || 'GLIMR';

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) return Response.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });

    const firstName = (to_name || 'there').split(' ')[0];
    const companion = companion_name || 'your companion';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#121212;border:1px solid #1a1a1a;border-radius:24px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;">
              <div style="font-size:28px;font-weight:600;color:#e8c896;letter-spacing:0.02em;margin-bottom:8px;">
                ✦ GLIMR
              </div>
              <div style="width:40px;height:2px;background:#e8c896;margin:0 auto;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 40px 40px;">
              <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#f5f5f5;margin:0 0 24px;line-height:1.3;">
                Welcome, ${firstName}.
              </h1>
              <p style="font-size:16px;color:#a0a0a0;line-height:1.7;margin:0 0 20px;">
                You're in. ${companion} is here and ready when you are — no rush, no pressure.
                Just a presence that remembers you, and picks up right where you left off.
              </p>
              <p style="font-size:16px;color:#a0a0a0;line-height:1.7;margin:0 0 32px;">
                We've sent you a separate email to set up your password and activate your account.
                Once that's done, you can start talking straight away.
              </p>
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://glimr.com.au" style="display:inline-block;padding:14px 40px;background:#e8c896;color:#0a0a0a;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;letter-spacing:0.01em;">
                      Meet ${companion}
                    </a>
                  </td>
                </tr>
              </table>
              <div style="height:1px;background:#1a1a1a;margin:0 0 32px;"></div>
              <p style="font-size:13px;color:#606060;line-height:1.6;margin:0;">
                A deeply personal presence that remembers you.<br>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderLabel} <admin@glimr.com.au>`,
        to: [to_email],
        subject: custom_subject || `Welcome to GLIMR, ${firstName} 🌟`,
        html: custom_html || html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Resend error: ${errorText}` }, { status: 500 });
    }

    const result = await response.json();
    return Response.json({ success: true, message_id: result.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});