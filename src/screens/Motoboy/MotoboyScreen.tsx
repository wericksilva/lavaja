import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
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
  created_at: string;
  delivered_to_laundry_at: string | null;
  delivered_to_customer_at: string | null;
  pickup_courier_id: string | null;
  return_courier_id: string | null;
  is_currently_assigned: boolean;
};

type Props = { onLogout: () => Promise<void>; onOpenProfile: () => void };
type Tab = 'dashboard' | 'available' | 'mine' | 'history';

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

function formatDate(value: string | null) {
  if (!value) return 'Não informado';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
}

export default function MotoboyScreen({ onLogout, onOpenProfile }: Props) {
  const [available, setAvailable] = useState<Delivery[]>([]);
  const [assigned, setAssigned] = useState<Delivery[]>([]);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selected, setSelected] = useState<Delivery | null>(null);
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
      showMessage('Não foi possível carregar as entregas', error instanceof Error ? error.message : 'Verifique se a migração SQL de melhorias do Motoboy foi executada no Supabase.');
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
      setSelected(null);
      showMessage('Corrida aceita!', 'A entrega foi vinculada à sua conta. Confira os detalhes e abra a rota para iniciar.');
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
        setSelected(null);
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

  const openRoute = (delivery: Delivery) => {
    const isReturn = delivery.leg === 'return';
    const origin = isReturn ? delivery.laundry_address : delivery.customer_address;
    const destination = isReturn ? delivery.customer_address : delivery.laundry_address;
    if (!origin.trim() || !destination.trim()) {
      showMessage('Endereço incompleto', 'O pedido precisa ter endereço de coleta e endereço da lavanderia cadastrados.');
      return;
    }
    // Sem origin explícita, o Google Maps usa a localização atual do motoboy.
    // O endereço de coleta entra como parada e o destino final como destino da rota.
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(origin)}&travelmode=driving`;
    void Linking.openURL(url).catch(() => showMessage('Não foi possível abrir o mapa', 'Verifique se há um navegador ou aplicativo de mapas instalado.'));
  };

  const activeAssigned = useMemo(() => assigned.filter((item) => item.is_currently_assigned), [assigned]);
  const history = useMemo(() => assigned.filter((item) => item.delivery_status === 'delivered_to_customer'), [assigned]);
  const completedAsReturn = useMemo(() => assigned.filter((item) => item.return_courier_id && item.delivery_status === 'delivered_to_customer').length, [assigned]);
  const pickupCount = useMemo(() => assigned.filter((item) => item.pickup_courier_id && ['at_laundry', 'awaiting_return', 'courier_to_customer_return', 'delivered_to_customer'].includes(item.delivery_status)).length, [assigned]);
  const totalRuns = useMemo(() => {
    const ids = new Set<string>();
    assigned.forEach((item) => {
      if (item.pickup_courier_id || item.return_courier_id) ids.add(item.id);
    });
    return ids.size;
  }, [assigned]);

  const nextAction = (item: Delivery) => item.delivery_status === 'courier_to_customer' ? 'Confirmar coleta no cliente'
    : item.delivery_status === 'courier_to_laundry' ? 'Confirmar entrega na lavanderia'
    : item.delivery_status === 'courier_to_customer_return' ? 'Confirmar entrega ao cliente' : '';

  const renderDelivery = (item: Delivery, historyMode = false) => {
    const isReturn = item.leg === 'return';
    const isAssigned = item.is_currently_assigned;
    const pickupAddress = isReturn ? item.laundry_address : item.customer_address;
    const destinationAddress = isReturn ? item.customer_address : item.laundry_address;
    const pickupName = isReturn ? item.laundry_name : item.customer_name;
    const destinationName = isReturn ? item.customer_name : item.laundry_name;
    const pickupIcon = isReturn ? 'storefront-outline' : 'person-outline';
    return (
      <View key={`${item.id}-${historyMode ? 'history' : item.leg}`} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.orderTag}><Ionicons name="receipt-outline" size={14} color={C.blue} /><Text style={styles.orderTagText}>{item.order_number || `#${item.id.slice(0, 8).toUpperCase()}`}</Text></View>
          <Text style={[styles.legTag, historyMode && { color: C.green }]}>{historyMode ? 'FINALIZADO' : isReturn ? 'RETORNO' : 'COLETA'}</Text>
        </View>
        <Text style={styles.service}>{item.service_name}</Text>
        <Text style={styles.stage}>{stageLabels[item.delivery_status] ?? 'Entrega disponível'}</Text>
        <View style={styles.routeRow}>
          <View style={styles.routeIcon}><Ionicons name={pickupIcon as 'person-outline' | 'storefront-outline'} size={17} color={C.blue} /></View>
          <View style={styles.routeText}><Text style={styles.routeLabel}>{isReturn ? 'Retirar na lavanderia' : 'Coletar no cliente'}</Text><Text style={styles.routeName}>{pickupName}</Text><Text style={styles.routeAddress}>{pickupAddress}</Text></View>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routeIcon}><Ionicons name={isReturn ? 'person-outline' : 'storefront-outline'} size={17} color={C.green} /></View>
          <View style={styles.routeText}><Text style={styles.routeLabel}>{isReturn ? 'Entregar ao cliente' : 'Entregar na lavanderia'}</Text><Text style={styles.routeName}>{destinationName}</Text><Text style={styles.routeAddress}>{destinationAddress}</Text></View>
        </View>
        {!!item.scheduled_date && <Text style={styles.meta}>Agendamento: {formatDate(item.scheduled_date)}{item.scheduled_time ? ` às ${item.scheduled_time}` : ''}</Text>}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.outlineButton} onPress={() => setSelected(item)}><Ionicons name="document-text-outline" size={16} color={C.blue} /><Text style={styles.outlineText}>Ver detalhes</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => openRoute(item)}><Ionicons name="navigate-outline" size={16} color={C.blue} /><Text style={styles.outlineText}>Ver rota</Text></TouchableOpacity>
        </View>
        {!historyMode && !isAssigned ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => void accept(item)} disabled={!!busyId}>
            {busyId === item.id ? <ActivityIndicator color="#fff" /> : <Ionicons name="bicycle-outline" size={19} color="#fff" />}
            <Text style={styles.primaryButtonText}>Aceitar entrega</Text>
          </TouchableOpacity>
        ) : !historyMode && !!nextAction(item) ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => void advance(item)} disabled={!!busyId}>
            {busyId === item.id ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />}
            <Text style={styles.primaryButtonText}>{nextAction(item)}</Text>
          </TouchableOpacity>
        ) : !historyMode ? <View style={styles.waiting}><Ionicons name="time-outline" size={17} color={C.green} /><Text style={styles.waitingText}>{item.delivery_status === 'at_laundry' ? 'Aguardando a lavanderia finalizar o serviço' : 'Etapa concluída'}</Text></View>
          : <Text style={styles.historyDate}>Concluído em {formatDate(item.delivered_to_customer_at ?? item.created_at)}</Text>}
      </View>
    );
  };

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} />}>
      <View style={styles.dashboardIntro}><Text style={styles.dashboardTitle}>Resumo das entregas</Text><Text style={styles.dashboardSub}>Acompanhe seu desempenho e suas corridas.</Text></View>
      <View style={styles.statsGrid}>
        <StatCard icon="bicycle-outline" label="Pedidos atendidos" value={totalRuns} tone="blue" />
        <StatCard icon="checkmark-done-outline" label="Entregas concluídas" value={completedAsReturn} tone="green" />
        <StatCard icon="time-outline" label="Em andamento" value={activeAssigned.length} tone="orange" />
        <StatCard icon="navigate-outline" label="Disponíveis" value={available.length} tone="purple" />
      </View>
      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStat}><Text style={styles.secondaryValue}>{pickupCount}</Text><Text style={styles.secondaryLabel}>Coletas encaminhadas à lavanderia</Text></View>
        <View style={styles.secondaryDivider} />
        <View style={styles.secondaryStat}><Text style={styles.secondaryValue}>{history.length}</Text><Text style={styles.secondaryLabel}>Pedidos no histórico</Text></View>
      </View>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Próximas ações</Text><TouchableOpacity onPress={() => setTab('mine')}><Text style={styles.seeAll}>Ver minhas entregas</Text></TouchableOpacity></View>
      {activeAssigned.length ? activeAssigned.slice(0, 3).map((item) => renderDelivery(item)) : <EmptyState icon="bicycle-outline" title="Nenhuma entrega em andamento" text="Quando aceitar uma corrida, ela aparecerá aqui." />}
      <TouchableOpacity style={styles.findRunsButton} onPress={() => setTab('available')}><Ionicons name="search-outline" size={18} color="#fff" /><Text style={styles.findRunsText}>Encontrar corridas disponíveis</Text></TouchableOpacity>
    </ScrollView>
  );

  const listForTab = tab === 'available' ? available : tab === 'mine' ? activeAssigned : history;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View><Text style={styles.brand}>Lava<Text style={{ color: C.blue }}>Já</Text></Text><Text style={styles.subtitle}>Painel do motoboy</Text></View>
        <View style={styles.headerActions}><TouchableOpacity onPress={onOpenProfile} style={styles.headerIcon}><Ionicons name="person-outline" size={21} color={C.blue} /></TouchableOpacity><TouchableOpacity onPress={() => void refresh()} style={styles.headerIcon}><Ionicons name="refresh-outline" size={20} color={C.blue} /></TouchableOpacity><TouchableOpacity onPress={() => void onLogout()} style={styles.headerIcon}><Ionicons name="log-out-outline" size={21} color="#D64545" /></TouchableOpacity></View>
      </View>
      <View style={styles.welcome}><View style={styles.welcomeIcon}><Ionicons name="bicycle" size={27} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={styles.welcomeTitle}>Olá, motoboy!</Text><Text style={styles.welcomeText}>Sua central de coletas e entregas.</Text></View></View>
      <View style={styles.tabs}>
        {([['dashboard', 'Resumo'], ['available', `Disponíveis (${available.length})`], ['mine', `Em andamento (${activeAssigned.length})`], ['history', 'Histórico']] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabActive]}><Text numberOfLines={1} style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text></TouchableOpacity>
        ))}
      </View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={C.blue} /><Text style={styles.emptyText}>Carregando painel...</Text></View> : tab === 'dashboard' ? renderDashboard() : (
        <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} />}>
          {listForTab.length ? listForTab.map((item) => renderDelivery(item, tab === 'history')) : <EmptyState icon={tab === 'available' ? 'bicycle-outline' : tab === 'history' ? 'time-outline' : 'clipboard-outline'} title={tab === 'available' ? 'Nenhuma entrega disponível' : tab === 'history' ? 'Seu histórico está vazio' : 'Nenhuma entrega em andamento'} text={tab === 'available' ? 'Novas coletas e retornos aparecerão aqui.' : tab === 'history' ? 'Os pedidos concluídos em que você participou aparecerão aqui.' : 'Quando aceitar uma corrida, ela aparecerá nesta área.'} />}
        </ScrollView>
      )}

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>DETALHES DO PEDIDO</Text><Text style={styles.modalTitle}>{selected?.order_number || (selected ? `#${selected.id.slice(0, 8).toUpperCase()}` : '')}</Text></View><TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}><Ionicons name="close" size={23} color={C.navy} /></TouchableOpacity></View>
            {selected && <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailStatus}><Ionicons name="information-circle-outline" size={18} color={C.blue} /><Text style={styles.detailStatusText}>{stageLabels[selected.delivery_status] ?? selected.status}</Text></View>
              <DetailLine icon="shirt-outline" label="Serviço" value={selected.service_name} />
              <DetailLine icon="calendar-outline" label="Agendamento" value={`${formatDate(selected.scheduled_date)}${selected.scheduled_time ? ` às ${selected.scheduled_time}` : ''}`} />
              <DetailLine icon="person-outline" label="Cliente" value={selected.customer_name} extra={selected.customer_phone || 'Telefone não cadastrado'} onExtra={() => callPhone(selected.customer_phone)} />
              <DetailLine icon="storefront-outline" label="Lavanderia" value={selected.laundry_name} extra={selected.laundry_phone || 'Telefone não cadastrado'} onExtra={() => callPhone(selected.laundry_phone)} />
              <DetailLine icon="location-outline" label="Endereço do cliente" value={selected.customer_address || 'Não informado'} />
              <DetailLine icon="location-outline" label="Endereço da lavanderia" value={selected.laundry_address || 'Não informado'} />
              <DetailLine icon="chatbubble-ellipses-outline" label="Instruções" value={selected.instructions || 'Nenhuma observação informada'} />
              <DetailLine icon="time-outline" label="Pedido criado em" value={new Date(selected.created_at).toLocaleString('pt-BR')} />
              <TouchableOpacity style={styles.primaryButton} onPress={() => openRoute(selected)}><Ionicons name="navigate-outline" size={19} color="#fff" /><Text style={styles.primaryButtonText}>Abrir rota no Google Maps</Text></TouchableOpacity>
              {selected.is_currently_assigned && !!nextAction(selected) && <TouchableOpacity style={styles.modalSecondary} onPress={() => void advance(selected)}><Ionicons name="checkmark-circle-outline" size={18} color={C.blue} /><Text style={styles.modalSecondaryText}>{nextAction(selected)}</Text></TouchableOpacity>}
            </ScrollView>}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; tone: 'blue' | 'green' | 'orange' | 'purple' }) {
  const tones = { blue: { backgroundColor: '#EAF2FF', color: C.blue }, green: { backgroundColor: '#EAF8F2', color: C.green }, orange: { backgroundColor: '#FFF4E8', color: '#D9822B' }, purple: { backgroundColor: '#F3EDFF', color: '#805AD5' } };
  return <View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: tones[tone].backgroundColor }]}><Ionicons name={icon} size={20} color={tones[tone].color} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function DetailLine({ icon, label, value, extra, onExtra }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; extra?: string; onExtra?: () => void }) {
  return <View style={styles.detailLine}><View style={styles.detailIcon}><Ionicons name={icon} size={17} color={C.blue} /></View><View style={styles.detailText}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text>{!!extra && <TouchableOpacity disabled={!onExtra} onPress={onExtra}><Text style={[styles.detailExtra, !onExtra && { color: C.muted }]}>{extra}</Text></TouchableOpacity>}</View></View>;
}

