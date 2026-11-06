

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './src/lib/supabase';
import { ensureStoreLaundry, getActiveLaundries, getRelatedOrders, mapDbOrder } from './src/lib/database';


import type { Screen, Service, PaymentMethod } from './src/types';
import { services, type ServiceItem } from './src/data/services';
import type { Laundry } from './src/data/laundries';

import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen, {
  type AccountType,
} from './src/screens/Register/RegisterScreen';
import HomeScreen, { type DashboardData } from './src/screens/Home/HomeScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import ConfirmationScreen from './src/screens/Confirmation/ConfirmationScreen';
import OrdersScreen, {
  type Review,
} from './src/screens/Orders/OrdersScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupport/HelpSupportScreen';
import ForgotPasswordScreen from './src/screens/ForgotPassword/ForgotPasswordScreen';
import TrackingScreen from './src/screens/Tracking/TrackingScreen';
import AdminScreen from './src/screens/Admin/AdminScreen';
import LaundryDetailsScreen from './src/screens/LaundryDetails/LaundryDetailsScreen';
import ServicesScreen from './src/screens/Services/ServicesScreen';

import type { LaundryOrder } from './src/types/order';
import { formatDatePtBr, getTodayISODate } from './src/utils/date';
import { paymentToDbValue } from './src/utils/payment';
import ChatScreen from './src/screens/Chat/ChatScreen';
import ReportsScreen from './src/screens/Reports/ReportsScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });

