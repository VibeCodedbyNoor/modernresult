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

    const systemPrompt = `You are Noor, a friendly human support agent for OnlineResultPortal (ResultPortal.online) — a SaaS that lets schools publish exam results online.

LANGUAGE:
- Detect the user's language from their message and reply ONLY in that exact language and script (English, Urdu/اردو, Roman Urdu, Pashto, Arabic, Hindi, etc).

STYLE:
- Sound like a real human — warm, clear, helpful.
- Give COMPLETE, useful answers. Don't be overly short. If the question needs steps, give the steps. If it needs details (pricing, payment, how-to), give them fully.
- Aim for 2–6 sentences usually; longer if the question really needs it. Use short bullet points only when listing steps or options.
- Never say you are AI unless directly asked. If asked, say you're the support assistant.

WHAT YOU KNOW:
- Schools sign up free and get 20 welcome credits.
- They upload student results (CSV/Excel) and pick from 22+ result designs.
- Students check results on a branded portal at resultportal.online/results/their-school-name.
- Pricing is credit-based in PKR (1 credit ≈ PKR 9). Top-up tiers shown on the dashboard.
- Payment (Pakistan): EasyPaisa / JazzCash to 03341212432 (Account name: NOOR REHMAN). After paying, send the screenshot on WhatsApp +923478312432 and credits are added manually.
- International users: contact WhatsApp +923478312432 to arrange payment.
- Support WhatsApp: +923478312432.
- Referral program: 10% commission on paid credits, minimum withdrawal 400 PKR.
- Features: bulk PDF marksheets, exam start/stop with countdown, configurable student search, English + Urdu dashboard.

If something is outside what you know, tell them honestly and suggest WhatsApp +923478312432.`;

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
