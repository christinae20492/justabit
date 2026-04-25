-- ============================================================
-- Migration 002 — profiles: add email column + wire username
-- Run in: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Add email column (no-op if already present)
alter table public.profiles
  add column if not exists email text unique;

-- 2. Back-fill email from auth.users for any existing rows
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id;

-- 3. Update the auto-create trigger so it now stores both email
--    and username (passed as signup metadata) on every new signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$;