export default function App() {
  // Navegação
  const [screen, setScreen] = useState<Screen>('login');

  // Avaliações dos pedidos
  const [reviews, setReviews] = useState<Review[]>([]);

  // Dados do usuário
  const [profileId, setProfileId] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [storeLaundryId, setStoreLaundryId] = useState('');
  const [availableLaundries, setAvailableLaundries] = useState<Laundry[]>([]);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceItem>(services[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Tipo de conta
  const [accountType, setAccountType] = useState<AccountType>('client');

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    receivedToday: 0,
    pending: 0,
    inProgress: 0,
    completedMonth: 0,
    ordersValueMonth: 0,
    weeklyRevenue: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Registra o dispositivo no Expo Push e vincula o token ao usuário logado.
  useEffect(() => {
    if (!profileId || Platform.OS === 'web') return;
    let active = true;
    const registerPushToken = async () => {
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) return; // Configure o projectId após executar eas init.
        const permission = await Notifications.getPermissionsAsync();
        let granted = permission.granted;
        if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
        if (!granted || !active) return;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', { name: 'Atualizações de pedidos', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250], lightColor: '#1769E0' });
        }
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (!active || !token) return;
        setPushToken(token);
        await supabase.rpc('register_expo_push_token', { p_token: token, p_platform: Platform.OS });
      } catch { /* Push é opcional; não deve impedir o uso do app. */ }
    };
    void registerPushToken();
    return () => { active = false; };
  }, [profileId]);

  // Atualiza o contador de notificações não lidas em tempo real.
  useEffect(() => {
    if (!profileId) { setUnreadNotifications(0); return; }
    let active = true;
    const loadCount = async () => {
      const { count } = await supabase.from('app_notifications').select('id', { count: 'exact', head: true }).eq('user_id', profileId).eq('is_read', false);
      if (active) setUnreadNotifications(count ?? 0);
    };
    void loadCount();
    const channel = supabase.channel(`notifications-${profileId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications', filter: `user_id=eq.${profileId}` }, () => { void loadCount(); }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [profileId]);

  // Restaura a sessão e carrega o perfil salvo no Supabase
  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user || !mounted) return;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, phone, account_type, default_address')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!mounted) return;

      let currentProfile = profile;

      // Recupera o perfil caso a conta Auth exista, mas o registro em
      // public.profiles não tenha sido criado pelo trigger.
      if (!currentProfile && !profileError) {
        const metadata = session.user.user_metadata ?? {};
        const { data: recoveredProfile, error: recoveryError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            name: String(metadata.name ?? ''),
            email: session.user.email ?? '',
            phone: String(metadata.phone ?? ''),
            account_type: metadata.account_type === 'store' ? 'store' : 'client',
            default_address: '',
          }, { onConflict: 'id' })
          .select('id, name, email, phone, account_type, default_address')
          .single();

        if (recoveryError || !recoveredProfile) {
          if (Platform.OS === 'web') {
            window.alert(`Não foi possível carregar seu perfil.\n\n${recoveryError?.message ?? profileError?.message ?? 'Verifique as permissões da tabela profiles.'}`);
          } else {
            Alert.alert('Perfil não encontrado', recoveryError?.message ?? 'Verifique as permissões da tabela profiles.');
          }
          return;
        }
        currentProfile = recoveredProfile;
      }

      if (profileError || !currentProfile) {
        if (Platform.OS === 'web') {
          window.alert(`Erro ao consultar perfil.\n\n${profileError?.message ?? 'Perfil não encontrado.'}`);
        } else {
          Alert.alert('Erro ao consultar perfil', profileError?.message ?? 'Perfil não encontrado.');
        }
        return;
      }

      const type: AccountType = currentProfile.account_type === 'store' ? 'store' : 'client';
      setName(currentProfile.name ?? '');
      setEmail(session.user.email ?? '');
      setPhone(currentProfile.phone ?? '');
      setAddress(currentProfile.default_address ?? '');
      setAccountType(type);
      await loadWorkspace(session.user.id, type, currentProfile.name ?? '', currentProfile.phone ?? '');
      setScreen('home');
    };
    void restoreSession();
    return () => { mounted = false; };
  }, []);

  // Lavanderia selecionada
  const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

  // Dados do pedido
  const [address, setAddress] = useState('');
  const [service, setService] = useState<Service>('Lavagem e dobra');
  const [date, setDate] = useState(getTodayISODate());
  const [time, setTime] = useState('14:00');

  const [payment, setPayment] = useState<PaymentMethod>('Pagar na entrega');
  const [instructions, setInstructions] = useState('');

  const [orderNumber, setOrderNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const creatingOrderRef = useRef(false);

  // Pedidos
  const [orders, setOrders] = useState<LaundryOrder[]>([]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { orderId?: string };
      if (!data.orderId) return;
      const order = orders.find((item) => (item as LaundryOrder & { dbId?: string }).dbId === data.orderId);
      if (order) {
        setSelectedOrderId(order.id);
        setScreen('tracking');
      } else {
        setScreen('notifications');
      }
    });
    return () => subscription.remove();
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState('LJ-2048');

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  const selectedService = selectedServiceDetails;

  // Busca os indicadores diretamente da tabela orders no Supabase.
  const loadStoreDashboard = async (laundryId: string) => {
    if (!laundryId) return;

    setDashboardLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, laundry_id, total, status, created_at')
        .eq('laundry_id', laundryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data ?? []).filter((order) => order.laundry_id === laundryId);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      const todayTime = startOfToday.getTime();
      const monthTime = startOfMonth.getTime();

      const notCancelled = rows.filter((order) => order.status !== 'cancelled');
      const receivedToday = notCancelled.filter(
        (order) => new Date(order.created_at).getTime() >= todayTime,
      ).length;

      const pending = rows.filter((order) => order.status === 'pending').length;
      const inProgress = rows.filter((order) =>
        ['confirmed', 'pickup_scheduled', 'picked_up', 'washing', 'ready'].includes(order.status),
      ).length;

      const monthOrders = notCancelled.filter((order) => {
        const createdAt = new Date(order.created_at).getTime();
        return createdAt >= monthTime && createdAt <= now.getTime();
      });

      const completedMonth = monthOrders.filter((order) => order.status === 'delivered').length;
      const ordersValueMonth = monthOrders.reduce(
        (sum, order) => sum + Number(order.total ?? 0),
        0,
      );

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weeklyRevenue = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + index);
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        const value = notCancelled
          .filter((order) => {
            const createdAt = new Date(order.created_at).getTime();
            return createdAt >= dayStart && createdAt < dayEnd;
          })
          .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

        return { day: dayNames[day.getDay()], value };
      });

      // Ordena os sete dias do mais antigo ao mais recente, começando há seis dias.
      setDashboardData({
        receivedToday,
        pending,
        inProgress,
        completedMonth,
        ordersValueMonth,
        weeklyRevenue,
      });
    } catch (error) {
      showAppMessage(
        'Erro ao carregar dashboard',
        error instanceof Error ? error.message : 'Não foi possível consultar os pedidos da lavanderia.',
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadWorkspace = async (userId: string, type: AccountType, displayName: string, userPhone: string) => {
    setProfileId(userId);
    // Limpa dados da sessão anterior antes de carregar os dados da conta atual.
    setOrders([]);
    setReviews([]);
    setAvailableLaundries([]);
    setStoreLaundryId('');

    try {
      if (type === 'store') {
        const laundry = await ensureStoreLaundry(userId, displayName, userPhone);
        setStoreLaundryId(laundry.id);
        const rows = await getRelatedOrders(userId, true, laundry.id);
        const storeRows = rows.filter((row) => row.laundry_id === laundry.id);
        setOrders(storeRows.map((row) => mapDbOrder(row as Parameters<typeof mapDbOrder>[0])));
        await loadStoreDashboard(laundry.id);
        setSelectedLaundry({ id: laundry.id, name: laundry.name, rating: '0,0', distance: '', deliveryFee: Number(laundry.delivery_fee), address: laundry.address, description: laundry.description });
      } else {
        const [laundriesRows, orderRows] = await Promise.all([
          getActiveLaundries(),
          getRelatedOrders(userId, false),
        ]);

        const mappedOrders = orderRows.map((row) =>
          mapDbOrder(row as Parameters<typeof mapDbOrder>[0]),
        );

        setAvailableLaundries(
          laundriesRows.map((item) => ({
            id: item.id,
            name: item.name,
            rating: '0,0',
            distance: '',
            deliveryFee: Number(item.delivery_fee),
            address: item.address,
            description: item.description,
          })),
        );
        setOrders(mappedOrders);

        // Carrega avaliações públicas de todas as lavanderias. A tela de
        // detalhes filtra por laundryId, enquanto Meus pedidos usa orderId.
        const { data: reviewRows, error: reviewsError } = await supabase
          .from('reviews')
          .select('order_id, laundry_id, rating, comment, created_at')
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        const orderIdByDatabaseId = new Map<string, string>();
        mappedOrders.forEach((order) => {
          const dbId = (order as LaundryOrder & { dbId?: string }).dbId;
          if (dbId) orderIdByDatabaseId.set(dbId, order.id);
        });

        setReviews(
          (reviewRows ?? []).map((review) => ({
            // Para pedidos do próprio cliente, usa o número amigável LJ-...;
            // para avaliações de outros clientes, o UUID não coincide com
            // nenhum pedido da tela Meus pedidos e não interfere nela.
            orderId: orderIdByDatabaseId.get(review.order_id) ?? review.order_id,
            laundryId: review.laundry_id,
            rating: Number(review.rating),
            comment: review.comment ?? '',
            createdAt: review.created_at,
          })),
        );
      }
    } catch (error) {
      showAppMessage('Erro ao carregar dados', error instanceof Error ? error.message : 'Não foi possível consultar o Supabase.');
    }
  };

  // Retorna à tela inicial sem encerrar a sessão
  const goHome = () => {
    setScreen('home');
  };

  const refreshOrders = async () => {
    if (!profileId) return;
    await loadWorkspace(profileId, accountType, name, phone);
  };

  // Salva a avaliação no Supabase e só atualiza a interface após confirmar.
  const submitReview = async (
    orderId: string,
    rating: number,
    comment: string,
  ): Promise<boolean> => {
    const order = orders.find((item) => item.id === orderId);

    if (!order || order.currentStep !== 5) {
      showAppMessage(
        'Pedido não entregue',
        'Você só pode avaliar um pedido depois da entrega.',
      );
      return false;
    }

    if (reviews.some((review) => review.orderId === orderId)) {
      showAppMessage('Atenção', 'Este pedido já foi avaliado.');
      return false;
    }

    const dbOrderId = (order as LaundryOrder & { dbId?: string }).dbId;
    if (!dbOrderId || !profileId) {
      showAppMessage(
        'Não foi possível avaliar',
        'Não encontramos o identificador do pedido ou do cliente no banco de dados.',
      );
      return false;
    }

    try {
      // Busca os dados oficiais do pedido. Assim não dependemos de valores
      // locais para preencher order_id, laundry_id ou validar a entrega.
      const { data: dbOrder, error: orderError } = await supabase
        .from('orders')
        .select('id, laundry_id, client_id, current_step')
        .eq('id', dbOrderId)
        .eq('client_id', profileId)
        .single();

      if (orderError || !dbOrder) {
        showAppMessage(
          'Pedido não encontrado',
          orderError?.message ?? 'Não foi possível localizar este pedido na sua conta.',
        );
        return false;
      }

      if (Number(dbOrder.current_step) !== 5) {
        showAppMessage(
          'Pedido não entregue',
          'A avaliação só pode ser enviada depois que o pedido for entregue.',
        );
        return false;
      }

      if (!dbOrder.laundry_id) {
        showAppMessage(
          'Não foi possível avaliar',
          'Este pedido não possui uma lavanderia vinculada.',
        );
        return false;
      }

      const { data: savedReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          order_id: dbOrder.id,
          laundry_id: dbOrder.laundry_id,
          client_id: profileId,
          rating,
          comment: comment.trim(),
        })
        .select('order_id, rating, comment, created_at')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          showAppMessage('Pedido já avaliado', 'Você já enviou uma avaliação para este pedido.');
        } else {
          showAppMessage('Erro ao salvar avaliação', insertError.message);
        }
        return false;
      }

      setReviews((previous) => [
        ...previous.filter((review) => review.orderId !== orderId),
        {
          orderId,
          laundryId: dbOrder.laundry_id,
          rating: Number(savedReview.rating),
          comment: savedReview.comment ?? '',
          createdAt: savedReview.created_at,
        },
      ]);

      showAppMessage('Obrigado!', 'Sua avaliação foi salva no banco de dados com sucesso.');
      return true;
    } catch (error) {
      showAppMessage(
        'Erro ao salvar avaliação',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao salvar sua avaliação.',
      );
      return false;
    }
  };

  // Serviço + taxa de entrega
  const total = useMemo(
    () => selectedService.price + (selectedLaundry?.deliveryFee ?? 8.90),
    [selectedService, selectedLaundry],
  );

  // Atualiza a etapa de um pedido


const updateOrderStep = async (value: string) => {
  const separatorIndex = value.lastIndexOf(':');

  if (separatorIndex <= 0) {
    showAppMessage('Erro', 'Identificador inválido.');
    return;
  }

  const orderDisplayId = value.slice(0, separatorIndex);
  const newStep = Number(value.slice(separatorIndex + 1));

  if (!Number.isInteger(newStep) || newStep < 0 || newStep > 5) {
    showAppMessage('Erro', 'Etapa inválida.');
    return;
  }

  // Localiza o pedido pelo número exibido na tela.
  const order = orders.find((item) => item.id === orderDisplayId);

  // Recupera o UUID verdadeiro do Supabase.
  const dbId = (
    order as (LaundryOrder & { dbId?: string }) | undefined
  )?.dbId;

  if (!order || !dbId) {
    showAppMessage(
      'Pedido não localizado',
      'Não foi possível encontrar o identificador do pedido no banco.',
    );
    return;
  }

  const statusByStep = {
    0: 'pending',
    1: 'pickup_scheduled',
    2: 'picked_up',
    3: 'washing',
    4: 'ready',
    5: 'delivered',
  } as const;

  const newStatus = statusByStep[
    newStep as keyof typeof statusByStep
  ];

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        current_step: newStep,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbId)
      .eq('laundry_id', storeLaundryId)
      .select('id, current_step, status')
      .maybeSingle();

    if (error) {
      showAppMessage('Erro ao atualizar pedido', error.message);
      return;
    }

    if (!data) {
      showAppMessage(
        'Pedido não atualizado',
        'O banco não retornou o pedido atualizado. Verifique a política RLS de UPDATE da tabela orders.',
      );
      return;
    }

    // Atualiza a tela depois da confirmação do banco.
    setOrders((previous) =>
      previous.map((item) =>
        item.id === orderDisplayId
          ? {
              ...item,
              currentStep: Number(data.current_step),
            }
          : item,
      ),
    );

    if (storeLaundryId) {
      await loadStoreDashboard(storeLaundryId);
    }
    // A função valida o vínculo da loja e entrega o push ao outro participante.
    void supabase.functions.invoke('notify-order-status', { body: { order_id: dbId, status: newStatus } });

    // Simulação temporária do processamento do login
    await new Promise<void>((resolve) =>
      setTimeout(resolve, 700),
    );

    setName((currentName) => currentName.trim() || 'Cliente');

  } catch (error) {
    showAppMessage(
      'Erro inesperado',
      error instanceof Error
        ? error.message
        : 'Não foi possível atualizar o pedido.',
    );
  }
};




  const cancelOrder = async (displayId: string): Promise<void> => {
    const order = orders.find((item) => item.id === displayId) as (LaundryOrder & { dbId?: string }) | undefined;
    if (!order?.dbId) { showAppMessage('Pedido não localizado', 'Não foi possível identificar o pedido no banco.'); return; }
    const executeCancellation = async () => {
      const { error } = await supabase.rpc('cancel_order', { p_order_id: order.dbId, p_reason: 'Cancelado pelo aplicativo' });
      if (error) { showAppMessage('Não foi possível cancelar', error.message); return; }
      await refreshOrders();
      void supabase.functions.invoke('notify-order-status', { body: { order_id: order.dbId, status: 'cancelled' } });
      showAppMessage('Pedido cancelado', 'O cancelamento foi registrado. Se houve pagamento, entre em contato com o suporte para solicitar o estorno.');
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Deseja cancelar o pedido ${displayId}?`)) await executeCancellation();
    } else {
      Alert.alert('Cancelar pedido', `Deseja cancelar o pedido ${displayId}?`, [
        { text: 'Manter pedido', style: 'cancel' },
        { text: 'Cancelar pedido', style: 'destructive', onPress: () => { void executeCancellation(); } },
      ]);
    }
  };

  // Exibe mensagens tanto no navegador quanto no aplicativo
  const showAppMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const saveProfile = async (values: { name: string; phone: string; address: string }): Promise<boolean> => {
    if (!profileId) {
      showAppMessage('Sessão inválida', 'Entre novamente para atualizar seu perfil.');
      return false;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone: values.phone.replace(/\D/g, ''),
          default_address: values.address,
        })
        .eq('id', profileId)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('O perfil não foi atualizado. Verifique a política RLS de UPDATE da tabela profiles.');

      setName(values.name);
      setPhone(values.phone);
      setAddress(values.address);
      showAppMessage('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
      return true;
    } catch (error) {
      showAppMessage('Erro ao salvar perfil', error instanceof Error ? error.message : 'Não foi possível salvar seus dados.');
      return false;
    }
  };

  const logout = async () => {
    if (profileId && pushToken) {
      await supabase.from('expo_push_tokens').delete().eq('user_id', profileId).eq('expo_push_token', pushToken);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAppMessage('Não foi possível sair', error.message);
      return;
    }
    setProfileId('');
    setPushToken('');
    setStoreLaundryId('');
    setOrders([]);
    setReviews([]);
    setAvailableLaundries([]);
    setSelectedLaundry(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAddress('');
    setInstructions('');
    setAccountType('client');
    setScreen('login');
  };

  // Login com Supabase Auth e recuperação do perfil, se necessário
  const login = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showAppMessage('Falta preencher', 'Informe seu e-mail e sua senha.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    
if (error) {
  // Senha ou e-mail incorretos: informa a LoginScreen
  // para descontar uma tentativa.
  if (error.message === 'Invalid login credentials') {
    throw new Error('E-mail ou senha incorretos.');
  }

  // Outros erros não devem descontar tentativas.
  if (/email not confirmed/i.test(error.message)) {
    showAppMessage(
      'E-mail não confirmado',
      'Seu cadastro foi criado, mas o e-mail ainda não foi confirmado. Abra a mensagem enviada pelo Supabase e clique no link de confirmação. Depois volte aqui para entrar.',
    );
    return;
  }

  showAppMessage('Não foi possível entrar', error.message);
  return;
}


    // Primeiro tenta localizar o perfil criado pelo gatilho do banco.
    const { data: existingProfile, error: profileReadError } = await supabase
      .from('profiles')
      .select('id, name, email, phone, account_type, default_address')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileReadError) {
      showAppMessage('Erro ao consultar perfil', profileReadError.message);
      return;
    }

    let profile = existingProfile;

    // Recupera contas antigas que foram criadas sem registro em profiles.
    if (!profile) {
      const metadata = data.user.user_metadata ?? {};
      const recoveredName = String(metadata.name ?? '');
      const recoveredPhone = String(metadata.phone ?? '');
      const recoveredType: AccountType = metadata.account_type === 'store' ? 'store' : 'client';

      const { data: insertedProfile, error: insertProfileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            name: recoveredName,
            email: data.user.email ?? normalizedEmail,
            phone: recoveredPhone,
            account_type: recoveredType,
            default_address: '',
          },
          { onConflict: 'id' },
        )
        .select('id, name, email, phone, account_type, default_address')
        .single();

      if (insertProfileError || !insertedProfile) {
        showAppMessage(
          'Perfil não encontrado',
          insertProfileError?.message ?? 'Não foi possível criar o perfil. Confira as políticas da tabela profiles no Supabase.',
        );
        return;
      }

      profile = insertedProfile;
    }

    const type: AccountType = profile.account_type === 'store' ? 'store' : 'client';
    setName(profile.name ?? '');
    setEmail(data.user.email ?? normalizedEmail);
    setPhone(profile.phone ?? '');
    setAddress(profile.default_address ?? '');
    setAccountType(type);
    await loadWorkspace(data.user.id, type, profile.name ?? '', profile.phone ?? '');
    setPassword('');
    setScreen('home');
  };

  // Cadastro no Supabase Auth. O trigger SQL cria o registro em profiles.
  const register = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const phoneDigits = phone.replace(/\D/g, '');

    if (!normalizedName || !normalizedEmail || !phoneDigits || !password) {
      showAppMessage('Falta preencher', 'Preencha nome, e-mail, celular e senha.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: normalizedName,
            phone: phoneDigits,
            account_type: accountType,
          },
        },
      });

      if (error) {
        showAppMessage(
          'Não foi possível criar a conta',
          error.message.toLowerCase().includes('already registered')
            ? 'Este e-mail já está cadastrado. Tente entrar pela tela de login.'
            : error.message,
        );
        return;
      }

      if (!data.user) {
        showAppMessage('Cadastro não concluído', 'O Supabase não retornou o usuário. Tente novamente.');
        return;
      }

      // Quando o Supabase já cria uma sessão, garante também o perfil.
      // default_address é NOT NULL no banco atual, por isso enviamos ''.
      if (data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: normalizedName,
            email: normalizedEmail,
            phone: phoneDigits,
            account_type: accountType,
            default_address: '',
          }, { onConflict: 'id' });

        if (profileError) {
          showAppMessage(
            'Conta criada, mas perfil pendente',
            `O usuário foi criado no Supabase Auth, mas não foi possível salvar os dados em profiles.\n\n${profileError.message}\n\nVerifique as políticas RLS da tabela profiles.`,
          );
          return;
        }

        // Encerramos a sessão para voltar ao login.
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          showAppMessage(
            'Conta criada',
            `Sua conta foi criada, mas não foi possível encerrar a sessão automaticamente: ${signOutError.message}. Você já pode entrar.`,
          );
        }
      }

      setEmail(normalizedEmail);
      setPassword('');
      setName('');
      setPhone('');
      setAccountType('client');
      setScreen('login');

      showAppMessage(
        'Cadastro realizado com sucesso!',
        data.session
          ? 'Sua conta foi criada. Agora entre usando o e-mail e a senha cadastrados.'
          : 'Sua conta foi criada. Confira seu e-mail e confirme o cadastro antes de entrar.',
      );
    } catch (error) {
      showAppMessage(
        'Erro ao criar conta',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.',
      );
    }
  };

  // Continua para o pagamento
  const continueToPayment = () => {
    if (!selectedLaundry) {
      Alert.alert(
        'Lavanderia não selecionada',
        'Volte à tela inicial e escolha uma lavanderia.',
      );
      goHome();
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        'Endereço necessário',
        'Informe o endereço de coleta para continuar.',
      );
      return;
    }

    setScreen('payment');
  };

  // Confirma o pedido. O bloqueio evita pedidos duplicados por toques repetidos.
  const confirmOrder = async () => {
    if (creatingOrderRef.current) return;
    if (!profileId || !selectedLaundry) {
      showAppMessage('Sessão inválida', 'Entre novamente para criar seu pedido.');
      return;
    }
    if (!date || !time || !address.trim()) {
      showAppMessage('Dados incompletos', 'Confira a data, o horário e o endereço de coleta.');
      setScreen('schedule');
      return;
    }

    creatingOrderRef.current = true;
    setCreatingOrder(true);
    try {
      const { data: serviceRow, error: serviceError } = await supabase
        .from('laundry_services')
        .select('id, name, price')
        .eq('laundry_id', selectedLaundry.id)
        .eq('name', service)
        .eq('is_active', true)
        .maybeSingle();

      if (serviceError || !serviceRow) {
        showAppMessage('Serviço indisponível', serviceError?.message ?? 'Este serviço não está mais ativo nesta lavanderia. Escolha outro serviço.');
        setScreen('laundryDetails');
        return;
      }

      const servicePrice = Number(serviceRow.price);
      const deliveryFee = Number(selectedLaundry.deliveryFee ?? 8.9);
      const orderTotal = servicePrice + deliveryFee;
      if (!Number.isFinite(orderTotal) || orderTotal < 0) {
        showAppMessage('Valor inválido', 'Não foi possível calcular o total deste pedido.');
        return;
      }

      const orderNumberValue = `LJ-${Date.now().toString().slice(-8)}`;
      const { data: orderRow, error } = await supabase.from('orders').insert({
        order_number: orderNumberValue,
        client_id: profileId,
        laundry_id: selectedLaundry.id,
        service_id: serviceRow.id,
        service_name: serviceRow.name,
        service_price: servicePrice,
        delivery_fee: deliveryFee,
        total: orderTotal,
        status: 'pending',
        current_step: 0,
        scheduled_date: date,
        scheduled_time: time,
        address: address.trim(),
        instructions: instructions.trim(),
        payment_method: paymentToDbValue(payment),
      }).select('id').single();

      if (error || !orderRow) {
        showAppMessage('Erro ao criar pedido', error?.message ?? 'O pedido não foi retornado pelo banco.');
        return;
      }

      // Nesta versão apenas registramos a forma de pagamento escolhida no pedido.
      // A cobrança online (Pix/cartão/checkout) será implementada em uma etapa futura.
      // A lavanderia recebe uma notificação quando um novo pedido é criado.
      void supabase.functions.invoke('notify-order-status', { body: { order_id: orderRow.id, status: 'pending' } });

      const newOrder: LaundryOrder & { dbId?: string; laundryId?: string } = {
        id: orderNumberValue,
        dbId: orderRow.id,
        laundryId: selectedLaundry.id,
        service: serviceRow.name,
        date: formatDatePtBr(date),
        value: orderTotal,
        currentStep: 0,
        time,
        address: address.trim(),
        instructions: instructions.trim(),
        payment,
      };
      setOrders((previous) => [newOrder, ...previous]);
      setSelectedOrderId(orderNumberValue);
      setOrderNumber(orderNumberValue);
      setScreen('confirmation');
    } catch (error) {
      showAppMessage('Erro ao confirmar pedido', error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      creatingOrderRef.current = false;
      setCreatingOrder(false);
    }
  };

  // Finaliza o fluxo do pedido
  const resetOrder = () => {
    setService('Lavagem e dobra');
    // Preserva o endereço padrão salvo no perfil para o próximo pedido.
    setInstructions('');
    setDate(getTodayISODate());
    setTime('14:00');
    setPayment('Pagar na entrega');

    // Mantém a lavanderia escolhida e os dados da sessão
    goHome();
  };

  switch (screen) {
    case 'forgotPassword':
      return (
        <ForgotPasswordScreen
          onBack={() => setScreen('login')}
          onSendRecovery={async (recoveryEmail) => {
            const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail);
            if (error) throw error;
          }}
        />
      );

    case 'helpSupport':
      return <HelpSupportScreen navigate={setScreen} />;

    case 'tracking':
      if (!selectedOrder) {
        return null;
      }

      return (
        <TrackingScreen
          order={selectedOrder}
          onBack={() => setScreen('orders')}
        />
      );

    case 'admin':
      if (accountType !== 'store') {
        return (
          <HomeScreen
            name={name}
            setService={setService}
            navigate={setScreen}
            isStore={false}
            selectedLaundry={selectedLaundry}
            setSelectedLaundry={(laundry) => { setSelectedLaundry(laundry); setSelectedServiceDetails(services[0]); }}
          availableLaundries={availableLaundries}
          />
        );
      }

      return (
        <AdminScreen
          orders={orders}
          onChangeOrder={updateOrderStep}
          onBack={goHome}
          onServices={() => setScreen('services')}
          onReports={() => setScreen('reports')}
        />
      );

    case 'services':
      if (accountType !== 'store') {
        return (
          <HomeScreen
            name={name}
            setService={setService}
            navigate={setScreen}
            isStore={false}
            selectedLaundry={selectedLaundry}
            setSelectedLaundry={(laundry) => { setSelectedLaundry(laundry); setSelectedServiceDetails(services[0]); }}
          availableLaundries={availableLaundries}
          />
        );
      }

      return <ServicesScreen navigate={setScreen} laundryId={storeLaundryId} />;

    case 'orders':
      return (
        <OrdersScreen
          orders={orders}
          navigate={setScreen}
          isStore={accountType === 'store'}
          onTrack={(id) => {
            setSelectedOrderId(id);
            setScreen('tracking');
          }}
          reviews={reviews}
          onSubmitReview={submitReview}
          onRefreshOrders={refreshOrders}
          onOpenChat={(id) => { setSelectedOrderId(id); setScreen('chat'); }}
          onCancelOrder={cancelOrder}
          onNewOrder={() => { setSelectedLaundry(null); setSelectedServiceDetails(services[0]); setScreen('home'); }}
        />
      );

    case 'chat': {
      const chatOrder = orders.find((item) => item.id === selectedOrderId) as (LaundryOrder & { dbId?: string }) | undefined;
      if (!chatOrder?.dbId || !profileId) return null;
      return <ChatScreen orderId={chatOrder.dbId} userId={profileId} onBack={() => setScreen('orders')} />;
    }

    case 'notifications':
      return (
        <NotificationsScreen
          userId={profileId}
          onBack={() => setScreen('home')}
          onOpenOrder={async (dbOrderId) => {
            const existing = orders.find((item) => (item as LaundryOrder & { dbId?: string }).dbId === dbOrderId);
            if (existing) {
              setSelectedOrderId(existing.id);
            } else {
              const { data, error } = await supabase.from('orders').select('*, laundries(name)').eq('id', dbOrderId).maybeSingle();
              if (error || !data) { showAppMessage('Pedido não encontrado', error?.message ?? 'Este pedido não está disponível para sua conta.'); return; }
              const mapped = mapDbOrder(data as Parameters<typeof mapDbOrder>[0]);
              setOrders((current) => [mapped, ...current]);
              setSelectedOrderId(mapped.id);
            }
            setScreen('tracking');
          }}
          onUnreadCountChange={setUnreadNotifications}
        />
      );

    case 'reports':
      if (accountType !== 'store') return null;
      return <ReportsScreen orders={orders} onBack={() => setScreen('admin')} />;

    case 'profile':
      return (
        <ProfileScreen
          name={name}
          email={email}
          phone={phone}
          address={address}
          isStore={accountType === 'store'}
          navigate={setScreen}
          onSave={saveProfile}
          onLogout={logout}
        />
      );

    case 'login':
      return (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          login={login}
          navigate={setScreen}
          showHome={goHome}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          password={password}
          setPassword={setPassword}
          accountType={accountType}
          setAccountType={setAccountType}
          register={register}
          navigate={setScreen}
        />
      );

    case 'home':
      return (
        <HomeScreen
          name={name}
          setService={setService}
          navigate={setScreen}
          isStore={accountType === 'store'}
          selectedLaundry={selectedLaundry}
          setSelectedLaundry={(laundry) => { setSelectedLaundry(laundry); setSelectedServiceDetails(services[0]); }}
          availableLaundries={availableLaundries}
          dashboardData={dashboardData}
          dashboardLoading={dashboardLoading}
          onRefreshDashboard={() => {
            if (storeLaundryId) void loadStoreDashboard(storeLaundryId);
          }}
          unreadNotifications={unreadNotifications}
        />
      );

    case 'laundryDetails':
      if (!selectedLaundry) {
        return (
          <HomeScreen
            name={name}
            setService={setService}
            navigate={setScreen}
            isStore={accountType === 'store'}
            selectedLaundry={selectedLaundry}
            setSelectedLaundry={(laundry) => { setSelectedLaundry(laundry); setSelectedServiceDetails(services[0]); }}
          availableLaundries={availableLaundries}
          />
        );
      }

      return (
        <LaundryDetailsScreen
          laundry={selectedLaundry}
          navigate={setScreen}
          reviews={reviews}
          onSelectService={(item) => {
            setService(item.name);
            setSelectedServiceDetails({ id: item.id, name: item.name, detail: item.estimated_duration, description: item.description, price: Number(item.price), deadline: item.estimated_duration, active: item.is_active, icon: 'shirt-outline' });
          }}
        />
      );

    case 'schedule':
      return (
        <ScheduleScreen
          service={service}
          setService={setService}
          address={address}
          setAddress={setAddress}
          instructions={instructions}
          setInstructions={setInstructions}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          selectedService={selectedService}
          navigate={setScreen}
          continueToPayment={continueToPayment}
        />
      );

    case 'payment':
      return (
        <PaymentScreen
          service={service}
          date={date}
          time={time}
          address={address}
          instructions={instructions}
          payment={payment}
          setPayment={setPayment}
          selectedService={selectedService}
          total={total}
          navigate={setScreen}
          confirmOrder={confirmOrder}
          confirming={creatingOrder}
        />
      );

    case 'confirmation':
      return (
        <ConfirmationScreen
          orderNumber={orderNumber}
          date={date}
          time={time}
          address={address}
          payment={payment}
          total={total}
          resetOrder={resetOrder}
        />
      );

    default:
      return (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          login={login}
          navigate={setScreen}
          showHome={goHome}
        />
      );
  }
}
