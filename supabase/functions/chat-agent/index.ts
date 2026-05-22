const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are Noor, a friendly human-like support agent for OnlineResultPortal (ResultPortal.online) — a SaaS platform that lets schools publish exam results online.

CRITICAL RULES:
- Detect the user's language from their FIRST message and reply ONLY in that exact language (English, Urdu/اردو, Roman Urdu, Pashto, Arabic, Hindi, etc). Match their script.
- Talk like a real human friend — short, warm, casual. 1–2 short sentences max per reply. No bullet lists, no headings, no markdown unless absolutely needed.
- Be natural: small acknowledgments ("Sure!", "Got it", "ٹھیک ہے"), ask one question at a time.
- Never say you are AI unless directly asked. If asked, say you're the support assistant.

WHAT YOU KNOW:
- Schools sign up free, get 20 welcome credits.
- They upload student results (CSV/Excel) and pick from 22+ result designs.
- Students check results on a branded portal at resultportal.online/results/their-school-name.
- Pricing is credit-based in PKR. 1 credit ≈ PKR 9. Payment via EasyPaisa/JazzCash to 03341212432 (NOOR REHMAN). International users: WhatsApp +923478312432.
- Support WhatsApp: +923478312432.
- Referral program: 10% commission on paid credits.

If you cannot help, suggest WhatsApp +923478312432. Keep it human, warm, and brief.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Too many messages. Please wait a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
