-- MAX NEXUS — Phase 11 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql, seed.sql, phase6/7/9/10-schema.sql.

-- 1. FAILED SEARCH TRACKING
-- Logs task-search queries that returned zero results — a direct, evidence-
-- based "what should we add next" list instead of guessing. Same
-- locked-down pattern as tool_usage_counts/login_attempts: no public
-- policies, service_role only.
create table if not exists public.failed_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  created_at timestamptz not null default now()
);

alter table public.failed_searches enable row level security;
-- No policies added intentionally — service_role only.

-- 2. FEEDBACK / SUGGESTIONS
-- Public write-only suggestion box: anyone can submit, only admins can read.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'suggestion' check (type in ('suggestion', 'bug', 'other')),
  message text not null,
  email text,
  page_url text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

create policy "Admins can read and manage feedback"
  on public.feedback for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

create policy "Admins can update feedback status"
  on public.feedback for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

create policy "Admins can delete feedback"
  on public.feedback for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin')));

-- 3. SYNCED FAVORITES / RECENTLY USED (for logged-in visitors)
-- Anonymous visitors keep using localStorage exactly as before — these
-- tables are only used once someone creates a regular account, so
-- Favorites/Recent survive switching devices.
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);

alter table public.user_favorites enable row level security;

create policy "Users manage their own favorites"
  on public.user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_recent (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);

alter table public.user_recent enable row level security;

create policy "Users manage their own recent history"
  on public.user_recent for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
