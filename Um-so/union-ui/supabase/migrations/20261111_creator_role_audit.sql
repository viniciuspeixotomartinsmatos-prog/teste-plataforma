-- Resolve administrator-managed roles at execution time, including revocations.
create or replace function nitido_community.is_moderator() returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((select (raw_app_meta_data->>'nitido_moderator')='true' from auth.users where id=auth.uid()),false)
$$;
revoke all on function nitido_community.is_moderator() from public,anon,authenticated;

create table if not exists nitido_community.audit (
 id bigint generated always as identity primary key,
 version_id uuid not null references nitido_community.versions on delete cascade,
 actor uuid references auth.users on delete set null,
 previous_status text, status text not null, reason text not null,
 occurred_at timestamptz not null default now()
);
revoke all on nitido_community.audit from public,anon,authenticated;
create or replace function nitido_community.record_decision() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into nitido_community.audit(version_id,actor,previous_status,status,reason)
 values(new.id,auth.uid(),case when TG_OP='UPDATE' then old.status else null end,new.status,new.reason);
 return new;
end $$;
revoke all on function nitido_community.record_decision() from public,anon,authenticated;
drop trigger if exists creator_decision_audit on nitido_community.versions;
create trigger creator_decision_audit after insert or update of status on nitido_community.versions
 for each row execute function nitido_community.record_decision();

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

create or replace function public.creator_metrics() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
 actor uuid := auth.uid();
 moderator boolean := nitido_community.is_moderator();
begin
 if actor is null then raise exception 'Entre na sua conta.'; end if;
 return (select jsonb_build_object('scope',case when moderator then 'community' else 'own' end,
   'submitted',count(*),'pending',count(*) filter(where status='pending'),
   'published',count(*) filter(where status='approved'),'rejected',count(*) filter(where status='rejected'),
   'withdrawn',count(*) filter(where status='withdrawn'),'archived',count(*) filter(where status='archived'))
  from nitido_community.versions where moderator or owner_id=actor);
end $$;
revoke all on function public.creator_metrics() from public,anon;
grant execute on function public.creator_metrics() to authenticated;
