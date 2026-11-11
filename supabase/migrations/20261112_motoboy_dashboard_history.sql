-- LavaJá: detalhes, estatísticas e histórico confiável do motoboy.
-- Execute depois de 20261111_motoboy_deliveries.sql no Supabase SQL Editor.

alter table public.orders
  add column if not exists pickup_courier_id uuid null references public.profiles(id) on delete set null,
  add column if not exists return_courier_id uuid null references public.profiles(id) on delete set null,
  add column if not exists pickup_courier_accepted_at timestamptz null,
  add column if not exists return_courier_accepted_at timestamptz null;

create index if not exists idx_orders_pickup_courier_id on public.orders(pickup_courier_id);
create index if not exists idx_orders_return_courier_id on public.orders(return_courier_id);

-- Preserva o vínculo dos motoboys que já estavam com uma corrida ativa antes desta migração.
update public.orders
set pickup_courier_id = courier_id,
    pickup_courier_accepted_at = coalesce(pickup_courier_accepted_at, courier_accepted_at)
where courier_id is not null
  and delivery_status in ('courier_to_customer', 'courier_to_laundry')
  and pickup_courier_id is null;

update public.orders
set return_courier_id = courier_id,
    return_courier_accepted_at = coalesce(return_courier_accepted_at, courier_accepted_at)
where courier_id is not null
  and delivery_status = 'courier_to_customer_return'
  and return_courier_id is null;

-- A função retorna somente informações operacionais e de resumo necessárias ao motoboy.
drop function if exists public.motoboy_list_deliveries(text);
create function public.motoboy_list_deliveries(p_scope text default 'available')
returns table (
  id uuid,
  order_number text,
  service_name text,
  status text,
  delivery_status text,
  scheduled_date date,
  scheduled_time text,
  customer_name text,
  customer_phone text,
  customer_address text,
  laundry_name text,
  laundry_phone text,
  laundry_address text,
  instructions text,
  leg text,
  created_at timestamptz,
  delivered_to_laundry_at timestamptz,
  delivered_to_customer_at timestamptz,
  pickup_courier_id uuid,
  return_courier_id uuid,
  is_currently_assigned boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (
    select 1 from public.profiles p where p.id = v_uid and p.account_type = 'motoboy'
  ) then
    raise exception 'Acesso permitido somente para contas de motoboy.';
  end if;

  if p_scope = 'available' then
    return query
      select o.id, o.order_number, o.service_name, o.status, o.delivery_status,
        o.scheduled_date, o.scheduled_time,
        coalesce(cp.name, 'Cliente'), coalesce(cp.phone, ''), o.address,
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''), 'pickup'::text,
        o.created_at, o.delivered_to_laundry_at,
        o.delivered_to_customer_at, o.pickup_courier_id, o.return_courier_id,
        (o.courier_id = v_uid)
      from public.orders o
      join public.laundries l on l.id = o.laundry_id
      join public.profiles cp on cp.id = o.client_id
      where o.courier_id is null
        and o.status in ('confirmed', 'pickup_scheduled')
        and o.delivery_status = 'awaiting_pickup'
      union all
      select o.id, o.order_number, o.service_name, o.status, o.delivery_status,
        o.scheduled_date, o.scheduled_time,
        coalesce(cp.name, 'Cliente'), coalesce(cp.phone, ''), o.address,
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''), 'return'::text,
        o.created_at, o.delivered_to_laundry_at,
        o.delivered_to_customer_at, o.pickup_courier_id, o.return_courier_id,
        (o.courier_id = v_uid)
      from public.orders o
      join public.laundries l on l.id = o.laundry_id
      join public.profiles cp on cp.id = o.client_id
      where o.courier_id is null
        and o.status = 'ready'
        and o.delivery_status = 'awaiting_return'
      order by 6 nulls last, 7 nulls last;
  elsif p_scope = 'assigned' then
    return query
      select o.id, o.order_number, o.service_name, o.status, o.delivery_status,
        o.scheduled_date, o.scheduled_time,
        coalesce(cp.name, 'Cliente'), coalesce(cp.phone, ''), o.address,
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''),
        case
          when o.delivery_status in ('awaiting_return', 'courier_to_customer_return', 'delivered_to_customer')
            and (o.return_courier_id = v_uid or o.courier_id = v_uid) then 'return'::text
          else 'pickup'::text
        end,
        o.created_at, o.delivered_to_laundry_at,
        o.delivered_to_customer_at, o.pickup_courier_id, o.return_courier_id,
        (o.courier_id = v_uid)
      from public.orders o
      join public.laundries l on l.id = o.laundry_id
      join public.profiles cp on cp.id = o.client_id
      where o.courier_id = v_uid
         or o.pickup_courier_id = v_uid
         or o.return_courier_id = v_uid
      order by o.created_at desc;
  else
    raise exception 'Filtro de entregas inválido.';
  end if;
