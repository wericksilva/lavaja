import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth = req.headers.get('Authorization') ?? '';
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) return new Response('Unauthorized', { status: 401, headers: cors });
    const { order_id, status } = await req.json();
    const admin = createClient(url, service);
    const { data: order, error } = await admin.from('orders').select('id, order_number, client_id, laundry_id, service_name, status, laundries(owner_id)').eq('id', order_id).single();
    if (error || !order) throw new Error('Pedido não encontrado.');
    const ownerId = (order.laundries as { owner_id?: string } | null)?.owner_id;
    if (authData.user.id !== order.client_id && authData.user.id !== ownerId) return new Response('Forbidden', { status: 403, headers: cors });
    const targets = [order.client_id, ownerId].filter((id): id is string => Boolean(id) && id !== authData.user.id);
    if (!targets.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    const { data: tokens } = await admin.from('expo_push_tokens').select('expo_push_token').in('user_id', targets);
    const labels: Record<string, string> = { pending: 'Pedido recebido', pickup_scheduled: 'Coleta agendada', picked_up: 'Roupas coletadas', washing: 'Em lavagem', ready: 'Pronto para entrega', delivered: 'Pedido entregue', cancelled: 'Pedido cancelado' };
    const friendlyStatus = labels[String(status)] ?? String(status);
    const messages = (tokens ?? []).map((row) => ({ to: row.expo_push_token, sound: 'default', title: `Atualização do pedido ${order.order_number}`, body: `Seu pedido ${order.service_name}: ${friendlyStatus}.`, data: { orderId: order.id, status } }));
    let sent = 0;
    if (messages.length) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(messages) });
      if (!response.ok) throw new Error('Falha ao enviar notificação Expo.');
      sent = messages.length;
    }
    return new Response(JSON.stringify({ sent }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao enviar notificação.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
