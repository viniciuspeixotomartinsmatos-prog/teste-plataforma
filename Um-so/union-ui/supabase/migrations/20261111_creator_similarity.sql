-- Exact normalized text matches are review evidence, never a plagiarism verdict.
create index if not exists creator_source_fingerprint on nitido_community.versions
 ((md5(regexp_replace(snapshot->>'source','\s','','g'))));

create or replace function public.creator_similarity(version_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
 actor uuid:=auth.uid();
 moderator boolean:=nitido_community.is_moderator();
 target nitido_community.versions%rowtype;
begin
 if actor is null then raise exception 'Entre na sua conta.'; end if;
 select * into target from nitido_community.versions where id=version_id;
 if not found or not (moderator or target.owner_id=actor or target.status='approved') then raise exception 'Versão indisponível.'; end if;
 return coalesce((select jsonb_agg(to_jsonb(matches)) from
  (select id,version,status,snapshot->>'name' as name from nitido_community.versions
   where owner_id<>target.owner_id and (status='approved' or moderator)
    and md5(regexp_replace(snapshot->>'source','\s','','g'))=md5(regexp_replace(target.snapshot->>'source','\s','','g'))
    and regexp_replace(snapshot->>'source','\s','','g')=regexp_replace(target.snapshot->>'source','\s','','g')
   order by created_at desc limit 20) matches),'[]'::jsonb);
end $$;
revoke all on function public.creator_similarity(uuid) from public,anon;
grant execute on function public.creator_similarity(uuid) to authenticated;
