create table if not exists public.nitido_prompt_unlocks (
 user_id uuid not null references auth.users(id) on delete cascade,
 resource text not null check(length(resource) between 1 and 200),
 primary key(user_id,resource)
);
alter table public.nitido_prompt_unlocks enable row level security;
revoke all on public.nitido_prompt_unlocks from public,anon,authenticated;

insert into public.nitido_prompt_unlocks(user_id,resource)
 select distinct user_id,resource from public.nitido_plan_operations where bucket='prompt'
 on conflict do nothing;

create or replace function public.nitido_unlock_prompt(p_user uuid,p_limit int,p_operation uuid,p_resource text,p_weekly_limit int)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 result jsonb;
 usage jsonb;
 month_start date := date_trunc('month',now() at time zone 'UTC')::date;
begin
 if p_user is null or p_limit is null or p_limit not between 1 and 1000 or p_operation is null
    or p_resource is null or length(p_resource) not between 1 and 200
    or (p_weekly_limit is not null and p_weekly_limit not between 1 and p_limit) then
  raise invalid_parameter_value;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('nitido-prompt:'||p_user::text,0));
 if exists(select 1 from public.nitido_prompt_unlocks where user_id=p_user and resource=p_resource) then
  usage := public.nitido_read_plan_quotas(p_user);
  return jsonb_build_object(
   'allowed',true,
   'remaining',greatest(0,p_limit-coalesce((usage->>'prompt')::int,0)),
   'weeklyRemaining',greatest(0,p_weekly_limit-coalesce((usage->>'prompt_weekly')::int,0)),
   'resetAt',(month_start+interval '1 month')::date
  );
 end if;
 result := public.nitido_consume_prompt_quota(p_user,p_limit,p_operation,p_resource,p_weekly_limit);
 if (result->>'allowed')::boolean then
  insert into public.nitido_prompt_unlocks(user_id,resource) values(p_user,p_resource);
 end if;
 return result;
end;
$$;
revoke all on function public.nitido_unlock_prompt(uuid,int,uuid,text,int) from public,anon,authenticated;
grant execute on function public.nitido_unlock_prompt(uuid,int,uuid,text,int) to service_role;
