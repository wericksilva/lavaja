-- LavaJá: fluxo de coleta e entrega por motoboy.
-- Execute este arquivo no Supabase SQL Editor antes de liberar contas de motoboy.

-- 1) Habilita o novo tipo de conta.
alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles
  add constraint profiles_account_type_check
  check (account_type in ('client', 'store', 'motoboy'));

-- 2) Campos de atribuição e etapas logísticas no pedido existente.
alter table public.orders
  add column if not exists courier_id uuid null references public.profiles(id) on delete set null,
  add column if not exists delivery_status text not null default 'awaiting_pickup',
  add column if not exists courier_accepted_at timestamptz null,
  add column if not exists delivered_to_laundry_at timestamptz null,
  add column if not exists delivered_to_customer_at timestamptz null;

alter table public.orders drop constraint if exists orders_delivery_status_check;
alter table public.orders
  add constraint orders_delivery_status_check check (
    delivery_status in (
      'awaiting_pickup',
      'courier_to_customer',
      'courier_to_laundry',
      'at_laundry',
      'awaiting_return',
      'courier_to_customer_return',
      'delivered_to_customer'
    )
  );

create index if not exists idx_orders_courier_id on public.orders(courier_id);
create index if not exists idx_orders_delivery_available on public.orders(status, delivery_status, scheduled_date);

-- Compatibilidade com pedidos que já existiam antes da ativação do motoboy.
update public.orders
set delivery_status = case
  when status = 'ready' then 'awaiting_return'
  when status = 'delivered' then 'delivered_to_customer'
  when status in ('picked_up', 'washing') then 'at_laundry'
  else 'awaiting_pickup'
end
where delivery_status = 'awaiting_pickup';

-- Quando a lavanderia marca o pedido como pronto, ele entra na fila de retorno.
create or replace function public.set_delivery_return_available()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'ready'
     and old.status is distinct from new.status
     and new.delivery_status = 'at_laundry' then
    new.delivery_status := 'awaiting_return';
    new.courier_id := null;
    new.courier_accepted_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_make_return_available on public.orders;
create trigger orders_make_return_available
before update of status on public.orders
for each row execute function public.set_delivery_return_available();

-- 3) Lista apenas os dados operacionais necessários ao entregador.
-- A função é SECURITY DEFINER para não depender de políticas amplas em orders/profiles.
create or replace function public.motoboy_list_deliveries(p_scope text default 'available')
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
  leg text
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
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''), 'pickup'::text
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
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''), 'return'::text
      from public.orders o
      join public.laundries l on l.id = o.laundry_id
      join public.profiles cp on cp.id = o.client_id
      where o.courier_id is null
        and o.status = 'ready'
        and o.delivery_status = 'awaiting_return'
      order by 6 nulls last;
  elsif p_scope = 'assigned' then
    return query
      select o.id, o.order_number, o.service_name, o.status, o.delivery_status,
        o.scheduled_date, o.scheduled_time,
        coalesce(cp.name, 'Cliente'), coalesce(cp.phone, ''), o.address,
        l.name, coalesce(l.phone, ''), l.address, coalesce(o.instructions, ''),
        case when o.delivery_status = 'courier_to_customer_return' then 'return' else 'pickup' end::text
      from public.orders o
      join public.laundries l on l.id = o.laundry_id
      join public.profiles cp on cp.id = o.client_id
      where o.courier_id = v_uid
      order by o.scheduled_date nulls last, o.created_at;
  else
    raise exception 'Filtro de entregas inválido.';
  end if;
end;
$$;

-- 4) Aceitação atômica: duas pessoas não conseguem aceitar a mesma corrida.
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
      set courier_id = v_uid, delivery_status = 'courier_to_customer',
          courier_accepted_at = now(), updated_at = now()
      where id = p_order_id and courier_id is null
        and status in ('confirmed', 'pickup_scheduled')
        and delivery_status = 'awaiting_pickup';
  elsif p_leg = 'return' then
    update public.orders
      set courier_id = v_uid, delivery_status = 'courier_to_customer_return',
          courier_accepted_at = now(), updated_at = now()
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

-- 5) Atualização limitada a três transições válidas e ao pedido atribuído ao usuário.
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
      where id = p_order_id and courier_id = v_uid and delivery_status = 'courier_to_customer';
  elsif p_next_status = 'at_laundry' then
    update public.orders set delivery_status = p_next_status, courier_id = null,
      delivered_to_laundry_at = now(), updated_at = now()
      where id = p_order_id and courier_id = v_uid and delivery_status = 'courier_to_laundry';
  elsif p_next_status = 'delivered_to_customer' then
    update public.orders set delivery_status = p_next_status, courier_id = null,
      delivered_to_customer_at = now(), status = 'delivered', current_step = 5,
      updated_at = now()
      where id = p_order_id and courier_id = v_uid
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
