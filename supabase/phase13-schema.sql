-- MAX NEXUS — Phase 13 schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql, seed.sql, phase6/7/9/10/11-schema.sql.

-- 1. GENERAL-PURPOSE RATE LIMITING
-- Same locked-down pattern as login_attempts (Phase 6): zero public RLS
-- policies, so only the service_role client (src/lib/supabase/admin.ts)
-- can read or write it — the public API can never see or reset its own
-- attempt count. "action" namespaces this for multiple surfaces (feedback
-- submissions, account signup, account login) sharing one table instead of
-- one bespoke table per form.
create table if not exists public.rate_limits (
  key text not null,
  action text not null,
  attempt_count int not null default 0,
  locked_until timestamptz,
  last_attempt timestamptz not null default now(),
  primary key (key, action)
);

alter table public.rate_limits enable row level security;
-- No policies added intentionally.

-- 2. DOCUMENT PACK PROGRESS
-- For logged-in users only — lets someone leave a Document Pack partway
-- through and come back to the same checklist state. Stores which slots
-- were filled and their filenames, NOT the file bytes themselves (files
-- still need to be re-uploaded when resuming — see the in-app note on
-- this tool for why, and the README for the honest scope of what this
-- does and doesn't persist).
create table if not exists public.document_pack_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  template_slug text not null,
  slot_data jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (user_id, template_slug)
);

alter table public.document_pack_progress enable row level security;

create policy "Users manage their own document pack progress"
  on public.document_pack_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
