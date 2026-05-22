const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'noorrehmansmi786@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    const { record } = await req.json();

    const ownerName = record?.owner_name || 'Unknown';
    const schoolName = record?.school_name || 'Unknown';
    const whatsapp = record?.whatsapp_number || 'N/A';
    const createdAt = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
      : 'N/A';

    // Send Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `🎉 <b>New Signup on OnlineResultPortal!</b>\n\n👤 <b>Owner:</b> ${ownerName}\n🏫 <b>School:</b> ${schoolName}\n📱 <b>WhatsApp:</b> ${whatsapp}\n🕐 <b>Time:</b> ${createdAt}`;
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' }),
        });
      } catch (e) {
        console.error('Telegram send failed:', e);
      }
    }

    // Send Email via Resend
    if (RESEND_API_KEY) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
            <h2 style="color: #6C3CE0; margin: 0 0 16px;">🎉 New Signup — OnlineResultPortal</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #555;"><b>Owner:</b></td><td style="padding: 8px 0;">${ownerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;"><b>School:</b></td><td style="padding: 8px 0;">${schoolName}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;"><b>WhatsApp:</b></td><td style="padding: 8px 0;">${whatsapp}</td></tr>
              <tr><td style="padding: 8px 0; color: #555;"><b>Time:</b></td><td style="padding: 8px 0;">${createdAt}</td></tr>
            </table>
          </div>`;
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'OnlineResultPortal <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `New signup: ${schoolName} (${ownerName})`,
            html,
          }),
        });
        if (!r.ok) console.error('Resend error:', await r.text());
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
