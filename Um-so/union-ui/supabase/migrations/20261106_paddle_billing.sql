-- Trusted Paddle Billing ownership + append-only event ledger. Payments remain off until env gates are explicitly enabled.
create table public.paddle_customers (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in ('sandbox','live')),
 customer_id text not null check(customer_id ~ '^ctm_[a-z0-9]{26}$'),
 primary key(user_id,environment), unique(environment,customer_id)
);
create table public.paddle_checkouts (
 transaction_id text primary key check(transaction_id ~ '^txn_[a-z0-9]{26}$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in ('sandbox','live')),
 customer_id text not null,plan_id text not null check(plan_id in ('monthly','quarterly','yearly')),price_id text not null,
 created_at timestamptz not null default now(),
 foreign key(user_id,environment) references public.paddle_customers(user_id,environment)
);
create table public.paddle_checkout_reservations (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in ('sandbox','live')),
 reservation uuid not null,plan_id text not null,price_id text not null,
 state text not null check(state in ('creating','pending','completed')),transaction_id text,
 created_at timestamptz not null default now(),expires_at timestamptz not null default (now()+interval '15 minutes'),
 primary key(user_id,environment),unique(environment,transaction_id)
);
create table public.paddle_subscriptions (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in ('sandbox','live')),
 subscription_id text not null,customer_id text not null,
 plan_id text not null check(plan_id in ('monthly','quarterly','yearly')),price_id text not null,
 status text not null,paid_through timestamptz,payment_confirmed boolean not null default false,
 cancel_at_period_end boolean not null default false,revoked boolean not null default false,
 state_occurred_at timestamptz not null,is_current boolean not null default true,
 primary key(environment,subscription_id),
 foreign key(user_id,environment) references public.paddle_customers(user_id,environment)
);
create unique index paddle_one_current_subscription on public.paddle_subscriptions(user_id,environment) where is_current;
create table public.paddle_events (
 environment text not null check(environment in ('sandbox','live')),event_id text not null,
 event_type text not null,occurred_at timestamptz not null,processed_at timestamptz not null default now(),
 transaction_id text,subscription_id text not null,revoked boolean not null default false,
 primary key(environment,event_id)
);
alter table public.paddle_customers enable row level security;
alter table public.paddle_checkouts enable row level security;
alter table public.paddle_checkout_reservations enable row level security;
alter table public.paddle_subscriptions enable row level security;
alter table public.paddle_events enable row level security;
revoke all on public.paddle_customers,public.paddle_checkouts,public.paddle_subscriptions,public.paddle_events from anon,authenticated;
revoke all on public.paddle_checkout_reservations from anon,authenticated;
grant select on public.paddle_subscriptions to authenticated;
create policy paddle_read_own_subscription on public.paddle_subscriptions for select to authenticated using ((select auth.uid())=user_id);

create function public.paddle_customer_for_user(p_user uuid,p_environment text) returns text
language sql security definer set search_path=pg_catalog,public as $$
 select customer_id from public.paddle_customers where user_id=p_user and environment=p_environment;
$$;
create function public.paddle_bind_customer(p_user uuid,p_environment text,p_customer text) returns text
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 insert into public.paddle_customers(user_id,environment,customer_id) values(p_user,p_environment,p_customer) on conflict(user_id,environment) do nothing;
 return (select customer_id from public.paddle_customers where user_id=p_user and environment=p_environment);
