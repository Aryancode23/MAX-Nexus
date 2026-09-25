-- MAX NEXUS — Phase 7 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql, seed.sql, and phase6-schema.sql have already been run.

-- TOOL USAGE ANALYTICS
-- One row per tool, an aggregate counter rather than one row per view —
-- keeps the table small and avoids ever storing anything about who viewed
-- what. No RLS policies are granted to anon/authenticated, so this can only
-- be read or written by server-side code using the service_role key (see
-- src/lib/supabase/admin.ts) — consistent with the activity_log and
-- login_attempts pattern from Phase 6.
create table if not exists public.tool_usage_counts (
  tool_slug text primary key,
  view_count int not null default 0,
  last_viewed timestamptz not null default now()
);

alter table public.tool_usage_counts enable row level security;
-- No policies added intentionally — service_role only.

-- Atomic increment function, so concurrent visits can never race and lose
-- a count the way a read-then-write from application code could.
create or replace function public.increment_tool_usage(p_slug text)
returns void as $$
begin
  insert into public.tool_usage_counts (tool_slug, view_count, last_viewed)
  values (p_slug, 1, now())
  on conflict (tool_slug) do update
    set view_count = public.tool_usage_counts.view_count + 1,
        last_viewed = now();
end;
$$ language plpgsql security definer;