end;
$$;

-- Aceitação atômica e gravação permanente de quem realizou cada trecho.
create or replace function public.motoboy_accept_delivery(p_order_id uuid, p_leg text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rows integer;
begin
  if v_uid is null or not exists (
    select 1 from public.profiles p where p.id = v_uid and p.account_type = 'motoboy'
  ) then
    raise exception 'Acesso permitido somente para contas de motoboy.';
  end if;

  if p_leg = 'pickup' then
    update public.orders
      set courier_id = v_uid,
          pickup_courier_id = v_uid,
          pickup_courier_accepted_at = now(),
          delivery_status = 'courier_to_customer',
          courier_accepted_at = now(),
          updated_at = now()
      where id = p_order_id and courier_id is null
        and status in ('confirmed', 'pickup_scheduled')
        and delivery_status = 'awaiting_pickup';
  elsif p_leg = 'return' then
    update public.orders
      set courier_id = v_uid,
          return_courier_id = v_uid,
          return_courier_accepted_at = now(),
          delivery_status = 'courier_to_customer_return',
          courier_accepted_at = now(),
          updated_at = now()
      where id = p_order_id and courier_id is null
        and status = 'ready' and delivery_status = 'awaiting_return';
  else
    raise exception 'Tipo de corrida inválido.';
  end if;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'Esta entrega não está mais disponível. Atualize a lista.';
  end if;
end;
$$;

-- Atualiza as etapas sem apagar o histórico de quem executou cada trecho.
create or replace function public.motoboy_update_delivery(p_order_id uuid, p_next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rows integer;
begin
  if v_uid is null or not exists (
    select 1 from public.profiles p where p.id = v_uid and p.account_type = 'motoboy'
  ) then
    raise exception 'Acesso permitido somente para contas de motoboy.';
  end if;

  if p_next_status = 'courier_to_laundry' then
    update public.orders set delivery_status = p_next_status, updated_at = now()
      where id = p_order_id and courier_id = v_uid
        and pickup_courier_id = v_uid and delivery_status = 'courier_to_customer';
  elsif p_next_status = 'at_laundry' then
    update public.orders set delivery_status = p_next_status, courier_id = null,
      delivered_to_laundry_at = now(), updated_at = now()
      where id = p_order_id and courier_id = v_uid
        and pickup_courier_id = v_uid and delivery_status = 'courier_to_laundry';
  elsif p_next_status = 'delivered_to_customer' then
    update public.orders set delivery_status = p_next_status, courier_id = null,
      delivered_to_customer_at = now(), status = 'delivered', current_step = 5,
      updated_at = now()
      where id = p_order_id and courier_id = v_uid
        and return_courier_id = v_uid
        and delivery_status = 'courier_to_customer_return' and status = 'ready';
  else
    raise exception 'Transição de entrega inválida.';
  end if;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'Pedido não encontrado, não atribuído a você ou etapa inválida.';
  end if;
end;
$$;

revoke all on function public.motoboy_list_deliveries(text) from public;
revoke all on function public.motoboy_accept_delivery(uuid, text) from public;
revoke all on function public.motoboy_update_delivery(uuid, text) from public;
grant execute on function public.motoboy_list_deliveries(text) to authenticated;
grant execute on function public.motoboy_accept_delivery(uuid, text) to authenticated;
grant execute on function public.motoboy_update_delivery(uuid, text) to authenticated;