end $$;
create function public.paddle_reserve_checkout(p_user uuid,p_environment text,p_plan text,p_price text,p_reservation uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare pending public.paddle_checkout_reservations;
begin
 if p_environment not in ('sandbox','live') or p_plan not in ('monthly','quarterly','yearly') or p_price !~ '^pri_[a-z0-9]{26}$' then raise exception 'invalid checkout'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_environment||':'||p_user::text||':checkout',0));
 if exists(select 1 from public.paddle_subscriptions where user_id=p_user and environment=p_environment and is_current and paid_through>now() and payment_confirmed and not revoked) then return jsonb_build_object('state','paid'); end if;
 select * into pending from public.paddle_checkout_reservations where user_id=p_user and environment=p_environment for update;
 if found and pending.state<>'completed' then
  if pending.state='creating' then return jsonb_build_object('state',case when pending.expires_at<now() then 'stale' else 'creating' end); end if;
  return jsonb_build_object('state',case when pending.price_id=p_price and pending.plan_id=p_plan then 'pending' else 'different' end,'transaction_id',pending.transaction_id,'price_id',pending.price_id,'reservation',pending.reservation);
 end if;
 insert into public.paddle_checkout_reservations(user_id,environment,reservation,plan_id,price_id,state)
 values(p_user,p_environment,p_reservation,p_plan,p_price,'creating')
 on conflict(user_id,environment) do update set reservation=excluded.reservation,plan_id=excluded.plan_id,price_id=excluded.price_id,state='creating',transaction_id=null,created_at=now(),expires_at=now()+interval '15 minutes';
 return jsonb_build_object('state','reserved','reservation',p_reservation);
end $$;
create function public.paddle_release_checkout(p_user uuid,p_environment text,p_transaction text,p_reservation uuid) returns boolean
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 -- Service invokes this only after Paddle confirms this exact transaction is canceled.
 delete from public.paddle_checkout_reservations where user_id=p_user and environment=p_environment and transaction_id=p_transaction and reservation=p_reservation and state='pending';
 return found;
end $$;
create function public.paddle_bind_checkout(p_user uuid,p_environment text,p_customer text,p_transaction text,p_plan text,p_price text,p_reservation uuid) returns boolean
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if not exists(select 1 from public.paddle_customers where user_id=p_user and environment=p_environment and customer_id=p_customer) then raise exception 'customer mismatch'; end if;
 perform 1 from public.paddle_customers where user_id=p_user and environment=p_environment for update;
 if exists(select 1 from public.paddle_subscriptions where user_id=p_user and environment=p_environment and is_current and paid_through>now() and payment_confirmed and not revoked) then raise exception 'subscription already paid'; end if;
 if not exists(select 1 from public.paddle_checkout_reservations where user_id=p_user and environment=p_environment and reservation=p_reservation and plan_id=p_plan and price_id=p_price and state='creating') then raise exception 'checkout not reserved'; end if;
 insert into public.paddle_checkouts(transaction_id,user_id,environment,customer_id,plan_id,price_id) values(p_transaction,p_user,p_environment,p_customer,p_plan,p_price);
 update public.paddle_checkout_reservations set state='pending',transaction_id=p_transaction where user_id=p_user and environment=p_environment and reservation=p_reservation;
 return true;
end $$;