function EmptyState({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return <View style={styles.empty}><Ionicons name={icon} size={42} color={C.muted} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' },
  brand: { fontSize: 25, fontWeight: '900', color: C.navy }, subtitle: { color: C.muted, fontSize: 12, marginTop: 2 }, headerActions: { flexDirection: 'row', gap: 7 }, headerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  welcome: { margin: 14, marginBottom: 10, padding: 14, borderRadius: 18, backgroundColor: '#EAF2FF', flexDirection: 'row', alignItems: 'center', gap: 12 }, welcomeIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, welcomeTitle: { color: C.navy, fontSize: 17, fontWeight: '900' }, welcomeText: { color: C.muted, fontSize: 12, marginTop: 3 },
  tabs: { marginHorizontal: 12, padding: 4, backgroundColor: '#E8EEF5', borderRadius: 13, flexDirection: 'row', gap: 2 }, tab: { flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 3, alignItems: 'center', borderRadius: 10 }, tabActive: { backgroundColor: '#fff' }, tabText: { color: C.muted, fontSize: 10, fontWeight: '700' }, tabTextActive: { color: C.blue },
  list: { padding: 14, paddingBottom: 34, gap: 13 }, card: { backgroundColor: '#fff', borderRadius: 18, padding: 15, borderWidth: 1, borderColor: C.line }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, orderTag: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: C.paleBlue, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 }, orderTagText: { color: C.blue, fontSize: 11, fontWeight: '800' }, legTag: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, service: { fontSize: 18, color: C.navy, fontWeight: '900', marginTop: 12 }, stage: { color: C.blue, fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 10 },
  routeRow: { flexDirection: 'row', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#EEF2F6' }, routeIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F0F5FC', alignItems: 'center', justifyContent: 'center' }, routeText: { flex: 1 }, routeLabel: { fontSize: 10, color: C.muted, fontWeight: '700', textTransform: 'uppercase' }, routeName: { color: C.navy, fontSize: 13, fontWeight: '800', marginTop: 3 }, routeAddress: { color: '#526579', fontSize: 12, lineHeight: 18, marginTop: 2 }, meta: { color: C.muted, fontSize: 11, marginTop: 7 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 }, outlineButton: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }, outlineText: { color: C.blue, fontSize: 11, fontWeight: '800' }, primaryButton: { marginTop: 12, backgroundColor: C.blue, borderRadius: 12, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '900' }, waiting: { marginTop: 12, padding: 12, borderRadius: 11, backgroundColor: '#EAF8F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, waitingText: { color: C.green, fontSize: 12, fontWeight: '800' }, historyDate: { color: C.green, fontSize: 11, fontWeight: '700', marginTop: 12 },
  dashboardIntro: { marginBottom: 1 }, dashboardTitle: { fontSize: 20, fontWeight: '900', color: C.navy }, dashboardSub: { color: C.muted, fontSize: 12, marginTop: 4 }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, statCard: { width: '48%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14, minHeight: 128 }, statIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, statValue: { fontSize: 25, color: C.navy, fontWeight: '900' }, statLabel: { fontSize: 11, color: C.muted, marginTop: 3 }, secondaryStats: { backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: C.line, padding: 15, flexDirection: 'row', alignItems: 'center' }, secondaryStat: { flex: 1 }, secondaryValue: { color: C.navy, fontSize: 20, fontWeight: '900' }, secondaryLabel: { color: C.muted, fontSize: 10, marginTop: 3 }, secondaryDivider: { width: 1, height: 38, backgroundColor: C.line, marginHorizontal: 12 }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, sectionTitle: { fontSize: 15, fontWeight: '900', color: C.navy }, seeAll: { color: C.blue, fontSize: 11, fontWeight: '800' }, findRunsButton: { backgroundColor: C.blue, borderRadius: 13, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, findRunsText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }, empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 28, marginTop: 12 }, emptyTitle: { color: C.navy, fontSize: 16, fontWeight: '900', marginTop: 12, textAlign: 'center' }, emptyText: { color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 19, marginTop: 6 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,25,45,0.45)' }, modalSheet: { maxHeight: '92%', backgroundColor: '#F8FAFD', borderTopLeftRadius: 23, borderTopRightRadius: 23, paddingTop: 18 }, modalHeader: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modalEyebrow: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, modalTitle: { color: C.navy, fontSize: 21, fontWeight: '900', marginTop: 4 }, modalClose: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center' }, modalContent: { padding: 18, paddingBottom: 34, gap: 13 }, detailStatus: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#EAF2FF', padding: 12, borderRadius: 12 }, detailStatusText: { color: C.blue, fontWeight: '800', fontSize: 12 }, detailLine: { flexDirection: 'row', gap: 11, backgroundColor: '#fff', padding: 12, borderRadius: 13, borderWidth: 1, borderColor: C.line }, detailIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EFF5FC', alignItems: 'center', justifyContent: 'center' }, detailText: { flex: 1 }, detailLabel: { color: C.muted, fontSize: 10, fontWeight: '800' }, detailValue: { color: C.navy, fontSize: 13, fontWeight: '700', marginTop: 3, lineHeight: 19 }, detailExtra: { color: C.blue, fontSize: 11, fontWeight: '700', marginTop: 4 }, modalSecondary: { padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.blue, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, modalSecondaryText: { color: C.blue, fontSize: 12, fontWeight: '900' },
});
