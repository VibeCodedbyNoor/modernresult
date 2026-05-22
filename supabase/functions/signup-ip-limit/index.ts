const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
      || req.headers.get("cf-connecting-ip") || "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action || "check";

    if (action === "check") {
      const { data, error } = await supabase.rpc("check_ip_signup_limit", { p_ip: ip });
      if (error) throw error;
      return new Response(JSON.stringify({ allowed: !!data, ip }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "record") {
      const userId = body.user_id;
      // Re-check before recording
      const { data: allowed } = await supabase.rpc("check_ip_signup_limit", { p_ip: ip });
      if (!allowed) {
        // Delete the user that was just created
        if (userId) {
          await supabase.auth.admin.deleteUser(userId);
        }
        return new Response(JSON.stringify({ allowed: false, ip }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.rpc("record_signup_ip", { p_user_id: userId, p_ip: ip });
      return new Response(JSON.stringify({ allowed: true, ip }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
