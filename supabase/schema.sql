-- ============================================================
-- justabit — Supabase schema
-- Mirrors the web app's Prisma schema (budget-tracker-v2)
-- Paste into: Dashboard → SQL Editor → New query → Run
-- ============================================================
-- Types match Prisma exactly:
--   Prisma Float  → double precision
--   Prisma String date fields → text  (stored as YYYY-MM-DD strings)
--   NextAuth models (Account/Session/VerificationToken) omitted — Supabase Auth handles auth
-- ============================================================

-- ── Profiles (replaces the Prisma User model) ────────────────
-- auth.users holds email + password via Supabase Auth.
-- App-level user fields live here, keyed to auth.users.id.

create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        unique,          -- mirrors auth.users.email for username→email lookup
  username      text        unique,
  is_admin      boolean     not null default false,
  opt_in_emails boolean     not null default true,
  dark_mode     boolean     not null default false,
  currency      text        not null default 'USD',
  language      text        not null default 'English',
  tier          text        not null default 'Free',
  type          text        not null default '',
  created_at    timestamptz not null default now()
);

-- Auto-create a profile row on signup; username comes from signUp metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Envelopes ────────────────────────────────────────────────

create table public.envelopes (
  id           uuid             primary key default gen_random_uuid(),
  title        text             not null,
  fixed        boolean          not null default false,
  budget       double precision not null,
  icon         text             not null,
  color        text             not null,
  comments     text,
  user_id      uuid             not null references auth.users(id) on delete cascade,
  date_created timestamptz      not null default now(),
  date_updated timestamptz      not null default now()
);

-- ── Expenses ─────────────────────────────────────────────────

create table public.expenses (
  id           uuid             primary key default gen_random_uuid(),
  location     text             not null,
  envelope_id  uuid             not null references public.envelopes(id) on delete restrict,
  user_id      uuid             not null references auth.users(id) on delete cascade,
  date         text             not null,  -- YYYY-MM-DD string, matches Prisma String
  amount       double precision not null,
  comments     text,
  date_created timestamptz      not null default now(),
  date_updated timestamptz      not null default now()
);

-- ── Incomes ──────────────────────────────────────────────────

create table public.incomes (
  id           uuid             primary key default gen_random_uuid(),
  source       text             not null,
  amount       double precision not null,
  date         text             not null,  -- YYYY-MM-DD string, matches Prisma String
  user_id      uuid             not null references auth.users(id) on delete cascade,
  savings      double precision,
  investments  double precision,
  remainder    double precision,
  date_created timestamptz      not null default now(),
  date_updated timestamptz      not null default now()
);

-- ── Notes ────────────────────────────────────────────────────
-- month is 0-11 (mirrors Prisma Int, no year field — matches web app)

create table public.notes (
  id           uuid        primary key default gen_random_uuid(),
  month        integer     not null check (month >= 0 and month <= 11),
  content      text        not null,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  date_created timestamptz not null default now(),
  date_updated timestamptz not null default now()
);

-- ── auto-update date_updated ─────────────────────────────────

create or replace function public.handle_date_updated()
returns trigger language plpgsql as $$
begin
  new.date_updated = now();
  return new;
end;
$$;

create trigger envelopes_date_updated
  before update on public.envelopes
  for each row execute function public.handle_date_updated();

create trigger expenses_date_updated
  before update on public.expenses
  for each row execute function public.handle_date_updated();

create trigger incomes_date_updated
  before update on public.incomes
  for each row execute function public.handle_date_updated();

create trigger notes_date_updated
  before update on public.notes
  for each row execute function public.handle_date_updated();

-- ── Indexes ──────────────────────────────────────────────────

create index envelopes_user_id on public.envelopes(user_id);
create index expenses_user_id  on public.expenses(user_id);
create index expenses_envelope on public.expenses(envelope_id);
create index incomes_user_id   on public.incomes(user_id);
create index notes_user_id     on public.notes(user_id);

-- ── Row Level Security ───────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.envelopes enable row level security;
alter table public.expenses  enable row level security;
alter table public.incomes   enable row level security;
alter table public.notes     enable row level security;

-- profiles: users can read/update their own row; insert is handled by the trigger
create policy "profiles: owner select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- envelopes
create policy "envelopes: owner select" on public.envelopes
  for select using (auth.uid() = user_id);
create policy "envelopes: owner insert" on public.envelopes
  for insert with check (auth.uid() = user_id);
create policy "envelopes: owner update" on public.envelopes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "envelopes: owner delete" on public.envelopes
  for delete using (auth.uid() = user_id);

-- expenses
create policy "expenses: owner select" on public.expenses
  for select using (auth.uid() = user_id);
create policy "expenses: owner insert" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses: owner update" on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses: owner delete" on public.expenses
  for delete using (auth.uid() = user_id);

-- incomes
create policy "incomes: owner select" on public.incomes
  for select using (auth.uid() = user_id);
create policy "incomes: owner insert" on public.incomes
  for insert with check (auth.uid() = user_id);
create policy "incomes: owner update" on public.incomes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "incomes: owner delete" on public.incomes
  for delete using (auth.uid() = user_id);

-- notes
create policy "notes: owner select" on public.notes
  for select using (auth.uid() = user_id);
create policy "notes: owner insert" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "notes: owner update" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: owner delete" on public.notes
  for delete using (auth.uid() = user_id);
