-- MAX NEXUS — Core database schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

-- 1. PROFILES
-- One row per user, created automatically when someone signs up.
-- "role" controls admin access. "plan" controls paid-tool access.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'support', 'editor', 'admin', 'super_admin')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile (not role/plan)"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "Anyone can read enabled categories"
  on public.categories for select
  using (enabled = true);

-- 3. TOOLS
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  icon text,
  keywords text[] default '{}',
  status text not null default 'active' check (status in ('active', 'disabled', 'coming_soon')),
  is_popular boolean not null default false,
  is_new boolean not null default false,
  is_offline boolean not null default false,
  is_paid boolean not null default false,
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tools enable row level security;
create policy "Anyone can read active or coming-soon tools"
  on public.tools for select
  using (status in ('active', 'coming_soon'));

-- 4. ADMIN WRITE ACCESS
-- Only admins/super_admins may write to tools & categories.
create policy "Admins can manage categories"
  on public.categories for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin'))
  );

create policy "Admins and editors can manage tools"
  on public.tools for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'super_admin', 'editor'))
  );

-- 5. PROMOTE YOUR OWN ACCOUNT TO ADMIN
-- After you sign up once through /admin/login (Supabase will reject login until
-- the account exists — use "Sign up" in the Supabase Auth dashboard, or the
-- app's login form once it also supports first-run sign-up), run this with
-- YOUR email to make yourself an admin:
--
-- update public.profiles set role = 'super_admin' where email = 'ind23234589@gmail.com';
