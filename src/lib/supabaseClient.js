import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const envSiteUrl = import.meta.env.VITE_SITE_URL?.trim() || "";
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
export const siteUrl = browserOrigin || envSiteUrl;

const missingConfigMessage =
  "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(missingConfigMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const createEphemeralSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
