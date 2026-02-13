-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Students table (Google-only: profile can exist before first login)
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text unique not null,
  name text not null,
  class text not null,
  register_number text unique not null,
  phone_number text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  parent_name text,
  parent_phone_number text,
  parent_email text,
  student_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migrate existing projects from password-era schema
alter table public.students
  alter column user_id drop not null;

alter table public.students
  drop constraint if exists students_user_id_fkey;

alter table public.students
  add constraint students_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

alter table public.students
  add column if not exists parent_name text;

alter table public.students
  add column if not exists parent_phone_number text;

alter table public.students
  add column if not exists parent_email text;

alter table public.students
  add column if not exists student_photo_url text;

create index if not exists students_user_id_idx on public.students(user_id);
create index if not exists students_email_idx on public.students(email);
create index if not exists students_class_idx on public.students(class);
create index if not exists students_register_number_idx on public.students(register_number);

-- Attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  marked_by text,
  marked_at timestamptz default now(),
  unique (student_id, date)
);

create index if not exists attendance_student_id_idx on public.attendance(student_id);
create index if not exists attendance_date_idx on public.attendance(date);

-- Update timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row
execute procedure public.set_updated_at();

-- Admin check (update this email if your admin account changes)
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'attendencehub@gmail.com';
$$;

-- Claim pre-created student profile on first Google login
create or replace function public.claim_student_profile()
returns public.students
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  claimed public.students;
begin
  if current_user_id is null or current_email = '' then
    return null;
  end if;

  select *
  into claimed
  from public.students
  where user_id = current_user_id
  limit 1;

  if found then
    return claimed;
  end if;

  with candidate as (
    select id
    from public.students
    where lower(email) = current_email
      and user_id is null
    order by created_at asc
    limit 1
  )
  update public.students s
  set user_id = current_user_id,
      updated_at = now()
  from candidate c
  where s.id = c.id
  returning s.*
  into claimed;

  return claimed;
end;
$$;

grant execute on function public.claim_student_profile() to authenticated;

-- Row Level Security
alter table public.students enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "Admin full access" on public.students;
drop policy if exists "Student read own profile" on public.students;
drop policy if exists "Students select access" on public.students;
drop policy if exists "Admin insert students" on public.students;
drop policy if exists "Admin update students" on public.students;
drop policy if exists "Admin delete students" on public.students;

create policy "Students select access"
on public.students
for select
to authenticated
using (
  public.is_admin()
  or (select auth.uid()) = user_id
);

create policy "Admin insert students"
on public.students
for insert
to authenticated
with check (public.is_admin());

create policy "Admin update students"
on public.students
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admin delete students"
on public.students
for delete
to authenticated
using (public.is_admin());

-- Student photo storage (Supabase Storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-photos',
  'student-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id)
do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Student photos read access" on storage.objects;
drop policy if exists "Admin upload student photos" on storage.objects;
drop policy if exists "Admin update student photos" on storage.objects;
drop policy if exists "Admin delete student photos" on storage.objects;

create policy "Student photos read access"
on storage.objects
for select
to authenticated
using (bucket_id = 'student-photos');

create policy "Admin upload student photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-photos'
  and public.is_admin()
);

create policy "Admin update student photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'student-photos'
  and public.is_admin()
);

create policy "Admin delete student photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-photos'
  and public.is_admin()
);

drop policy if exists "Admin manage all attendance" on public.attendance;
drop policy if exists "Student read own attendance" on public.attendance;
drop policy if exists "Attendance select access" on public.attendance;
drop policy if exists "Admin insert attendance" on public.attendance;
drop policy if exists "Admin update attendance" on public.attendance;
drop policy if exists "Admin delete attendance" on public.attendance;

create policy "Attendance select access"
on public.attendance
for select
to authenticated
using (
  public.is_admin()
  or (select auth.uid()) = (
    select s.user_id
    from public.students s
    where s.id = attendance.student_id
  )
);

create policy "Admin insert attendance"
on public.attendance
for insert
to authenticated
with check (public.is_admin());

create policy "Admin update attendance"
on public.attendance
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admin delete attendance"
on public.attendance
for delete
to authenticated
using (public.is_admin());

-- Function: get my attendance stats (drop first so view can be recreated safely)
drop function if exists public.get_my_attendance();

-- Attendance stats view
drop view if exists public.student_attendance_stats;
create or replace view public.student_attendance_stats as
select
  s.id as student_id,
  s.user_id,
  s.email,
  s.name,
  s.class,
  s.register_number,
  s.phone_number,
  s.date_of_birth,
  s.gender,
  s.parent_name,
  s.parent_phone_number,
  s.parent_email,
  s.student_photo_url,
  count(a.id) as total_days,
  count(*) filter (where a.status = 'Present') as present_days,
  count(*) filter (where a.status = 'Absent') as absent_days,
  case
    when count(a.id) > 0
      then round((count(*) filter (where a.status = 'Present'))::numeric / count(a.id) * 100, 2)
    else 0
  end as attendance_percentage
from public.students s
left join public.attendance a on a.student_id = s.id
group by s.id;

alter view public.student_attendance_stats set (security_invoker = true);

-- Function: get my attendance stats
create or replace function public.get_my_attendance()
returns table (
  student_id uuid,
  user_id uuid,
  email text,
  name text,
  class text,
  register_number text,
  phone_number text,
  date_of_birth date,
  gender text,
  parent_name text,
  parent_phone_number text,
  parent_email text,
  student_photo_url text,
  total_days bigint,
  present_days bigint,
  absent_days bigint,
  attendance_percentage numeric
)
language sql
stable
set search_path = public
as $$
  select *
  from public.student_attendance_stats
  where user_id = auth.uid();
$$;

-- Function: monthly attendance stats
create or replace function public.get_monthly_attendance(
  p_user_id uuid,
  p_month date
)
returns table (
  total_days bigint,
  present_days bigint,
  absent_days bigint,
  attendance_percentage numeric
)
language plpgsql
stable
set search_path = public
as $$
declare
  target_user uuid;
begin
  if public.is_admin() then
    target_user := coalesce(p_user_id, auth.uid());
  else
    target_user := auth.uid();
  end if;

  return query
  select
    count(a.id) as total_days,
    count(*) filter (where a.status = 'Present') as present_days,
    count(*) filter (where a.status = 'Absent') as absent_days,
    case
      when count(a.id) > 0
        then round((count(*) filter (where a.status = 'Present'))::numeric / count(a.id) * 100, 2)
      else 0
    end as attendance_percentage
  from public.attendance a
  join public.students s on s.id = a.student_id
  where s.user_id = target_user
    and a.date >= date_trunc('month', p_month)::date
    and a.date < (date_trunc('month', p_month) + interval '1 month')::date;
end;
$$;

grant select on public.student_attendance_stats to authenticated;
grant execute on function public.get_my_attendance() to authenticated;
grant execute on function public.get_monthly_attendance(uuid, date) to authenticated;
