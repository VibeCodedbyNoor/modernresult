import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram secrets not configured');
    }

    const { record } = await req.json();

    const ownerName = record?.owner_name || 'Unknown';
    const schoolName = record?.school_name || 'Unknown';
    const whatsapp = record?.whatsapp_number || 'N/A';
    const createdAt = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
      : 'N/A';

    const message = `🎉 <b>New Signup on OnlineResultPortal!</b>\n\n👤 <b>Owner:</b> ${ownerName}\n🏫 <b>School:</b> ${schoolName}\n📱 <b>WhatsApp:</b> ${whatsapp}\n🕐 <b>Time:</b> ${createdAt}`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      return new Response(JSON.stringify({ error: data }), {
        status: 502,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
