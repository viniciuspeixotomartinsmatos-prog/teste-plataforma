-- A subscription update can describe an unpaid upgrade. Only confirmed payment changes the paid tier.
create or replace function public.paddle_apply_event(p_environment text,p_event jsonb) returns jsonb
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
   plan_id=case when completed and (p_event->>'paid_through')::timestamptz>=coalesce(s.paid_through,'-infinity'::timestamptz) then p_event->>'plan_id' else s.plan_id end,
   price_id=case when completed and (p_event->>'paid_through')::timestamptz>=coalesce(s.paid_through,'-infinity'::timestamptz) then p_event->>'price_id' else s.price_id end,
   state_occurred_at=greatest(s.state_occurred_at,event_time)
  where s.subscription_id=sub_id and s.environment=p_environment;
 end if;
 return jsonb_build_object('duplicate',false);
end $$;
revoke all on function public.paddle_apply_event(text,jsonb) from public,anon,authenticated;
grant execute on function public.paddle_apply_event(text,jsonb) to service_role;
