# Attendance Hub

Role-based attendance management built with React, Vite, Tailwind, and Supabase.

## Quick Start
1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example` and fill values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_SITE_URL`
   - `VITE_STUDENT_PHOTO_BUCKET` (optional, defaults to `student-photos`)
   - `VITE_PHP_PARENT_ALERT_URL`
   - `VITE_PHP_PARENT_ALERTS_HISTORY_URL`
3. Configure Supabase Auth provider:
   - Enable **Google** provider in Supabase Auth.
   - Add your app URL (example: `http://localhost:5173`) as site URL / redirect target.
4. In Supabase SQL editor, run `supabase/schema.sql`.
5. Bootstrap admin OAuth URL (optional helper):
   - `npm run admin:bootstrap`
6. Run environment diagnostics:
   - `npm run doctor`
7. Start the app:
   - `npm run dev`
8. (Optional) Start PHP API for parent alerts:
   - `npm run php:serve`

## Setup Scripts
- `npm run admin:bootstrap`
  - Verifies Google OAuth bootstrap and prints an OAuth login URL.
  - Sign in using the Gmail set in `VITE_ADMIN_EMAIL`.
- `npm run doctor`
  - Verifies env values, tables/views/RPCs, Google OAuth URL generation, and edge function status.
- `npm run php:serve`
  - Runs the PHP API at `http://localhost:8000` for parent alerts.
  - Endpoints used by React app:
    - `POST /send-parent-alert.php`
    - `GET /get-parent-alerts.php`

## Supabase Setup
- Tables, policies, and functions live in `supabase/schema.sql`.
- Student photos are uploaded via Supabase Storage bucket `student-photos` (or `VITE_STUDENT_PHOTO_BUCKET`).
- If you change admin email, update all 3:
  - `VITE_ADMIN_EMAIL` in `.env`
  - `public.is_admin()` in `supabase/schema.sql`
  - `ADMIN_EMAIL` secret for edge functions
- Edge functions live in `supabase/functions`.
- Edge functions are optional for local run because the app includes a fallback mode.
- To deploy edge functions (recommended), set `SUPABASE_ACCESS_TOKEN` and run:
  - `npm run supabase:deploy:functions`
- Set these secrets in Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_EMAIL` (optional, defaults to `attendencehub@gmail.com`)

## Access Model (Google-only)
- Admin login is allowed only for the configured admin Gmail.
- Student login is allowed only when admin has pre-created a student with that email.
- On first successful Google login, `claim_student_profile()` links auth user to the pre-created student row.
- If a Gmail is not pre-approved in `students.email`, user is redirected to **Unauthorized**.

## Admin Workflow
- Add students via **Admin > Students > Add Student**.
- Enter the student Gmail exactly as they will use for Google sign-in.
- Parent name and parent phone are required.
- Student photo upload supports drag-and-drop or file picker (JPG/PNG/WEBP, max 5 MB).
- You can send parent attendance alerts from Student Profile using PHP APIs.
- Mark attendance daily from **Admin > Mark Attendance**.

## Student Workflows
- Students sign in with Google only (no password screens).
- Access works only if admin has already added that Gmail as a student.
- Dashboard shows attendance percentage, streaks, and alerts.
- Profile is read-only; Account page is informational only.

## Notes
- Make sure RLS is enabled as provided in the schema.
- This project assumes a Supabase project per environment (dev/staging/prod).
- In fallback mode (no edge functions), deleting a student removes only the profile row.
