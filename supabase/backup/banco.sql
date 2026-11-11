create table public.profiles (
  id uuid not null,
  name text not null default ''::text,
  email text not null default ''::text,
  phone text not null default ''::text,
  account_type text not null default 'client'::text,
  avatar_url text null,
  default_address text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_account_type_check check (
    (
      account_type = any (array['client'::text, 'store'::text])
    )
  )
) TABLESPACE pg_default;


create table public.app_notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  order_id uuid not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint app_notifications_pkey primary key (id),
  constraint app_notifications_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint app_notifications_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists app_notifications_user_created_idx on public.app_notifications using btree (user_id, created_at desc) TABLESPACE pg_default;


create table public.expo_push_tokens (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  expo_push_token text not null,
  platform text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint expo_push_tokens_pkey primary key (id),
  constraint expo_push_tokens_expo_push_token_key unique (expo_push_token),
  constraint expo_push_tokens_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists expo_push_tokens_user_idx on public.expo_push_tokens using btree (user_id) TABLESPACE pg_default;



create table public.laundries (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  name text not null,
  description text not null default ''::text,
  address text not null default ''::text,
  phone text not null default ''::text,
  image_url text null,
  delivery_fee numeric(10, 2) not null default 8.90,
  estimated_delivery text not null default ''::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint laundries_pkey primary key (id),
  constraint laundries_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete CASCADE,
  constraint laundries_delivery_fee_check check ((delivery_fee >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_laundries_owner_id on public.laundries using btree (owner_id) TABLESPACE pg_default;

create index IF not exists idx_laundries_is_active on public.laundries using btree (is_active) TABLESPACE pg_default;

create table public.laundry_services (
  id uuid not null default gen_random_uuid (),
  laundry_id uuid not null,
  name text not null,
  description text not null default ''::text,
  price numeric(10, 2) not null,
  estimated_duration text not null default ''::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint laundry_services_pkey primary key (id),
  constraint laundry_services_laundry_id_fkey foreign KEY (laundry_id) references laundries (id) on delete CASCADE,
  constraint laundry_services_price_check check ((price >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_laundry_services_laundry_id on public.laundry_services using btree (laundry_id) TABLESPACE pg_default;

create table public.order_messages (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  sender_id uuid not null,
  message text not null,
  created_at timestamp with time zone not null default now(),
  read_at timestamp with time zone null,
  constraint order_messages_pkey primary key (id),
  constraint order_messages_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_messages_sender_id_fkey foreign KEY (sender_id) references profiles (id) on delete CASCADE,
  constraint order_messages_message_check check (
    (
      (
        char_length(
          TRIM(
            both
            from
              message
          )
        ) >= 1
      )
      and (
        char_length(
          TRIM(
            both
            from
              message
          )
        ) <= 2000
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists order_messages_order_created_idx on public.order_messages using btree (order_id, created_at) TABLESPACE pg_default;


create table public.orders (
  id uuid not null default gen_random_uuid (),
  order_number text null,
  client_id uuid not null,
  laundry_id uuid not null,
  service_id uuid null,
  service_name text not null,
  service_price numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  status text not null default 'pending'::text,
  current_step integer not null default 0,
  scheduled_date date null,
  scheduled_time text null,
  address text not null,
  instructions text not null default ''::text,
  payment_method text not null default 'Pix'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  cancelled_at timestamp with time zone null,
  cancellation_reason text null,
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_client_id_fkey foreign KEY (client_id) references profiles (id),
  constraint orders_laundry_id_fkey foreign KEY (laundry_id) references laundries (id),
  constraint orders_service_id_fkey foreign KEY (service_id) references laundry_services (id) on delete set null,
  constraint orders_current_step_check check (
    (
      (current_step >= 0)
      and (current_step <= 5)
    )
  ),
  constraint orders_total_check check ((total >= (0)::numeric)),
  constraint orders_service_price_check check ((service_price >= (0)::numeric)),
  constraint orders_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'pickup_scheduled'::text,
          'picked_up'::text,
          'washing'::text,
          'ready'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  ),
  constraint orders_delivery_fee_check check ((delivery_fee >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_orders_client_id on public.orders using btree (client_id) TABLESPACE pg_default;

create index IF not exists idx_orders_laundry_id on public.orders using btree (laundry_id) TABLESPACE pg_default;

create index IF not exists idx_orders_status on public.orders using btree (status) TABLESPACE pg_default;

create index IF not exists idx_orders_created_at on public.orders using btree (created_at desc) TABLESPACE pg_default;

create trigger orders_notifications_after_insert
after INSERT on orders for EACH row
execute FUNCTION create_order_status_notifications ();

create trigger orders_notifications_after_status_update
after
update OF status on orders for EACH row
execute FUNCTION create_order_status_notifications ();

create table public.payments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  amount numeric(10, 2) not null,
  method text not null,
  status text not null default 'pending'::text,
  transaction_reference text null,
  paid_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_order_id_key unique (order_id),
  constraint payments_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint payments_amount_check check ((amount >= (0)::numeric)),
  constraint payments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'paid'::text,
          'failed'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  name text not null default ''::text,
  email text not null default ''::text,
  phone text not null default ''::text,
  account_type text not null default 'client'::text,
  avatar_url text null,
  default_address text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_account_type_check check (
    (
      account_type = any (array['client'::text, 'store'::text])
    )
  )
) TABLESPACE pg_default;


create view public.review_details
with
  (security_barrier = true) as
select
  r.id,
  r.order_id,
  r.laundry_id,
  r.client_id,
  r.rating,
  r.comment,
  r.created_at,
  p.name as client_name,
  p.avatar_url as client_avatar_url
from
  reviews r
  join profiles p on p.id = r.client_id;
  
  
  create table public.reviews (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  laundry_id uuid not null,
  client_id uuid not null,
  rating integer not null,
  comment text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  constraint reviews_pkey primary key (id),
  constraint reviews_order_id_key unique (order_id),
  constraint reviews_client_id_fkey foreign KEY (client_id) references profiles (id) on delete CASCADE,
  constraint reviews_laundry_id_fkey foreign KEY (laundry_id) references laundries (id) on delete CASCADE,
  constraint reviews_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_reviews_laundry_id on public.reviews using btree (laundry_id) TABLESPACE pg_default;

create index IF not exists idx_reviews_client_id on public.reviews using btree (client_id) TABLESPACE pg_default;


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
