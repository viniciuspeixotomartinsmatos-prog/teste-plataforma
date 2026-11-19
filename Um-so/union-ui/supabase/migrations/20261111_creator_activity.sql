-- Aggregate counters only. No visitor ID, IP, session, user agent or search text.
create table if not exists nitido_community.activity (
 day date not null default current_date,
 version_id uuid not null references nitido_community.versions on delete cascade,
 event text not null check(event in ('open','copy','download')),
 total bigint not null default 0 check(total>=0),
 primary key(day,version_id,event)
);
revoke all on nitido_community.activity from public,anon,authenticated;

create or replace function public.creator_event(version_id uuid,event_kind text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if event_kind not in ('open','copy','download') or (event_kind<>'open' and auth.uid() is null) then raise exception 'Evento inválido.'; end if;
 if not exists(select 1 from nitido_community.versions where id=version_id and status='approved') then return '{"recorded":false}'; end if;
 delete from nitido_community.activity where day<=current_date-90;
 insert into nitido_community.activity(day,version_id,event,total) values(current_date,version_id,event_kind,1)
 on conflict on constraint activity_pkey do update set total=nitido_community.activity.total+1;
 return '{"recorded":true}';
end $$;
revoke all on function public.creator_event(uuid,text) from public;
grant execute on function public.creator_event(uuid,text) to anon,authenticated;

create or replace function public.creator_metrics() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid();moderator boolean:=nitido_community.is_moderator();result jsonb;
begin
 if actor is null then raise exception 'Entre na sua conta.'; end if;
 select jsonb_build_object('scope',case when moderator then 'community' else 'own' end,
  'submitted',count(*),'pending',count(*) filter(where status='pending'),
  'published',count(*) filter(where status='approved'),'rejected',count(*) filter(where status='rejected'),
  'withdrawn',count(*) filter(where status='withdrawn'),'archived',count(*) filter(where status='archived'))
 into result from nitido_community.versions where moderator or owner_id=actor;
 return result||jsonb_build_object('activity',(select jsonb_build_object(
  'opens',coalesce(sum(a.total) filter(where a.event='open'),0),
  'copies',coalesce(sum(a.total) filter(where a.event='copy'),0),
  'downloads',coalesce(sum(a.total) filter(where a.event='download'),0))
  from nitido_community.activity a join nitido_community.versions v on v.id=a.version_id
  where a.day>current_date-90 and (moderator or v.owner_id=actor)));
end $$;
revoke all on function public.creator_metrics() from public,anon;
grant execute on function public.creator_metrics() to authenticated;
