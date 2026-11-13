create or replace function public.creator_metrics() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
 actor uuid := auth.uid();
 moderator boolean := coalesce(auth.jwt()->'app_metadata'->>'nitido_moderator','false')='true';
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
