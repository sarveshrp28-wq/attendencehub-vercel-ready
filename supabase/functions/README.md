# Supabase Edge Functions

Deploy these functions with the Supabase CLI for full admin account automation.
The frontend includes a fallback mode when these are not deployed, but cleanup is limited.

Functions included:
- `create-student`: Creates a pre-approved student profile row (Google login required later).
- `delete-student`: Deletes the student row and linked auth user (if already claimed).
- `send-password-reset`: Disabled endpoint kept for compatibility (Google-only auth).

Required secrets (set in Supabase dashboard or CLI):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` (default: attendencehub@gmail.com)

Example CLI:
```
supabase functions deploy create-student
supabase functions deploy delete-student
supabase functions deploy send-password-reset
```