create function public.paddle_apply_event(p_environment text,p_event jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare
 owner_id uuid; existing public.paddle_subscriptions; checkout public.paddle_checkouts;
 event_time timestamptz := (p_event->>'occurred_at')::timestamptz;
 v_event_id text := p_event->>'id'; sub_id text := p_event->>'subscription_id';
 v_transaction_id text := p_event->>'transaction_id'; v_customer_id text := p_event->>'customer_id';
 completed boolean := coalesce((p_event->>'payment_completed')::boolean,false);
 revoke_access boolean := coalesce((p_event->>'revoke')::boolean,false);
begin
 if p_environment not in ('sandbox','live') or v_event_id !~ '^evt_[a-z0-9]{26}$' or sub_id !~ '^sub_[a-z0-9]{26}$' then raise exception 'invalid event'; end if;
 -- Serialize all events for a subscription, including first activation and simultaneous retries.
 perform pg_advisory_xact_lock(hashtextextended(p_environment||':'||sub_id,0));
 if exists(select 1 from public.paddle_events e where e.environment=p_environment and e.event_id=v_event_id) then return jsonb_build_object('duplicate',true); end if;
 -- One lock order for old/new subscription events and checkout binding avoids cross-subscription races.
 perform 1 from public.paddle_customers c where c.environment=p_environment and c.customer_id=v_customer_id for update;
 if not found then raise exception 'unbound customer'; end if;
 select * into existing from public.paddle_subscriptions s where s.environment=p_environment and s.subscription_id=sub_id for update;
 if found then
  if existing.customer_id<>v_customer_id then raise exception 'customer mismatch'; end if;
  owner_id:=existing.user_id;
 else
  -- A custom_data user_id or matching email can never establish ownership.
  select * into checkout from public.paddle_checkouts c where c.transaction_id=v_transaction_id and c.environment=p_environment and c.customer_id=v_customer_id;
  if not found then raise exception 'unbound transaction; retry after checkout persistence'; end if;
  if checkout.plan_id<>p_event->>'plan_id' or checkout.price_id<>p_event->>'price_id' then raise exception 'checkout price mismatch'; end if;
  owner_id:=checkout.user_id;
 end if;
 -- Lock the customer too: two different checkouts cannot concurrently replace one user's entitlement.
 perform 1 from public.paddle_customers c where c.user_id=owner_id and c.environment=p_environment and c.customer_id=v_customer_id for update;
 if not found then raise exception 'unbound customer'; end if;
 if existing.user_id is null then
  if exists(select 1 from public.paddle_subscriptions s where s.user_id=owner_id and s.environment=p_environment and s.is_current and s.payment_confirmed and not s.revoked and s.paid_through>now()) then raise exception 'different subscription already paid'; end if;
  -- Retain historical subscriptions so their delayed payments/refunds cannot affect their replacement.
  update public.paddle_subscriptions s set is_current=false where s.user_id=owner_id and s.environment=p_environment and s.is_current;
 end if;
 if completed and (p_event->>'type'<>'transaction.completed' or v_transaction_id is null or p_event->>'paid_through' is null) then raise exception 'unconfirmed payment'; end if;
 insert into public.paddle_events(environment,event_id,event_type,occurred_at,transaction_id,subscription_id,revoked)
 values(p_environment,v_event_id,p_event->>'type',event_time,v_transaction_id,sub_id,revoke_access);
 if completed then update public.paddle_checkout_reservations set state='completed' where user_id=owner_id and environment=p_environment and transaction_id=v_transaction_id; end if;
 if existing.user_id is null then
  insert into public.paddle_subscriptions(user_id,environment,subscription_id,customer_id,plan_id,price_id,status,paid_through,payment_confirmed,cancel_at_period_end,revoked,state_occurred_at)
  values(owner_id,p_environment,sub_id,v_customer_id,p_event->>'plan_id',p_event->>'price_id',p_event->>'status',case when completed then (p_event->>'paid_through')::timestamptz end,completed,coalesce((p_event->>'cancel_at_period_end')::boolean,false),revoke_access,event_time);
 else
  update public.paddle_subscriptions s set
   -- Refund/chargeback revocation is sticky even if delivered before payment completion.
   revoked=s.revoked or revoke_access,
   payment_confirmed=s.payment_confirmed or completed,
   paid_through=case when completed then greatest(s.paid_through,(p_event->>'paid_through')::timestamptz) else s.paid_through end,
   status=case when event_time>=s.state_occurred_at then p_event->>'status' else s.status end,
   cancel_at_period_end=case when event_time>=s.state_occurred_at then coalesce((p_event->>'cancel_at_period_end')::boolean,false) else s.cancel_at_period_end end,
   plan_id=case when event_time>=s.state_occurred_at then p_event->>'plan_id' else s.plan_id end,
   price_id=case when event_time>=s.state_occurred_at then p_event->>'price_id' else s.price_id end,
   state_occurred_at=greatest(s.state_occurred_at,event_time)
  where s.subscription_id=sub_id and s.environment=p_environment;
 end if;
 return jsonb_build_object('duplicate',false);
end $$;

revoke all on function public.paddle_customer_for_user(uuid,text),public.paddle_bind_customer(uuid,text,text),public.paddle_reserve_checkout(uuid,text,text,text,uuid),public.paddle_release_checkout(uuid,text,text,uuid),public.paddle_bind_checkout(uuid,text,text,text,text,text,uuid),public.paddle_apply_event(text,jsonb) from public,anon,authenticated;
grant execute on function public.paddle_customer_for_user(uuid,text),public.paddle_bind_customer(uuid,text,text),public.paddle_reserve_checkout(uuid,text,text,text,uuid),public.paddle_release_checkout(uuid,text,text,uuid),public.paddle_bind_checkout(uuid,text,text,text,text,text,uuid),public.paddle_apply_event(text,jsonb) to service_role;
