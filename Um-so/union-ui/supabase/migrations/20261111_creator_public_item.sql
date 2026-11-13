create or replace function public.creator_public_item(version_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',v.id,'creator',p.public_id,'name',v.snapshot->>'name',
  'description',v.snapshot->>'description','category',v.snapshot->>'category',
  'framework',v.snapshot->>'framework','license',v.snapshot->>'license',
  'installation',v.snapshot->>'installation','requirements',v.snapshot->>'requirements',
  'version',v.version,'display_name',v.display_name,'bio',v.bio,'reviewed_at',v.reviewed_at)
 from nitido_community.versions v join nitido_community.profiles p on p.owner_id=v.owner_id
 where v.id=version_id and v.status='approved'
$$;
revoke all on function public.creator_public_item(uuid) from public;
grant execute on function public.creator_public_item(uuid) to anon,authenticated;
