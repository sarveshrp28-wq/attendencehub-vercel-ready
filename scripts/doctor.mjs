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

const envFile = parseEnvFile(envPath);
const env = { ...envFile, ...process.env };

const results = [];
const record = (level, label, message) => {
  results.push({ level, label, message });
};

const printResult = ({ level, label, message }) => {
  const marker = level === "ok" ? "[OK]" : level === "warn" ? "[WARN]" : "[FAIL]";
  console.log(`${marker} ${label}: ${message}`);
};

const requiredKeys = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SITE_URL",
  "VITE_ADMIN_EMAIL"
];
for (const key of requiredKeys) {
  if (!env[key]) {
    record("fail", key, "Missing from .env");
  } else {
    record("ok", key, "Configured");
  }
}

if (results.some((item) => item.level === "fail")) {
  results.forEach(printResult);
  console.log("");
  console.log("Doctor finished with failures. Fix config and run again.");
  process.exit(1);
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const dbChecks = [
  {
    label: "table public.students",
    run: () => supabase.from("students").select("id").limit(1)
  },
  {
    label: "table public.attendance",
    run: () => supabase.from("attendance").select("id").limit(1)
  },
  {
    label: "view public.student_attendance_stats",
    run: () => supabase.from("student_attendance_stats").select("student_id").limit(1)
  },
  {
    label: "rpc public.get_my_attendance",
    run: () => supabase.rpc("get_my_attendance")
  },
  {
    label: "rpc public.get_monthly_attendance",
    run: () =>
      supabase.rpc("get_monthly_attendance", {
        p_user_id: null,
        p_month: new Date().toISOString().slice(0, 10)
      })
  },
  {
    label: "rpc public.claim_student_profile",
    run: () => supabase.rpc("claim_student_profile")
  }
];

const isExpectedAuthGuardError = (message = "") =>
  /(jwt|permission denied|not authenticated|auth|rls|row-level security)/i.test(
    message
  );

const isMissingFunctionError = (message = "") =>
  /(does not exist|could not find the function)/i.test(message);

for (const check of dbChecks) {
  const { error } = await check.run();
  if (error) {
    if (isExpectedAuthGuardError(error.message)) {
      record("ok", check.label, "Reachable (requires authenticated user)");
    } else if (isMissingFunctionError(error.message)) {
      record("fail", check.label, error.message);
    } else {
      record("fail", check.label, error.message);
    }
  } else {
    record("ok", check.label, "Reachable");
  }
}

const edgeFunctions = ["create-student", "delete-student", "send-password-reset"];
for (const fn of edgeFunctions) {
  const { error } = await supabase.functions.invoke(fn, { body: {} });

  if (!error) {
    record("ok", `edge function ${fn}`, "Deployed");
    continue;
  }

  const status = Number(error?.context?.status || 0);
  if (status === 404) {
    record(
      "warn",
      `edge function ${fn}`,
      "Not deployed (app will use fallback mode)"
    );
    continue;
  }

  if (status >= 400) {
    record("ok", `edge function ${fn}`, `Responded with status ${status}`);
    continue;
  }

  record("warn", `edge function ${fn}`, error.message || "Unknown function error");
}

const adminEmail = (env.VITE_ADMIN_EMAIL || "attendencehub@gmail.com").toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  record("fail", "VITE_ADMIN_EMAIL", "Must be a valid email address");
} else {
  record("ok", "VITE_ADMIN_EMAIL", `Configured admin: ${adminEmail}`);
}

const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: env.VITE_SITE_URL,
    skipBrowserRedirect: true
  }
});

if (oauthError) {
  record("fail", "google oauth", oauthError.message);
} else if (!oauthData?.url) {
  record("warn", "google oauth", "No redirect URL returned");
} else {
  record("ok", "google oauth", "OAuth redirect URL generated");
}

results.forEach(printResult);

const failed = results.some((item) => item.level === "fail");
console.log("");
if (failed) {
  console.log("Doctor finished with failures.");
  process.exit(1);
}

console.log("Doctor finished successfully.");
