import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { C } from '../../constants/theme';

type Delivery = {
  id: string;
  order_number: string | null;
  service_name: string;
  status: string;
  delivery_status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  laundry_name: string;
  laundry_phone: string;
  laundry_address: string;
  instructions: string;
  leg: 'pickup' | 'return';
};

type Props = { onLogout: () => Promise<void>; onOpenProfile: () => void };

const stageLabels: Record<string, string> = {
  courier_to_customer: 'A caminho da coleta',
  courier_to_laundry: 'Levar à lavanderia',
  at_laundry: 'Aguardando processamento',
  awaiting_return: 'Aguardando retirada na lavanderia',
  courier_to_customer_return: 'A caminho da entrega final',
  delivered_to_customer: 'Entrega concluída',
};

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function MotoboyScreen({ onLogout, onOpenProfile }: Props) {
  const [available, setAvailable] = useState<Delivery[]>([]);
  const [assigned, setAssigned] = useState<Delivery[]>([]);
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    const [availableResult, assignedResult] = await Promise.all([
      supabase.rpc('motoboy_list_deliveries', { p_scope: 'available' }),
      supabase.rpc('motoboy_list_deliveries', { p_scope: 'assigned' }),
    ]);
    if (availableResult.error) throw availableResult.error;
    if (assignedResult.error) throw assignedResult.error;
    setAvailable((availableResult.data ?? []) as Delivery[]);
    setAssigned((assignedResult.data ?? []) as Delivery[]);
  }, []);

  useEffect(() => {
    let active = true;
    void load().catch((error: unknown) => {
      showMessage('Não foi possível carregar as entregas', error instanceof Error ? error.message : 'Verifique se a migração SQL do Motoboy foi executada no Supabase.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); }
    catch (error) { showMessage('Erro ao atualizar', error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setRefreshing(false); }
  };

  const accept = async (delivery: Delivery) => {
    if (busyId) return;
    setBusyId(delivery.id);
    try {
      const { error } = await supabase.rpc('motoboy_accept_delivery', { p_order_id: delivery.id, p_leg: delivery.leg });
      if (error) throw error;
      await load();
      setTab('mine');
      showMessage('Corrida aceita!', 'A entrega foi vinculada à sua conta. Confira o endereço e entre em contato com o cliente se necessário.');
    } catch (error) {
      showMessage('Não foi possível aceitar', error instanceof Error ? error.message : 'Esta corrida pode ter sido aceita por outro motoboy. Atualize a lista.');
    } finally { setBusyId(''); }
  };

  const advance = async (delivery: Delivery) => {
    if (busyId) return;
    const nextStage = delivery.delivery_status === 'courier_to_customer'
      ? 'courier_to_laundry'
      : delivery.delivery_status === 'courier_to_laundry'
        ? 'at_laundry'
        : delivery.delivery_status === 'courier_to_customer_return'
          ? 'delivered_to_customer'
          : '';
    if (!nextStage) return;
    const confirmText = nextStage === 'courier_to_laundry'
      ? 'Confirmar que as roupas foram coletadas no endereço do cliente?'
      : nextStage === 'at_laundry'
        ? 'Confirmar que as roupas foram entregues à lavanderia?'
        : 'Confirmar que as roupas foram entregues ao cliente?';
    const execute = async () => {
      setBusyId(delivery.id);
      try {
        const { error } = await supabase.rpc('motoboy_update_delivery', { p_order_id: delivery.id, p_next_status: nextStage });
        if (error) throw error;
        await load();
        showMessage('Etapa atualizada', nextStage === 'at_laundry' ? 'A lavanderia já pode processar o pedido. Você poderá aceitar a etapa de retorno quando ele estiver pronto.' : 'O andamento da entrega foi atualizado.');
      } catch (error) {
        showMessage('Não foi possível atualizar', error instanceof Error ? error.message : 'Tente novamente.');
      } finally { setBusyId(''); }
    };
    if (Platform.OS === 'web') { if (window.confirm(confirmText)) void execute(); }
    else Alert.alert('Confirmar etapa', confirmText, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => void execute() }]);
  };

  const callPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) { showMessage('Telefone indisponível', 'Não há telefone cadastrado para este contato.'); return; }
    void Linking.openURL(`tel:${digits}`);
  };

  const rows = tab === 'available' ? available : assigned;
  const assignedActive = useMemo(() => assigned.filter((item) => !['at_laundry', 'delivered_to_customer'].includes(item.delivery_status)), [assigned]);

  const renderDelivery = (item: Delivery) => {
    const isReturn = item.leg === 'return';
    const isAssigned = assigned.some((row) => row.id === item.id);
    const nextAction = item.delivery_status === 'courier_to_customer' ? 'Confirmar coleta no cliente'
      : item.delivery_status === 'courier_to_laundry' ? 'Confirmar entrega na lavanderia'
      : item.delivery_status === 'courier_to_customer_return' ? 'Confirmar entrega ao cliente'
      : '';
    return (
      <View key={`${item.id}-${item.leg}`} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.orderTag}><Ionicons name="receipt-outline" size={14} color={C.blue} /><Text style={styles.orderTagText}>{item.order_number || `#${item.id.slice(0, 8).toUpperCase()}`}</Text></View>
          <Text style={styles.legTag}>{isReturn ? 'RETORNO' : 'COLETA'}</Text>
        </View>
        <Text style={styles.service}>{item.service_name}</Text>
        <Text style={styles.stage}>{stageLabels[item.delivery_status] ?? 'Entrega disponível'}</Text>
        <View style={styles.routeRow}><View style={styles.routeIcon}><Ionicons name="person-outline" size={17} color={C.blue} /></View><View style={styles.routeText}><Text style={styles.routeLabel}>{isReturn ? 'Retirada na lavanderia / destino cliente' : 'Coletar no cliente'}</Text><Text style={styles.routeName}>{isReturn ? item.laundry_name : item.customer_name}</Text><Text style={styles.routeAddress}>{isReturn ? item.laundry_address : item.customer_address}</Text></View></View>
        <View style={styles.routeRow}><View style={styles.routeIcon}><Ionicons name="storefront-outline" size={17} color={C.green} /></View><View style={styles.routeText}><Text style={styles.routeLabel}>{isReturn ? 'Entregar ao cliente' : 'Entregar na lavanderia'}</Text><Text style={styles.routeName}>{isReturn ? item.customer_name : item.laundry_name}</Text><Text style={styles.routeAddress}>{isReturn ? item.customer_address : item.laundry_address}</Text></View></View>
        {!!item.scheduled_date && <Text style={styles.meta}>Agendamento: {new Date(`${item.scheduled_date}T12:00:00`).toLocaleDateString('pt-BR')}{item.scheduled_time ? ` às ${item.scheduled_time}` : ''}</Text>}
        {!!item.instructions && <Text style={styles.instructions}>Observações: {item.instructions}</Text>}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactButton} onPress={() => callPhone(isReturn ? item.laundry_phone : item.customer_phone)}><Ionicons name="call-outline" size={16} color={C.blue} /><Text style={styles.contactText}>Ligar para {isReturn ? 'lavanderia' : 'cliente'}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => callPhone(isReturn ? item.customer_phone : item.laundry_phone)}><Ionicons name="call-outline" size={16} color={C.blue} /><Text style={styles.contactText}>Ligar destino</Text></TouchableOpacity>
        </View>
        {!isAssigned ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => void accept(item)} disabled={!!busyId}>
            {busyId === item.id ? <ActivityIndicator color="#fff" /> : <Ionicons name="bicycle-outline" size={19} color="#fff" />}
            <Text style={styles.primaryButtonText}>Aceitar entrega</Text>
          </TouchableOpacity>
        ) : !!nextAction ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => void advance(item)} disabled={!!busyId}>
            {busyId === item.id ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />}
            <Text style={styles.primaryButtonText}>{nextAction}</Text>
          </TouchableOpacity>
        ) : <View style={styles.waiting}><Ionicons name="time-outline" size={17} color={C.green} /><Text style={styles.waitingText}>{item.delivery_status === 'at_laundry' ? 'Aguardando a lavanderia finalizar o serviço' : 'Etapa concluída'}</Text></View>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View><Text style={styles.brand}>Lava<Text style={{ color: C.blue }}>Já</Text></Text><Text style={styles.subtitle}>Painel do motoboy</Text></View>
        <View style={styles.headerActions}><TouchableOpacity onPress={onOpenProfile} style={styles.headerIcon}><Ionicons name="person-outline" size={21} color={C.blue} /></TouchableOpacity><TouchableOpacity onPress={() => void onLogout()} style={styles.headerIcon}><Ionicons name="log-out-outline" size={21} color="#D64545" /></TouchableOpacity></View>
      </View>
      <View style={styles.welcome}><View style={styles.welcomeIcon}><Ionicons name="bicycle" size={27} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={styles.welcomeTitle}>Suas entregas</Text><Text style={styles.welcomeText}>Aceite corridas e acompanhe cada etapa.</Text></View><TouchableOpacity onPress={() => void refresh()} style={styles.refresh}><Ionicons name="refresh" size={20} color={C.blue} /></TouchableOpacity></View>
      <View style={styles.tabs}><TouchableOpacity onPress={() => setTab('available')} style={[styles.tab, tab === 'available' && styles.tabActive]}><Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>Disponíveis ({available.length})</Text></TouchableOpacity><TouchableOpacity onPress={() => setTab('mine')} style={[styles.tab, tab === 'mine' && styles.tabActive]}><Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>Minhas entregas ({assignedActive.length})</Text></TouchableOpacity></View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={C.blue} /><Text style={styles.emptyText}>Carregando entregas...</Text></View> : (
        <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} />}>
          {rows.length ? rows.map(renderDelivery) : <View style={styles.empty}><Ionicons name={tab === 'available' ? 'bicycle-outline' : 'clipboard-outline'} size={42} color={C.muted} /><Text style={styles.emptyTitle}>{tab === 'available' ? 'Nenhuma entrega disponível' : 'Você ainda não tem entregas'}</Text><Text style={styles.emptyText}>{tab === 'available' ? 'Novas coletas e retornos aparecerão aqui.' : 'Quando aceitar uma corrida, ela aparecerá nesta área.'}</Text><TouchableOpacity onPress={() => void refresh()}><Text style={styles.refreshLink}>Atualizar lista</Text></TouchableOpacity></View>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' },
  brand: { fontSize: 25, fontWeight: '900', color: C.navy }, subtitle: { color: C.muted, fontSize: 12, marginTop: 2 }, headerActions: { flexDirection: 'row', gap: 10 }, headerIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  welcome: { margin: 16, marginBottom: 12, padding: 16, borderRadius: 18, backgroundColor: '#EAF2FF', flexDirection: 'row', alignItems: 'center', gap: 12 }, welcomeIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, welcomeTitle: { color: C.navy, fontSize: 17, fontWeight: '900' }, welcomeText: { color: C.muted, fontSize: 12, marginTop: 3 }, refresh: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  tabs: { marginHorizontal: 16, padding: 4, backgroundColor: '#E8EEF5', borderRadius: 13, flexDirection: 'row' }, tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 10 }, tabActive: { backgroundColor: '#fff' }, tabText: { color: C.muted, fontSize: 12, fontWeight: '700' }, tabTextActive: { color: C.blue },
  list: { padding: 16, paddingBottom: 36, gap: 14 }, card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, orderTag: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: C.paleBlue, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 }, orderTagText: { color: C.blue, fontSize: 11, fontWeight: '800' }, legTag: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, service: { fontSize: 18, color: C.navy, fontWeight: '900', marginTop: 13 }, stage: { color: C.blue, fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  routeRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEF2F6' }, routeIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F0F5FC', alignItems: 'center', justifyContent: 'center' }, routeText: { flex: 1 }, routeLabel: { fontSize: 10, color: C.muted, fontWeight: '700', textTransform: 'uppercase' }, routeName: { color: C.navy, fontSize: 13, fontWeight: '800', marginTop: 3 }, routeAddress: { color: '#526579', fontSize: 12, lineHeight: 18, marginTop: 2 }, meta: { color: C.muted, fontSize: 11, marginTop: 7 }, instructions: { color: '#526579', fontSize: 12, marginTop: 8, lineHeight: 18 }, contactRow: { flexDirection: 'row', gap: 8, marginTop: 12 }, contactButton: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }, contactText: { color: C.blue, fontSize: 10, fontWeight: '800' }, primaryButton: { marginTop: 13, backgroundColor: C.blue, borderRadius: 12, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '900' }, waiting: { marginTop: 13, padding: 12, borderRadius: 11, backgroundColor: '#EAF8F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, waitingText: { color: C.green, fontSize: 12, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }, empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 28, marginTop: 20 }, emptyTitle: { color: C.navy, fontSize: 16, fontWeight: '900', marginTop: 12, textAlign: 'center' }, emptyText: { color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 19, marginTop: 6 }, refreshLink: { color: C.blue, fontSize: 12, fontWeight: '800', marginTop: 16 },
});
