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
  const { data: authData, error: authError } = await authClient.auth.getUser();

  if (authError || !authData?.user || authData.user.email?.toLowerCase() !== adminEmail) {
    return new Response("Unauthorized", { status: 403, headers: corsHeaders });
  }

  const body = await req.json();
  const {
    email,
    name,
    class: className,
    register_number,
    phone_number,
    date_of_birth,
    gender
  } = body;

  if (!email || !name || !className || !register_number || !phone_number || !date_of_birth || !gender) {
    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: inserted, error: insertError } = await adminClient
    .from("students")
    .insert({
      user_id: null,
      email: email.toLowerCase().trim(),
      name,
      class: className,
      register_number,
      phone_number,
      date_of_birth,
      gender
    })
    .select("id")
    .single();

  if (insertError) {
    return new Response(insertError.message, { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    studentId: inserted?.id ?? null,
    message: "Student profile created. Student must sign in with Google using this email."
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
