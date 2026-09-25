-- MAX NEXUS — Phase 6 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql and seed.sql have already been run.

-- 1. GUIDES
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  cover_image_url text,
  category text,
  author text default 'MAX Nexus Team',
  reading_time int default 3,
  keywords text[] default '{}',
  seo_title text,
  seo_description text,
  related_tool_slugs text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.guides enable row level security;

create policy "Anyone can read published guides"
  on public.guides for select
  using (status = 'published');

create policy "Admins and editors can manage guides"
  on public.guides for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));

-- 2. FAQS
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'General',
  related_tool_slugs text[] default '{}',
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "Anyone can read published FAQs"
  on public.faqs for select
  using (status = 'published');

create policy "Admins and editors can manage FAQs"
  on public.faqs for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));

-- 3. ANNOUNCEMENTS
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  type text not null default 'notice' check (type in ('new', 'fix', 'notice')),
  link_tool_slug text,
  priority int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled')),
  publish_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Anyone can read live announcements"
  on public.announcements for select
  using (status = 'published' and (publish_at is null or publish_at <= now()));

create policy "Admins and editors can manage announcements"
  on public.announcements for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));

-- 4. ACTIVITY LOG
-- Immutable audit trail. Only admins can read it. Nothing in the API layer
-- (anon or authenticated role) is allowed to write to it directly — entries
-- are inserted exclusively by server-side code using the service_role key,
-- so a compromised or misconfigured client can never forge or erase a log
-- entry. See src/lib/supabase/admin.ts and src/lib/activityLog.ts.
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  entity_type text not null,
  entity_name text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "Admins can read activity log"
  on public.activity_log for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

-- Deliberately no insert/update/delete policy for anon or authenticated —
-- only the service_role key (used server-side only) can write here.

-- 5. LOGIN RATE LIMITING
-- Deliberately has RLS enabled with ZERO policies for anon/authenticated,
-- so it is completely inaccessible via the public API in every direction —
-- only server-side code using the service_role key can read or write it.
-- This is what makes brute-forcing /admin/login expensive: failed attempts
-- are tracked here and checked before Supabase Auth is even called.
create table if not exists public.login_attempts (
  email text primary key,
  attempt_count int not null default 0,
  locked_until timestamptz,
  last_attempt timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- No policies added intentionally.

-- 6. MEDIA LIBRARY METADATA
-- The actual files live in Supabase Storage (see README for the one-time
-- bucket setup); this table just indexes them for the admin UI.
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,
  public_url text not null,
  file_type text,
  file_size int,
  uploaded_by_email text,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

create policy "Anyone can read media index"
  on public.media for select
  using (true);

create policy "Admins and editors can manage media"
  on public.media for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));

-- 7. STORAGE BUCKET POLICIES
-- Run this section only AFTER creating a bucket named "media" via
-- Supabase Dashboard -> Storage -> New bucket (make it Public).
create policy "Public can view media files"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admins and editors can upload media files"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor'))
  );

create policy "Admins and editors can delete media files"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor'))
  );
