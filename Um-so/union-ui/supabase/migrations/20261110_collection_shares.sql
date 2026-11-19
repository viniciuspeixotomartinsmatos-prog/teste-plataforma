create table if not exists public.collection_shares (
 user_id uuid not null references auth.users(id) on delete cascade,
 collection_id text not null check(length(collection_id) between 1 and 100),
 token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 primary key(user_id,collection_id)
);
alter table public.collection_shares enable row level security;
revoke all on public.collection_shares from anon,authenticated;
grant select,insert,update,delete on public.collection_shares to authenticated;
create policy own_collection_shares on public.collection_shares for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- A capability lookup returns only the selected collection. No owner fields,
-- workspace saved list, other collections, credentials or editable handle.
create or replace function public.read_shared_collection(lookup_hash text)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('name',left(c->>'name',80),'description',left(coalesce(c->>'description',''),1000),'items',coalesce(c->'items','[]'::jsonb))
 from public.collection_shares s join public.workspaces w on w.user_id=s.user_id
 cross join lateral jsonb_array_elements(w.data->'collections') c
 where lookup_hash ~ '^[a-f0-9]{64}$' and s.token_hash=lookup_hash and c->>'id'=s.collection_id limit 1
$$;
revoke all on function public.read_shared_collection(text) from public;
grant execute on function public.read_shared_collection(text) to anon,authenticated;
-- Removing a collection permanently revokes its capability, even if an old
-- workspace snapshot later restores a collection with the same identifier.
create or replace function public.revoke_removed_collection_shares()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then
  delete from public.collection_shares where user_id=OLD.user_id;
 else
  delete from public.collection_shares s where s.user_id=NEW.user_id
   and not exists(select 1 from jsonb_array_elements(NEW.data->'collections') c where c->>'id'=s.collection_id);
 end if;
 return null;
end $$;
revoke all on function public.revoke_removed_collection_shares() from public;
create trigger revoke_removed_collection_shares after update of data or delete on public.workspaces
 for each row execute function public.revoke_removed_collection_shares();
