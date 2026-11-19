-- Apply once in the Supabase SQL editor. No customer data is public.
create table if not exists public.workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision integer not null check (revision > 0),
 data jsonb not null default '{"saved":[],"collections":[]}',
 updated_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;
revoke all on public.workspaces from anon;
grant select, insert, update, delete on public.workspaces to authenticated;
drop policy if exists own_workspace on public.workspaces;
create policy own_workspace on public.workspaces for all to authenticated
 using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
