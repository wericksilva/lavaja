-- LavaJá: notificações, chat e cancelamento por etapa.
-- Migration aditiva: não apaga nem altera dados existentes.

-- Campos de auditoria usados pelo cancelamento por etapa.
alter table public.orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists order_messages_order_created_idx on public.order_messages(order_id, created_at);
alter table public.order_messages enable row level security;
grant select, insert on public.order_messages to authenticated;
drop policy if exists order_messages_participant_read on public.order_messages;
create policy order_messages_participant_read on public.order_messages for select to authenticated using (exists (select 1 from public.orders o join public.laundries l on l.id=o.laundry_id where o.id=order_id and (o.client_id=auth.uid() or l.owner_id=auth.uid())));
drop policy if exists order_messages_participant_insert on public.order_messages;
create policy order_messages_participant_insert on public.order_messages for insert to authenticated with check (sender_id=auth.uid() and exists (select 1 from public.orders o join public.laundries l on l.id=o.laundry_id where o.id=order_id and (o.client_id=auth.uid() or l.owner_id=auth.uid())));

create table if not exists public.expo_push_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null unique, platform text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists expo_push_tokens_user_idx on public.expo_push_tokens(user_id);
alter table public.expo_push_tokens enable row level security;
grant select, insert, update, delete on public.expo_push_tokens to authenticated;
drop policy if exists expo_push_tokens_own_select on public.expo_push_tokens;
create policy expo_push_tokens_own_select on public.expo_push_tokens for select to authenticated using (user_id=auth.uid());
drop policy if exists expo_push_tokens_own_insert on public.expo_push_tokens;
create policy expo_push_tokens_own_insert on public.expo_push_tokens for insert to authenticated with check (user_id=auth.uid());
drop policy if exists expo_push_tokens_own_update on public.expo_push_tokens;
create policy expo_push_tokens_own_update on public.expo_push_tokens for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists expo_push_tokens_own_delete on public.expo_push_tokens;
create policy expo_push_tokens_own_delete on public.expo_push_tokens for delete to authenticated using (user_id=auth.uid());

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade, title text not null, body text not null,
  is_read boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists app_notifications_user_created_idx on public.app_notifications(user_id, created_at desc);
alter table public.app_notifications enable row level security;
grant select, update on public.app_notifications to authenticated;
drop policy if exists app_notifications_own_select on public.app_notifications;
create policy app_notifications_own_select on public.app_notifications for select to authenticated using (user_id=auth.uid());
drop policy if exists app_notifications_own_update on public.app_notifications;
create policy app_notifications_own_update on public.app_notifications for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- RPC segura para registrar o token do dispositivo do usuário autenticado.
create or replace function public.register_expo_push_token(p_token text, p_platform text default null) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Autenticação necessária.'; end if;
  if p_token is null or length(trim(p_token)) < 10 then raise exception 'Token push inválido.'; end if;
  insert into public.expo_push_tokens(user_id, expo_push_token, platform, updated_at) values(auth.uid(), trim(p_token), p_platform, now())
  on conflict(expo_push_token) do update set user_id=excluded.user_id, platform=excluded.platform, updated_at=now();
end; $$;
revoke all on function public.register_expo_push_token(text,text) from public;
grant execute on function public.register_expo_push_token(text,text) to authenticated;

-- Cancelamento sem dependência de gateway de pagamento.
create or replace function public.cancel_order(p_order_id uuid, p_reason text default '') returns jsonb language plpgsql security definer set search_path=public as $$
declare v_order public.orders%rowtype; v_owner_id uuid; v_is_store boolean;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Pedido não encontrado.'; end if;
  select owner_id into v_owner_id from public.laundries where id=v_order.laundry_id;
  v_is_store := (v_owner_id=auth.uid());
  if v_order.client_id<>auth.uid() and not v_is_store then raise exception 'Você não tem permissão para cancelar este pedido.'; end if;
  if v_order.status='cancelled' then raise exception 'Este pedido já foi cancelado.'; end if;
  if v_order.status='delivered' or coalesce(v_order.current_step,0)>=5 then raise exception 'Pedidos entregues não podem ser cancelados.'; end if;
  if v_is_store then
    if coalesce(v_order.current_step,0)>2 then raise exception 'A lavanderia só pode cancelar antes do início da lavagem.'; end if;
  else
    if coalesce(v_order.current_step,0)>1 then raise exception 'O cliente só pode cancelar antes da coleta das roupas.'; end if;
  end if;
  update public.orders set status='cancelled', cancelled_at=now(), cancellation_reason=left(coalesce(p_reason,''),500), updated_at=now() where id=p_order_id;
  return jsonb_build_object('success',true,'order_id',p_order_id,'status','cancelled');
end; $$;
revoke all on function public.cancel_order(uuid,text) from public;
grant execute on function public.cancel_order(uuid,text) to authenticated;

-- Cada novo pedido avisa a lavanderia; cada mudança de status avisa os dois participantes.
create or replace function public.create_order_status_notifications() returns trigger language plpgsql security definer set search_path=public as $$
declare v_owner_id uuid; v_title text; v_body text; v_label text;
begin
  select owner_id into v_owner_id from public.laundries where id=new.laundry_id;
  if tg_op='INSERT' then
    v_title := 'Novo pedido recebido';
    v_body := 'Novo pedido ' || coalesce(new.order_number, left(new.id::text,8)) || ': ' || coalesce(new.service_name,'serviço') || '.';
    if v_owner_id is not null then insert into public.app_notifications(user_id,order_id,title,body) values(v_owner_id,new.id,v_title,v_body); end if;
  elsif old.status is distinct from new.status then
    v_label := case new.status when 'pending' then 'Pedido recebido' when 'pickup_scheduled' then 'Coleta agendada' when 'picked_up' then 'Roupas coletadas' when 'washing' then 'Em lavagem' when 'ready' then 'Pronto para entrega' when 'delivered' then 'Pedido entregue' when 'cancelled' then 'Pedido cancelado' else new.status end;
    v_title := 'Atualização do pedido ' || coalesce(new.order_number,left(new.id::text,8));
    v_body := coalesce(new.service_name,'Seu serviço') || ': ' || v_label || '.';
    if new.client_id is not null then insert into public.app_notifications(user_id,order_id,title,body) values(new.client_id,new.id,v_title,v_body); end if;
    if v_owner_id is not null then insert into public.app_notifications(user_id,order_id,title,body) values(v_owner_id,new.id,v_title,v_body); end if;
  end if;
  return new;
end; $$;
drop trigger if exists orders_notifications_after_insert on public.orders;
create trigger orders_notifications_after_insert after insert on public.orders for each row execute function public.create_order_status_notifications();
drop trigger if exists orders_notifications_after_status_update on public.orders;
create trigger orders_notifications_after_status_update after update of status on public.orders for each row execute function public.create_order_status_notifications();

-- Realtime para mensagens e central de notificações.
do $$ begin alter publication supabase_realtime add table public.order_messages; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.app_notifications; exception when duplicate_object then null; when undefined_object then null; end $$;
