create table if not exists public.creator_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision integer not null check(revision>0),
 data jsonb not null default '{"profile":{},"drafts":[]}',
 updated_at timestamptz not null default now()
);
alter table public.creator_workspaces enable row level security;
revoke all on public.creator_workspaces from anon,authenticated;
grant select,insert,update,delete on public.creator_workspaces to authenticated;
create policy own_creator_workspace on public.creator_workspaces for all to authenticated
 using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
