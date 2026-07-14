import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'generate_post': {
        const { topic, platform = 'facebook', tone = 'warm' } = body;
        const platformGuides = {
          facebook: 'Facebook: longer-form, story-driven, community-building. 2-4 sentences. Warm, human tone. End with a question or CTA. NO emojis.',
          instagram: 'Instagram: visual-first, scroll-stopping hook in first line. 1-3 sentences. Trending hashtags. NO emojis — plain text only.',
          tiktok: 'TikTok: POV-style, short punchy hook. Casual, trendy language. Maximum 2 sentences + hashtags. NO emojis.',
        };
        const prompt = `You are GLIMR's marketing director. Create a social media post about: "${topic}"\n\nPlatform: ${platform}\nTone: ${tone}\n${platformGuides[platform] || platformGuides.facebook}\n\nGLIMR is a companionship platform addressing loneliness through AI companions that remember you. Free tier available — text chat, no card needed.\n\nSTRICT RULES:\n- NO emojis anywhere in the caption, hashtags, or CTA. Plain text only.\n- NO cartoons, illustrations, or animated characters. Companions are REAL people.\n- Only use existing companion photos and videos — never AI-generated images.\n- Keep it high-quality and authentic.\n\nReturn JSON with: caption (string), hashtags (string, space-separated with #), cta (string, the call-to-action line).\nDo NOT include quotes around the values.`;
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              caption: { type: 'string' },
              hashtags: { type: 'string' },
              cta: { type: 'string' },
            },
          },
        });
        return Response.json(result);
      }

      case 'create_video': {
        const { description } = body;
        const video = await base44.asServiceRole.integrations.Core.GenerateVideo({
          prompt: description,
          duration: 6,
          aspect_ratio: '9:16',
        });
        return Response.json({ video_url: video.url, message: 'Video created successfully' });
      }

      case 'list_pages': {
        const conn = await base44.asServiceRole.connectors.getConnection('facebook_pages');
        const resp = await fetch('https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token', {
          headers: { Authorization: `Bearer ${conn.accessToken}` },
        });
        const data = await resp.json();
        return Response.json({ pages: data.data || [] });
      }

      case 'publish_facebook': {
        const { message, page_id, image_url, video_url } = body;
        const conn = await base44.asServiceRole.connectors.getConnection('facebook_pages');

        let targetPageId = page_id;
        let pageToken = null;

        if (!targetPageId) {
          const pagesResp = await fetch('https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token', {
            headers: { Authorization: `Bearer ${conn.accessToken}` },
          });
          const pagesData = await pagesResp.json();
          if (!pagesData.data || pagesData.data.length === 0) {
            return Response.json({ error: 'No Facebook Pages found. Make sure your account manages a Page.' }, { status: 400 });
          }
          const firstPage = pagesData.data[0];
          targetPageId = firstPage.id;
          pageToken = firstPage.access_token;
        } else {
          const pagesResp = await fetch('https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token', {
            headers: { Authorization: `Bearer ${conn.accessToken}` },
          });
          const pagesData = await pagesResp.json();
          const page = (pagesData.data || []).find(p => p.id === targetPageId);
          pageToken = page?.access_token;
        }

        if (!pageToken) {
          return Response.json({ error: 'Could not get Page access token' }, { status: 400 });
        }

        let postResp;
        if (video_url) {
          postResp = await fetch(`https://graph.facebook.com/v25.0/${targetPageId}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_url: video_url, description: message, access_token: pageToken }),
          });
        } else if (image_url) {
          postResp = await fetch(`https://graph.facebook.com/v25.0/${targetPageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: image_url, message, access_token: pageToken }),
          });
        } else {
          postResp = await fetch(`https://graph.facebook.com/v25.0/${targetPageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, access_token: pageToken }),
          });
        }

        const result = await postResp.json();
        if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
        return Response.json({ success: true, post_id: result.id || result.post_id, message: 'Posted to Facebook successfully' });
      }

      case 'publish_instagram': {
        const { caption, image_url, video_url } = body;
        if (!image_url && !video_url) return Response.json({ error: 'Instagram requires an image_url or video_url' }, { status: 400 });

        const conn = await base44.asServiceRole.connectors.getConnection('instagram');
        const userResp = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${conn.accessToken}`);
        const userData = await userResp.json();

        if (userData.error) return Response.json({ error: userData.error.message }, { status: 400 });

        const igUserId = userData.id;

        // Step 1: Create media container (REELS for video, IMAGE for photo)
        const containerBody = video_url
          ? { media_type: 'REELS', video_url, caption, access_token: conn.accessToken }
          : { image_url, caption, access_token: conn.accessToken };
        const createResp = await fetch(`https://graph.instagram.com/v25.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerBody),
        });
        const createData = await createResp.json();
        if (createData.error) return Response.json({ error: createData.error.message }, { status: 400 });

        // Step 2: Wait for media container to finish processing (video takes longer)
        const maxPolls = video_url ? 20 : 10;
        let mediaReady = false;
        for (let i = 0; i < maxPolls; i++) {
          await new Promise(r => setTimeout(r, 3000));
          const statusResp = await fetch(`https://graph.instagram.com/v25.0/${createData.id}?fields=status&access_token=${conn.accessToken}`);
          const statusData = await statusResp.json();
          if (statusData.status === 'FINISHED') { mediaReady = true; break; }
          if (statusData.status === 'ERROR') return Response.json({ error: 'Instagram media processing failed' }, { status: 400 });
        }
        if (!mediaReady) return Response.json({ error: 'Instagram media processing timed out — try again' }, { status: 400 });

        // Step 3: Publish
        const publishResp = await fetch(`https://graph.instagram.com/v25.0/${igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: createData.id, access_token: conn.accessToken }),
        });
        const publishData = await publishResp.json();
        if (publishData.error) return Response.json({ error: publishData.error.message }, { status: 400 });

        return Response.json({ success: true, media_id: publishData.id, message: 'Posted to Instagram successfully' });
      }

      case 'publish_all': {
        const { message, image_url, video_url } = body;
        const results = { facebook: null, instagram: null };

        // Facebook + Instagram in parallel
        const fbPromise = (async () => {
          try {
            const conn = await base44.asServiceRole.connectors.getConnection('facebook_pages');
            const pagesResp = await fetch('https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token', {
              headers: { Authorization: `Bearer ${conn.accessToken}` },
            });
            const pagesData = await pagesResp.json();
            if (!pagesData.data || pagesData.data.length === 0) {
              return { error: 'No Facebook Pages found' };
            }
            const page = pagesData.data[0];
            let postResp;
            if (video_url) {
              postResp = await fetch(`https://graph.facebook.com/v25.0/${page.id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_url: video_url, description: message, access_token: page.access_token }),
              });
            } else if (image_url) {
              postResp = await fetch(`https://graph.facebook.com/v25.0/${page.id}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: image_url, message, access_token: page.access_token }),
              });
            } else {
              postResp = await fetch(`https://graph.facebook.com/v25.0/${page.id}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, access_token: page.access_token }),
              });
            }
            const result = await postResp.json();
            if (result.error) return { error: result.error.message };
            return { success: true, post_id: result.id || result.post_id };
          } catch (err) {
            return { error: err.message };
          }
        })();

        const igPromise = (async () => {
          try {
            if (!image_url && !video_url) return { error: 'Instagram requires an image_url or video_url' };
            const conn = await base44.asServiceRole.connectors.getConnection('instagram');
            const userResp = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${conn.accessToken}`);
            const userData = await userResp.json();
            if (userData.error) return { error: userData.error.message };

            const igContainer = video_url
              ? { media_type: 'REELS', video_url, caption: message, access_token: conn.accessToken }
              : { image_url, caption: message, access_token: conn.accessToken };
            const createResp = await fetch(`https://graph.instagram.com/v25.0/${userData.id}/media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(igContainer),
            });
            const createData = await createResp.json();
            if (createData.error) return { error: createData.error.message };

            const maxPolls = video_url ? 20 : 10;
            let mediaReady = false;
            for (let i = 0; i < maxPolls; i++) {
              await new Promise(r => setTimeout(r, 3000));
              const statusResp = await fetch(`https://graph.instagram.com/v25.0/${createData.id}?fields=status&access_token=${conn.accessToken}`);
              const statusData = await statusResp.json();
              if (statusData.status === 'FINISHED') { mediaReady = true; break; }
              if (statusData.status === 'ERROR') return { error: 'Instagram media processing failed' };
            }
            if (!mediaReady) return { error: 'Instagram media processing timed out' };

            const publishResp = await fetch(`https://graph.instagram.com/v25.0/${userData.id}/media_publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ creation_id: createData.id, access_token: conn.accessToken }),
            });
            const publishData = await publishResp.json();
            if (publishData.error) return { error: publishData.error.message };
            return { success: true, media_id: publishData.id };
          } catch (err) {
            return { error: err.message };
          }
        })();

        const [fbResult, igResult] = await Promise.all([fbPromise, igPromise]);
        results.facebook = fbResult;
        results.instagram = igResult;

        const allSuccess = fbResult.success && igResult.success;
        return Response.json({
          success: allSuccess,
          results,
          message: allSuccess
            ? 'Published to Facebook & Instagram successfully'
            : `Facebook: ${fbResult.success ? '✓' : '✗ ' + (fbResult.error || '')} | Instagram: ${igResult.success ? '✓' : '✗ ' + (igResult.error || '')}`,
        });
      }

      case 'get_ads': {
        const { account_id } = body;
        const conn = await base44.asServiceRole.connectors.getConnection('meta_ads');

        let actId = account_id;
        if (!actId) {
          const accountsResp = await fetch('https://graph.facebook.com/v25.0/me/adaccounts?fields=account_id,name', {
            headers: { Authorization: `Bearer ${conn.accessToken}` },
          });
          const accountsData = await accountsResp.json();
          if (!accountsData.data || accountsData.data.length === 0) {
            return Response.json({ error: 'No ad accounts found' }, { status: 400 });
          }
          actId = accountsData.data[0].account_id;
        }

        const insightsResp = await fetch(`https://graph.facebook.com/v25.0/act_${actId}/insights?fields=campaign_name,spend,clicks,impressions,reach,actions&level=campaign&date_preset=last_30d`, {
          headers: { Authorization: `Bearer ${conn.accessToken}` },
        });
        const insightsData = await insightsResp.json();
        if (insightsData.error) return Response.json({ error: insightsData.error.message }, { status: 400 });

        return Response.json({
          account_id: actId,
          campaigns: insightsData.data || [],
          message: `Found ${(insightsData.data || []).length} campaigns in the last 30 days`,
        });
      }

      case 'create_ad': {
        const { budget_usd = 11, duration_days = 7, ad_text, image_url } = body;
        // BOSS RULE: Only existing companion images allowed — NO AI-generated images
        if (!image_url) {
          return Response.json({ error: 'image_url is required. Only use existing companion photos — no AI-generated images allowed.' }, { status: 400 });
        }
        // Meta Ads minimum for AU lifetime budget is ~A$10.22 — enforce minimum
        const minBudget = 1100;
        const budgetCents = Math.max(Math.round(budget_usd * 100), minBudget);
        const conn = await base44.asServiceRole.connectors.getConnection('meta_ads');

        // Get ad account
        const accountsResp = await fetch(
          'https://graph.facebook.com/v25.0/me/adaccounts?fields=account_id,name,currency',
          { headers: { Authorization: `Bearer ${conn.accessToken}` } }
        );
        const accountsData = await accountsResp.json();
        if (!accountsData.data || accountsData.data.length === 0) {
          return Response.json({ error: 'No ad accounts found' }, { status: 400 });
        }
        const actId = accountsData.data[0].account_id;

        // Use the provided companion image — do NOT generate AI images
        const adImageUrl = image_url;

        // Get Facebook page for ad creative
        const fbConn = await base44.asServiceRole.connectors.getConnection('facebook_pages');
        const pagesResp = await fetch(
          'https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token',
          { headers: { Authorization: `Bearer ${fbConn.accessToken}` } }
        );
        const pagesData = await pagesResp.json();
        const page = pagesData.data?.[0];

        if (!page) {
          return Response.json({ error: 'No Facebook Page found — needed for ad creative' }, { status: 400 });
        }

        // Step 1: Create campaign
        const campaignResp = await fetch(`https://graph.facebook.com/v25.0/act_${actId}/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `GLIMR Ad — ${new Date().toISOString().split('T')[0]}`,
            objective: 'OUTCOME_TRAFFIC',
            status: 'PAUSED',
            special_ad_categories: JSON.stringify([]),
            is_adset_budget_sharing_enabled: false,
            access_token: conn.accessToken,
          }),
        });
        const campaignData = await campaignResp.json();
        if (campaignData.error) return Response.json({ error: `Campaign: ${campaignData.error.message}`, fb_error: campaignData.error }, { status: 400 });

        // Step 2: Create ad set with lifetime budget
        const startTime = new Date();
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + duration_days);

        const adSetResp = await fetch(`https://graph.facebook.com/v25.0/act_${actId}/adsets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `GLIMR Ad Set — $${budget_usd} / ${duration_days}d`,
            campaign_id: campaignData.id,
            lifetime_budget: budgetCents,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS',
            start_time: Math.floor(startTime.getTime() / 1000),
            end_time: Math.floor(endTime.getTime() / 1000),
            promoted_object: { page_id: page.id },
            targeting: { geo_locations: { countries: ['AU'] }, age_min: 18, age_max: 65 },
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            status: 'PAUSED',
            access_token: conn.accessToken,
          }),
        });
        const adSetData = await adSetResp.json();
        if (adSetData.error) return Response.json({ error: `Ad Set: ${adSetData.error.message}`, fb_error: adSetData.error }, { status: 400 });

        // Step 3: Create ad creative
        const creativeResp = await fetch(`https://graph.facebook.com/v25.0/act_${actId}/adcreatives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'GLIMR Ad Creative',
            object_story_spec: {
              page_id: page.id,
              link_data: {
                link: 'https://glimr.com.au',
                message: ad_text || 'Find your companion. Someone who listens, remembers, and truly cares. Start free today.',
                picture: adImageUrl,
              },
            },
            access_token: conn.accessToken,
          }),
        });
        const creativeData = await creativeResp.json();
        if (creativeData.error) return Response.json({ error: `Creative: ${creativeData.error.message}`, fb_error: creativeData.error }, { status: 400 });

        // Step 4: Create ad
        const adResp = await fetch(`https://graph.facebook.com/v25.0/act_${actId}/ads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'GLIMR Ad',
            adset_id: adSetData.id,
            creative: { creative_id: creativeData.id },
            status: 'PAUSED',
            access_token: conn.accessToken,
          }),
        });
        const adData = await adResp.json();
        if (adData.error) return Response.json({ error: `Ad: ${adData.error.message}`, fb_error: adData.error }, { status: 400 });

        return Response.json({
          success: true,
          campaign_id: campaignData.id,
          adset_id: adSetData.id,
          ad_id: adData.id,
          image_url: adImageUrl,
          budget: `$${budget_usd}`,
          duration: `${duration_days} days`,
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          status: 'PAUSED',
          message: `Ad created: $${budget_usd} budget over ${duration_days} days (AU targeting). It's PAUSED — review and activate it in Meta Ads Manager.`,
        });
      }

      case 'schedule_event': {
        const { title, description, start_time, end_time } = body;
        if (!title || !start_time) return Response.json({ error: 'title and start_time are required' }, { status: 400 });
        const conn = await base44.asServiceRole.connectors.getConnection('googlecalendar');
        const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: title,
            description: description || '',
            start: { dateTime: start_time },
            end: { dateTime: end_time || new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString() },
          }),
        });
        const data = await resp.json();
        if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
        return Response.json({ success: true, event_id: data.id, event_link: data.htmlLink, message: `Scheduled "${title}" on your calendar` });
      }

      case 'list_calendar_events': {
        const { max_results = 10 } = body;
        const conn = await base44.asServiceRole.connectors.getConnection('googlecalendar');
        const timeMin = new Date().toISOString();
        const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${max_results}&orderBy=startTime&singleEvents=true&timeMin=${timeMin}`, {
          headers: { Authorization: `Bearer ${conn.accessToken}` },
        });
        const data = await resp.json();
        if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
        return Response.json({ events: data.items || [], message: `Found ${(data.items || []).length} upcoming events` });
      }

      case 'sheets_append': {
        const { spreadsheet_id, sheet_name = 'Sheet1', values } = body;
        if (!spreadsheet_id || !values || !Array.isArray(values)) return Response.json({ error: 'spreadsheet_id and values[] are required' }, { status: 400 });
        const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');
        const range = `${sheet_name}!A1`;
        const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [values] }),
        });
        const data = await resp.json();
        if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
        return Response.json({ success: true, updated_range: data.updates?.updatedRange, message: 'Row added to Google Sheet' });
      }

      case 'sheets_read': {
        const { spreadsheet_id, range = 'Sheet1!A1:Z1000' } = body;
        if (!spreadsheet_id) return Response.json({ error: 'spreadsheet_id is required' }, { status: 400 });
        const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');
        const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}`, {
          headers: { Authorization: `Bearer ${conn.accessToken}` },
        });
        const data = await resp.json();
        if (data.error) return Response.json({ error: data.error.message }, { status: 400 });
        return Response.json({ rows: data.values || [], message: `Read ${(data.values || []).length} rows` });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});