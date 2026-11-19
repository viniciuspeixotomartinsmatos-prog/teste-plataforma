alter table public.nitido_plan_operations add column if not exists used_at timestamptz;
alter table public.nitido_plan_operations alter column used_at set default now();

create index if not exists nitido_plan_operations_prompt_week
 on public.nitido_plan_operations(user_id,used_at) where bucket='prompt';

create or replace function public.nitido_consume_prompt_quota(p_user uuid,p_limit int,p_operation uuid,p_resource text,p_weekly_limit int)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 month_start date := date_trunc('month',now() at time zone 'UTC')::date;
 month_end timestamptz := (month_start + interval '1 month') at time zone 'UTC';
 local_week timestamp := date_trunc('week',now() at time zone 'America/Cuiaba');
 week_start timestamptz := local_week at time zone 'America/Cuiaba';
 week_end timestamptz := (local_week + interval '1 week') at time zone 'America/Cuiaba';
 used_week int;
 result jsonb;
 previous_operation boolean;
 next_available timestamptz;
begin
 if p_weekly_limit is not null and p_weekly_limit not between 1 and p_limit then
  raise invalid_parameter_value;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('nitido-prompt:'||p_user::text,0));
 if p_weekly_limit is not null then
  select count(*) into used_week from public.nitido_plan_operations
   where user_id=p_user and bucket='prompt' and used_at>=week_start and used_at<week_end;
  select exists(select 1 from public.nitido_plan_operations
   where user_id=p_user and period=month_start and bucket='prompt' and operation=p_operation) into previous_operation;
  if used_week>=p_weekly_limit and not previous_operation then
   next_available := week_end;
   if exists(select 1 from public.nitido_plan_usage
    where user_id=p_user and period=month_start and bucket='prompt' and used>=p_limit) then
    next_available := greatest(week_end,month_end);
   end if;
   return jsonb_build_object('allowed',false,'period','week','remaining',0,'resetAt',next_available);
  end if;
 end if;
 result := public.nitido_consume_plan_quota(p_user,'prompt',p_limit,p_operation,p_resource);
 if p_weekly_limit is not null then
  return result || jsonb_build_object('weeklyRemaining',greatest(0,p_weekly_limit-used_week-
   case when (result->>'allowed')::boolean and not previous_operation then 1 else 0 end));
 end if;
 return result;
end;
$$;

create or replace function public.nitido_read_plan_quotas(p_user uuid)
returns jsonb language sql security definer set search_path='' as $$
 with week as (select date_trunc('week',now() at time zone 'America/Cuiaba') as local_start)
 select coalesce((select jsonb_object_agg(bucket,used) from public.nitido_plan_usage
 where user_id=p_user and period=date_trunc('month',now() at time zone 'UTC')::date),'{}'::jsonb)
 || jsonb_build_object('prompt_weekly',(select count(*) from public.nitido_plan_operations
 where user_id=p_user and bucket='prompt'
 and used_at>=week.local_start at time zone 'America/Cuiaba'
 and used_at<(week.local_start+interval '1 week') at time zone 'America/Cuiaba'))
 from week;
$$;
revoke all on function public.nitido_consume_prompt_quota(uuid,int,uuid,text,int) from public,anon,authenticated;
grant execute on function public.nitido_consume_prompt_quota(uuid,int,uuid,text,int) to service_role;
