alter table nitido_community.reports add column if not exists id uuid not null default gen_random_uuid();
create unique index if not exists creator_report_id on nitido_community.reports(id);
alter table nitido_community.reports add column if not exists status text not null default 'open' check(status in ('open','resolved'));
alter table nitido_community.reports add column if not exists resolution text not null default '';
alter table nitido_community.reports add column if not exists resolved_at timestamptz;
alter table nitido_community.reports add column if not exists resolved_by uuid references auth.users on delete set null;

create table if not exists nitido_community.report_decisions (
 id bigint generated always as identity primary key,
 report_id uuid not null references nitido_community.reports(id) on delete cascade,
 actor uuid references auth.users on delete set null,
 resolution text not null, occurred_at timestamptz not null default now()
);
alter table nitido_community.report_decisions add column if not exists report_reason text not null default '';
revoke all on nitido_community.report_decisions from public,anon,authenticated;

drop function if exists public.creator_reports();
create or replace function public.creator_reports(page_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not nitido_community.is_moderator() then raise exception 'Operação não permitida.'; end if;
 return coalesce((select jsonb_agg(to_jsonb(page)) from
  (select r.id,r.version_id,r.reason,r.created_at,v.status,v.snapshot->>'name' as name
   from nitido_community.reports r join nitido_community.versions v on v.id=r.version_id
   where r.status='open' order by r.created_at,r.id limit 100 offset least(greatest(page_offset,0),100000)) page),'[]'::jsonb);
end $$;
revoke all on function public.creator_reports(integer) from public,anon;
grant execute on function public.creator_reports(integer) to authenticated;

drop function if exists public.creator_resolve_report(uuid,text);
create or replace function public.creator_resolve_report(report_id uuid,decision text,expected_at timestamptz) returns jsonb
language plpgsql security definer set search_path='' as $$
declare original_reason text;
begin
 if not nitido_community.is_moderator() or expected_at is null or length(trim(coalesce(decision,''))) not between 5 and 1000 then raise exception 'Registre o motivo da decisão.'; end if;
 update nitido_community.reports set status='resolved',resolution=decision,resolved_at=now(),resolved_by=auth.uid()
 where id=report_id and status='open' and created_at=expected_at returning reason into original_reason;
 if not found then raise exception 'Denúncia indisponível ou já resolvida.'; end if;
 insert into nitido_community.report_decisions(report_id,actor,resolution,report_reason) values(report_id,auth.uid(),decision,original_reason);
 return '{"ok":true}';
end $$;
revoke all on function public.creator_resolve_report(uuid,text,timestamptz) from public,anon;
grant execute on function public.creator_resolve_report(uuid,text,timestamptz) to authenticated;

create or replace function public.creator_browse(creator uuid default null,page_offset integer default 0,query text default '',kind text default '') returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(page)),'[]'::jsonb) from
 (select p.public_id as creator,v.id,v.version,v.display_name,v.bio,v.snapshot->>'name' as name,
  left(v.snapshot->>'description',2000) as description,v.snapshot->>'framework' as framework,v.snapshot->>'category' as category,v.reviewed_at
  from nitido_community.versions v join nitido_community.profiles p on p.owner_id=v.owner_id
  where v.status='approved' and (creator is null or p.public_id=creator)
   and (kind='' or v.snapshot->>'framework'=kind)
   and (query='' or position(lower(left(query,100)) in lower(coalesce(v.snapshot->>'name','')||' '||coalesce(v.snapshot->>'description','')||' '||coalesce(v.snapshot->>'category','')||' '||v.display_name))>0)
  order by v.reviewed_at desc,v.id limit 30 offset least(greatest(page_offset,0),100000)) page
$$;
revoke all on function public.creator_browse(uuid,integer,text,text) from public;
grant execute on function public.creator_browse(uuid,integer,text,text) to anon,authenticated;

create or replace function public.creator_command(action text, input jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 actor uuid := auth.uid();
 moderator boolean := nitido_community.is_moderator();
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
   if action='source' and (actor=target.owner_id or moderator or target.status='approved') then return target.snapshot||jsonb_build_object('nitidoVersion',jsonb_build_object('id',target.id,'version',target.version,'status',target.status,'reviewedAt',target.reviewed_at)); end if;
   if action='report' and target.status='approved' and length(trim(input->>'reason')) between 5 and 1000 then
     insert into nitido_community.reports(version_id,reporter,reason,created_at) values(target.id,actor,input->>'reason',now()) on conflict(version_id,reporter) do update set reason=excluded.reason,created_at=now(),status='open',resolution='',resolved_at=null,resolved_by=null;
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
    'reports',coalesce((select jsonb_agg(to_jsonb(r)-'reporter'-'resolved_by') from nitido_community.reports r where r.reporter=actor),'[]'::jsonb));
 elsif action='reports' and moderator then
   return coalesce((select jsonb_agg(to_jsonb(v)) from (select r.version_id,r.reason,r.created_at,v.status,v.snapshot->>'name' as name from nitido_community.reports r join nitido_community.versions v on r.version_id=v.id where v.status='approved' order by r.created_at desc limit 100) v),'[]'::jsonb);
 end if;
 raise exception 'Operação não permitida.';
end $$;
revoke all on function public.creator_command(text,jsonb) from public,anon;
grant execute on function public.creator_command(text,jsonb) to authenticated;

