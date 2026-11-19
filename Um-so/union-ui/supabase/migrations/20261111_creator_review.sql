create schema if not exists nitido_community;
revoke all on schema nitido_community from public,anon,authenticated;

create table nitido_community.profiles (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 public_id uuid not null unique default gen_random_uuid()
);
create table nitido_community.versions (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references nitido_community.profiles(owner_id) on delete cascade,
 draft_id uuid not null, version integer not null,
 snapshot jsonb not null, display_name text not null, bio text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected','archived','withdrawn')),
 reason text not null default '', reviewed_at timestamptz,
 reviewer uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 unique(owner_id,draft_id,version)
);
create unique index one_live_version on nitido_community.versions(owner_id,draft_id) where status='approved';
create table nitido_community.reports (
 version_id uuid references nitido_community.versions on delete cascade,
 reporter uuid references auth.users(id) on delete cascade,
 reason text not null, created_at timestamptz not null default now(),
 primary key(version_id,reporter)
);
create index community_status_time on nitido_community.versions(status,created_at desc);

create function public.creator_command(action text, input jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 actor uuid := auth.uid();
 moderator boolean := coalesce(auth.jwt()->'app_metadata'->>'nitido_moderator','false')='true';
 space jsonb; draft jsonb; target nitido_community.versions%rowtype; next_version integer;
begin
 if actor is null then raise exception 'Entre na sua conta.'; end if;
 if action='submit' then
   perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
   select data into space from public.creator_workspaces where user_id=actor;
   select d into draft from jsonb_array_elements(space->'drafts') d where d->>'id'=input->>'draft';
   if draft is null or length(trim(coalesce(draft->>'name',''))) not between 1 and 100
     or length(trim(coalesce(draft->>'source',''))) not between 1 and 64000
     or length(trim(coalesce(draft->>'license',''))) not between 1 and 1000
     or length(trim(coalesce(space->'profile'->>'displayName',''))) not between 1 and 80
     or coalesce(draft->>'rightsConfirmed','false')<>'true' or coalesce(input->>'consent','false')<>'true'
     then raise exception 'Salve nome de exibição, componente, fonte e licença. Confirme autoria e publicação.'; end if;
   select * into target from nitido_community.versions where owner_id=actor and draft_id=(draft->>'id')::uuid order by version desc limit 1;
   if target.status='pending' and target.snapshot=draft then return jsonb_build_object('id',target.id,'version',target.version); end if;
   next_version:=coalesce(target.version,0)+1;
   if (select count(*) from nitido_community.versions where owner_id=actor and status='pending')>=20 then raise exception 'Limite de 20 envios em revisão.'; end if;
   insert into nitido_community.profiles(owner_id) values(actor) on conflict do nothing;
   insert into nitido_community.versions(owner_id,draft_id,version,snapshot,display_name,bio)
    values(actor,(draft->>'id')::uuid,next_version,draft,space->'profile'->>'displayName',left(coalesce(space->'profile'->>'bio',''),500)) returning * into target;
   return jsonb_build_object('id',target.id,'version',target.version);
 elsif action='list' then
   return jsonb_build_object('moderator',moderator,'rows',coalesce((select jsonb_agg(to_jsonb(v)) from
    (select id,version,status,reason,created_at,reviewed_at,snapshot->>'name' as name from nitido_community.versions
     where owner_id=actor or (moderator and status in ('pending','approved')) order by created_at desc limit 100 offset least(greatest(0,coalesce((input->>'offset')::int,0)),100000)) v),'[]'::jsonb));
 elsif action in ('source','review','report','withdraw') then
   select * into target from nitido_community.versions where id=(input->>'id')::uuid for update;
   if not found then raise exception 'Versão indisponível.'; end if;
   if action='source' and (actor=target.owner_id or moderator or target.status='approved') then return target.snapshot; end if;
   if action='report' and target.status='approved' and length(trim(input->>'reason')) between 5 and 1000 then
     insert into nitido_community.reports values(target.id,actor,input->>'reason',now()) on conflict(version_id,reporter) do update set reason=excluded.reason;
     return '{"ok":true}';
   end if;
   if action='withdraw' and (moderator or actor=target.owner_id) then
     update nitido_community.versions set status='withdrawn',reason=left(coalesce(input->>'reason',''),1000) where id=target.id;
     return '{"ok":true}';
   end if;
   if action='review' and moderator and actor<>target.owner_id and target.status='pending' then
     if input->>'decision'='approved' and input->'tested'='true'::jsonb and input->'licensed'='true'::jsonb then
       perform pg_advisory_xact_lock(hashtextextended(target.owner_id::text,0));
       update nitido_community.versions set status='archived' where owner_id=target.owner_id and draft_id=target.draft_id and status='approved';
     elsif input->>'decision' is distinct from 'rejected' or length(trim(coalesce(input->>'reason','')))<5 then raise exception 'Registre o teste, a licença ou o motivo da rejeição.'; end if;
     update nitido_community.versions set status=input->>'decision',reviewer=actor,reviewed_at=now(),reason=left(coalesce(input->>'reason',''),1000) where id=target.id;
     return '{"ok":true}';
   end if;
 elsif action='export' then
   return jsonb_build_object('publicProfileId',(select public_id from nitido_community.profiles where owner_id=actor),
    'versions',coalesce((select jsonb_agg(to_jsonb(v)-'owner_id'-'reviewer') from nitido_community.versions v where v.owner_id=actor),'[]'::jsonb),
    'reports',coalesce((select jsonb_agg(to_jsonb(r)-'reporter') from nitido_community.reports r where r.reporter=actor),'[]'::jsonb));
 elsif action='reports' and moderator then
   return coalesce((select jsonb_agg(to_jsonb(v)) from (select r.version_id,r.reason,r.created_at,v.snapshot->>'name' as name from nitido_community.reports r join nitido_community.versions v on r.version_id=v.id where v.status='approved' order by r.created_at desc limit 100) v),'[]'::jsonb);
 end if;
 raise exception 'Operação não permitida.';
end $$;
revoke all on function public.creator_command(text,jsonb) from public,anon;
grant execute on function public.creator_command(text,jsonb) to authenticated;

create function public.creator_gallery(creator uuid default null, page_offset integer default 0) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(page)),'[]'::jsonb) from
 (select p.public_id as creator,v.id,v.version,v.display_name,v.bio,v.snapshot->>'name' as name,
  left(v.snapshot->>'description',2000) as description,v.reviewed_at from nitido_community.versions v
  join nitido_community.profiles p on p.owner_id=v.owner_id where v.status='approved' and (creator is null or p.public_id=creator)
  order by v.reviewed_at desc,v.id limit 30 offset least(greatest(page_offset,0),100000)) page
$$;
revoke all on function public.creator_gallery(uuid,integer) from public;
grant execute on function public.creator_gallery(uuid,integer) to anon,authenticated;
