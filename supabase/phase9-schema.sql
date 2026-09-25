-- MAX NEXUS — Phase 9 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql, seed.sql, phase6-schema.sql, and phase7-schema.sql.

-- 1. SITE SETTINGS
-- Simple key-value store so /admin/settings can actually change what the
-- public site shows (site name, contact info, default SEO) without a
-- code change or redeploy.
create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Anyone can read settings"
  on public.settings for select
  using (true);

create policy "Admins can manage settings"
  on public.settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

insert into public.settings (key, value) values
  ('site_name', 'MAX Nexus'),
  ('contact_phone', '+91 7979758649'),
  ('developer_support_phone', '+91 7052164122'),
  ('instagram_url', 'https://www.instagram.com/shabashji/'),
  ('default_seo_title', 'MAX Nexus — Everyday Digital Work, Made Simple'),
  ('default_seo_description', 'Free online tools for photos, PDFs, documents, signatures, forms and everyday productivity — all in one place.')
on conflict (key) do nothing;

-- 2. ADMIN VISIBILITY INTO PROFILES
-- The original profiles policy (schema.sql) only lets a user see/update
-- their OWN row. /admin/users needs admins to see and manage everyone's
-- role — add that explicitly, scoped to admin/super_admin only.
create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

create policy "Admins can update any profile"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

-- 3. TEMPLATE LIBRARY
-- A catalog of template previews (certificates, ID cards, resumes, etc.)
-- admins can showcase and link to the relevant tool. This is a content
-- catalog, not a runtime data source — the actual template designs inside
-- Resume Builder, ID Card Maker, etc. remain code-defined for now (see the
-- README for what this does and doesn't do).
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text default 'General',
  preview_image_url text,
  target_tool_slug text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

create policy "Anyone can read published templates"
  on public.templates for select
  using (status = 'published');

create policy "Admins and editors can manage templates"
  on public.templates for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));
