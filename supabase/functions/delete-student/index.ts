/// <reference types="https://deno.land/x/types/index.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const adminEmail = (Deno.env.get("ADMIN_EMAIL") ?? "attendencehub@gmail.com").toLowerCase();

  const authHeader = req.headers.get("Authorization") || "";
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: authData } = await authClient.auth.getUser();
  if (!authData?.user || authData.user.email?.toLowerCase() !== adminEmail) {
    return new Response("Unauthorized", { status: 403, headers: corsHeaders });
  }

  const { studentId, userId } = await req.json();
  if (!studentId && !userId) {
    return new Response("studentId or userId is required", {
      status: 400,
      headers: corsHeaders
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  let resolvedUserId = userId ?? null;

  if (!resolvedUserId && studentId) {
    const { data: student } = await adminClient
      .from("students")
      .select("user_id")
      .eq("id", studentId)
      .maybeSingle();
    resolvedUserId = student?.user_id ?? null;
  }

  if (studentId) {
    const { error } = await adminClient.from("students").delete().eq("id", studentId);
    if (error) {
      return new Response(error.message, { status: 400, headers: corsHeaders });
    }
  }

  if (resolvedUserId) {
    const { error } = await adminClient.auth.admin.deleteUser(resolvedUserId);
    if (error) {
      return new Response(error.message, { status: 400, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
