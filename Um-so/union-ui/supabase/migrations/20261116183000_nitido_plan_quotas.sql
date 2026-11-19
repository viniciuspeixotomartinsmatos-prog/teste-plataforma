create table if not exists public.nitido_plan_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 period date not null,
 bucket text not null check(bucket in ('prompt','studio','audit')),
 used integer not null default 0 check(used >= 0),
 primary key(user_id,period,bucket)
);
create table if not exists public.nitido_plan_operations (
 user_id uuid not null,
 period date not null,
 bucket text not null,
 operation uuid not null,
 resource text not null check(length(resource) between 1 and 200),
 primary key(user_id,period,bucket,operation),
 foreign key(user_id,period,bucket) references public.nitido_plan_usage on delete cascade
);
alter table public.nitido_plan_usage enable row level security;
alter table public.nitido_plan_operations enable row level security;
revoke all on public.nitido_plan_usage,public.nitido_plan_operations from public,anon,authenticated;

create or replace function public.nitido_consume_plan_quota(p_user uuid,p_bucket text,p_limit int,p_operation uuid,p_resource text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 month_start date := date_trunc('month',now() at time zone 'UTC')::date;
 month_end date := (month_start + interval '1 month')::date;
 used_now integer;
 previous_resource text;
begin
 if p_limit is null or p_limit not between 1 and 1000 or p_operation is null then
  raise invalid_parameter_value;
 end if;
 delete from public.nitido_plan_usage
 where user_id=p_user and period < (month_start-interval '2 months')::date;
 insert into public.nitido_plan_usage(user_id,period,bucket)
 values(p_user,month_start,p_bucket) on conflict do nothing;
 select used into used_now from public.nitido_plan_usage
 where user_id=p_user and period=month_start and bucket=p_bucket for update;
 select resource into previous_resource from public.nitido_plan_operations
 where user_id=p_user and period=month_start and bucket=p_bucket and operation=p_operation;
 if previous_resource is not null then
  return jsonb_build_object('allowed',previous_resource=p_resource,'remaining',greatest(0,p_limit-used_now),'resetAt',month_end);
 end if;
 if used_now>=p_limit then
  return jsonb_build_object('allowed',false,'remaining',0,'resetAt',month_end);
 end if;
 update public.nitido_plan_usage set used=used_now+1
 where user_id=p_user and period=month_start and bucket=p_bucket;
 insert into public.nitido_plan_operations(user_id,period,bucket,operation,resource)
 values(p_user,month_start,p_bucket,p_operation,p_resource);
 return jsonb_build_object('allowed',true,'remaining',p_limit-used_now-1,'resetAt',month_end);
end;
$$;

create or replace function public.nitido_read_plan_quotas(p_user uuid)
returns jsonb language sql security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(bucket,used),'{}'::jsonb) from public.nitido_plan_usage
 where user_id=p_user and period=date_trunc('month',now() at time zone 'UTC')::date
$$;
revoke all on function public.nitido_consume_plan_quota(uuid,text,int,uuid,text), public.nitido_read_plan_quotas(uuid) from public,anon,authenticated;
grant execute on function public.nitido_consume_plan_quota(uuid,text,int,uuid,text), public.nitido_read_plan_quotas(uuid) to service_role;
