-- MAX NEXUS — Phase 10 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql, seed.sql, phase6/7/9-schema.sql.

-- 1. FIX MY FILE PRESETS
-- Admin-manageable from day one, per the product spec — no hardcode-then-
-- migrate step.
create table if not exists public.fix_my_file_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  file_type text not null check (file_type in ('photo', 'pdf')),
  width_px int,
  height_px int,
  formats text[] default '{}',
  max_size_kb int,
  max_pages int,
  page_size text,
  orientation text,
  notes text,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fix_my_file_presets enable row level security;

create policy "Anyone can read published presets"
  on public.fix_my_file_presets for select
  using (status = 'published');

create policy "Admins and editors can manage presets"
  on public.fix_my_file_presets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));

-- 2. DOCUMENT PACK TEMPLATES
create table if not exists public.document_pack_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  required_documents text[] default '{}',
  optional_documents text[] default '{}',
  recommended_formats text,
  recommended_max_size text,
  processing_notes text,
  related_tool_slugs text[] default '{}',
  disclaimer text default 'These are commonly required documents, not verified official requirements. Requirements may vary by organization, state, application type, or authority.',
  seo_title text,
  seo_description text,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.document_pack_templates enable row level security;

create policy "Anyone can read published document pack templates"
  on public.document_pack_templates for select
  using (status = 'published');

create policy "Admins and editors can manage document pack templates"
  on public.document_pack_templates for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor')));
