import { supabase } from './supabase';
import { paymentFromDbValue } from '../utils/payment';

export type DbLaundry = {
  id: string; name: string; description: string; address: string; phone: string;
  image_url: string | null; delivery_fee: number; estimated_delivery: string; is_active: boolean;
};

export type DbLaundryService = {
  id: string;
  laundry_id: string;
  name: string;
  description: string | null;
  price: number | string;
  estimated_duration: string | null;
  is_active: boolean;
  created_at?: string;
};

export async function ensureStoreLaundry(ownerId: string, name: string, phone = '') {
  const { data: existing, error: readError } = await supabase
    .from('laundries').select('*').eq('owner_id', ownerId).maybeSingle();
  if (readError) throw readError;
  if (existing) return existing as DbLaundry;
  const { data, error } = await supabase.from('laundries').insert({
    owner_id: ownerId, name: name.trim() || 'Minha lavanderia', description: '',
    address: '', phone, delivery_fee: 8.9, estimated_delivery: '24 a 48 horas', is_active: true,
  }).select('*').single();
  if (error) throw error;
  return data as DbLaundry;
}

export async function getActiveLaundries() {
  const { data, error } = await supabase.from('laundries').select('*').eq('is_active', true).order('created_at');
  if (error) throw error;
  return (data ?? []) as DbLaundry[];
}

export async function getLaundryServices(laundryId: string, activeOnly = false): Promise<DbLaundryService[]> {
  let query = supabase
    .from('laundry_services')
    .select('id, laundry_id, name, description, price, estimated_duration, is_active, created_at')
    .eq('laundry_id', laundryId);

  if (activeOnly) query = query.eq('is_active', true);

  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbLaundryService[];
}

export async function getRelatedOrders(userId: string, isStore: boolean, laundryId?: string) {
  let query = supabase
    .from('orders')
    .select('*, laundries(name)');

  if (isStore) {
    if (!laundryId) {
      throw new Error('Não foi possível identificar a lavanderia desta conta.');
    }
    query = query.eq('laundry_id', laundryId);
  } else {
    query = query.eq('client_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  // Segunda validação no cliente para impedir que registros de outra
  // lavanderia apareçam mesmo se uma consulta/RLS estiver configurada errado.
  const rows = data ?? [];
  return isStore ? rows.filter((row) => row.laundry_id === laundryId) : rows;
}

type DbOrderRow = { id: string; order_number: string | null; service_name: string; scheduled_date: string | null; created_at: string; total: number | string; current_step: number | null; scheduled_time: string | null; address: string; instructions: string; payment_method: string; laundry_id: string; status?: string; payment_status?: string; laundries?: { name?: string } | null };

export function mapDbOrder(row: DbOrderRow) {
  return {
    id: row.order_number || `LJ-${String(row.id).slice(0, 8).toUpperCase()}`,
    dbId: row.id,
    service: row.service_name,
    date: row.scheduled_date ? new Date(`${row.scheduled_date}T12:00:00`).toLocaleDateString('pt-BR') : new Date(row.created_at).toLocaleDateString('pt-BR'),
    value: Number(row.total), currentStep: Number(row.current_step ?? 0),
    time: row.scheduled_time ?? '', address: row.address ?? '', instructions: row.instructions ?? '',
    payment: paymentFromDbValue(row.payment_method), laundryId: row.laundry_id, laundryName: row.laundries?.name ?? '', status: row.status,
  };
}
