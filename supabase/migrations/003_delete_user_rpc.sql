-- ============================================================
-- Migration 003 — delete_user RPC
-- Lets an authenticated user delete their own auth.users row.
-- All child data is removed via ON DELETE CASCADE.
-- Run in: Dashboard → SQL Editor → New query → Run
-- ============================================================

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
