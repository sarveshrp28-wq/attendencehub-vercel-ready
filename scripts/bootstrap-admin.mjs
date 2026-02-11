import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const data = fs.readFileSync(filePath, "utf8");
  return data
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separator = line.indexOf("=");
      if (separator === -1) return acc;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
};

const env = { ...parseEnvFile(envPath), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const siteUrl = env.VITE_SITE_URL;
const adminEmail = (env.VITE_ADMIN_EMAIL || "attendencehub@gmail.com").toLowerCase();

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

if (!supabaseUrl || !supabaseAnonKey) {
  fail("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
} else if (!siteUrl) {
  fail("Missing VITE_SITE_URL in .env");
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  fail("VITE_ADMIN_EMAIL is not a valid email address");
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: siteUrl,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    fail(`Google OAuth bootstrap check failed: ${error.message}`);
  } else {
    console.log("Google-only auth bootstrap is configured.");
    console.log(`Admin email (must match schema + edge functions): ${adminEmail}`);
    console.log("Open this URL in a browser and sign in with the admin Gmail:");
    console.log(data?.url || "(No URL returned)");
    console.log("");
    console.log(
      "After admin login, create students from Admin > Students > Add Student using their Gmail."
    );
  }
}
