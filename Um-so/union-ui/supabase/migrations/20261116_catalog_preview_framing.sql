create table if not exists public.catalog_preview_framing (
 resource_id text primary key check (length(resource_id) between 1 and 200),
 settings jsonb not null check (jsonb_typeof(settings) = 'object' and octet_length(settings::text) <= 2048),
 updated_at timestamptz not null default now()
);
alter table public.catalog_preview_framing enable row level security;
revoke all on public.catalog_preview_framing from public, anon, authenticated;
grant select on public.catalog_preview_framing to authenticated;
drop policy if exists catalog_preview_framing_read on public.catalog_preview_framing;
create policy catalog_preview_framing_read on public.catalog_preview_framing
 for select to authenticated using (true);

create or replace function public.save_catalog_preview_framing(p_resource_id text, p_settings jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not nitido_community.is_moderator() then
  raise insufficient_privilege using message='Only catalog moderators can edit framing';
 end if;
 insert into public.catalog_preview_framing(resource_id, settings)
 values (p_resource_id, p_settings)
 on conflict (resource_id) do update set settings=excluded.settings, updated_at=now();
end;
$$;
revoke all on function public.save_catalog_preview_framing(text,jsonb) from public, anon, authenticated;
grant execute on function public.save_catalog_preview_framing(text,jsonb) to authenticated;
