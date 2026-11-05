import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from './src/lib/supabase';
import { ensureStoreLaundry, getActiveLaundries, getRelatedOrders, mapDbOrder } from './src/lib/database';

import type { Screen, Service, PaymentMethod } from './src/types';
import { services, type ServiceItem } from './src/data/services';
import type { Laundry } from './src/data/laundries';

import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen, {
  type AccountType,
} from './src/screens/Register/RegisterScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
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

export default function App() {
  // Navegação
  const [screen, setScreen] = useState<Screen>('login');

  // Avaliações dos pedidos
  const [reviews, setReviews] = useState<Review[]>([]);

  // Dados do usuário
  const [profileId, setProfileId] = useState('');
  const [storeLaundryId, setStoreLaundryId] = useState('');
  const [availableLaundries, setAvailableLaundries] = useState<Laundry[]>([]);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceItem>(services[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Tipo de conta
  const [accountType, setAccountType] = useState<AccountType>('client');

  // Restaura a sessão e carrega o perfil salvo no Supabase
  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user || !mounted) return;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, phone, account_type')
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
          .select('id, name, email, phone, account_type')
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
      setAccountType(type);
      await loadWorkspace(session.user.id, type, currentProfile.name ?? '', currentProfile.phone ?? '');
      setScreen(type === 'store' ? 'admin' : 'home');
    };
    void restoreSession();
    return () => { mounted = false; };
  }, []);

  // Lavanderia selecionada
  const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

  // Dados do pedido
  const [address, setAddress] = useState('');
  const [service, setService] = useState<Service>('Lavagem e dobra');
  const [date, setDate] = useState('Hoje, 04 nov.');
  const [time, setTime] = useState('14h–16h');

  const [payment, setPayment] = useState<PaymentMethod>('Pix');
  const [instructions, setInstructions] = useState('');

  const [orderNumber, setOrderNumber] = useState('');

  // Pedidos
  const [orders, setOrders] = useState<LaundryOrder[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState('LJ-2048');

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  const selectedService = selectedServiceDetails;

  const loadWorkspace = async (userId: string, type: AccountType, displayName: string, userPhone: string) => {
    setProfileId(userId);
    try {
      if (type === 'store') {
        const laundry = await ensureStoreLaundry(userId, displayName, userPhone);
        setStoreLaundryId(laundry.id);
        const rows = await getRelatedOrders(userId, true, laundry.id);
        setOrders(rows.map((row) => mapDbOrder(row as Parameters<typeof mapDbOrder>[0])));
        setSelectedLaundry({ id: laundry.id, name: laundry.name, rating: '0,0', distance: '', deliveryFee: Number(laundry.delivery_fee), address: laundry.address, description: laundry.description });
      } else {
        const [laundriesRows, orderRows] = await Promise.all([getActiveLaundries(), getRelatedOrders(userId, false)]);
        setAvailableLaundries(laundriesRows.map((item) => ({ id: item.id, name: item.name, rating: '0,0', distance: '', deliveryFee: Number(item.delivery_fee), address: item.address, description: item.description })));
        setOrders(orderRows.map((row) => mapDbOrder(row as Parameters<typeof mapDbOrder>[0])));
      }
    } catch (error) {
      showAppMessage('Erro ao carregar dados', error instanceof Error ? error.message : 'Não foi possível consultar o Supabase.');
    }
  };

  // Retorna à tela inicial sem encerrar a sessão
  const goHome = () => {
    setScreen('home');
  };

  // Registra a avaliação de um pedido entregue
  const submitReview = async (
    orderId: string,
    rating: number,
    comment: string,
  ) => {
    const order = orders.find((item) => item.id === orderId);

    if (!order || order.currentStep !== 5) {
      Alert.alert(
        'Pedido não entregue',
        'Você só pode avaliar um pedido depois da entrega.',
      );
      return;
    }

    if (reviews.some((review) => review.orderId === orderId)) {
      Alert.alert('Atenção', 'Este pedido já foi avaliado.');
      return;
    }

    const dbOrderId = (order as LaundryOrder & { dbId?: string }).dbId;
    if (!dbOrderId || !profileId) { showAppMessage('Não foi possível avaliar', 'Pedido não localizado no banco de dados.'); return; }
    const { error } = await supabase.from('reviews').insert({ order_id: dbOrderId, laundry_id: (order as LaundryOrder & { laundryId?: string }).laundryId, client_id: profileId, rating, comment: comment.trim() });
    if (error) { showAppMessage('Erro ao salvar avaliação', error.message); return; }
    setReviews((previous) => [...previous, { orderId, rating, comment, createdAt: new Date().toLocaleDateString('pt-BR') }]);
    showAppMessage('Obrigado!', 'Sua avaliação foi registrada com sucesso.');
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

    showAppMessage(
      'Pedido atualizado!',
      'O andamento foi salvo no banco de dados com sucesso.',
    );

  } catch (error) {
    showAppMessage(
      'Erro inesperado',
      error instanceof Error
        ? error.message
        : 'Não foi possível atualizar o pedido.',
    );
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
      showAppMessage(
        'Não foi possível entrar',
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
          : /email not confirmed/i.test(error.message)
            ? 'Seu cadastro foi criado, mas o e-mail ainda não foi confirmado. Abra a mensagem enviada pelo Supabase e clique no link de confirmação. Depois volte aqui para entrar.'
            : error.message,
      );
      return;
    }

    // Primeiro tenta localizar o perfil criado pelo gatilho do banco.
    const { data: existingProfile, error: profileReadError } = await supabase
      .from('profiles')
      .select('id, name, email, phone, account_type')
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
        .select('id, name, email, phone, account_type')
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
    setAccountType(type);
    await loadWorkspace(data.user.id, type, profile.name ?? '', profile.phone ?? '');
    setPassword('');
    setScreen(type === 'store' ? 'admin' : 'home');
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

  // Confirma o pedido
  const confirmOrder = async () => {
    if (!profileId || !selectedLaundry) { showAppMessage('Sessão inválida', 'Entre novamente para criar seu pedido.'); return; }
    const { data: serviceRow, error: serviceError } = await supabase.from('laundry_services').select('id, name, price').eq('laundry_id', selectedLaundry.id).eq('name', service).eq('is_active', true).maybeSingle();
    if (serviceError || !serviceRow) { showAppMessage('Serviço indisponível', serviceError?.message ?? 'Este serviço não está mais ativo nesta lavanderia. Escolha outro serviço.'); setScreen('laundryDetails'); return; }
    const servicePrice = Number(serviceRow.price);
    const deliveryFee = Number(selectedLaundry.deliveryFee ?? 8.9);
    const orderNumberValue = `LJ-${Date.now().toString().slice(-8)}`;
    const { data: orderRow, error } = await supabase.from('orders').insert({
      order_number: orderNumberValue, client_id: profileId, laundry_id: selectedLaundry.id,
      service_id: serviceRow?.id ?? null, service_name: service, service_price: servicePrice,
      delivery_fee: deliveryFee, total: servicePrice + deliveryFee, status: 'pending', current_step: 0,
      scheduled_date: null, scheduled_time: time, address: address.trim(), instructions: instructions.trim(), payment_method: payment,
    }).select('id').single();
    if (error || !orderRow) { showAppMessage('Erro ao criar pedido', error?.message ?? 'O pedido não foi retornado pelo banco.'); return; }
    const { error: paymentError } = await supabase.from('payments').insert({ order_id: orderRow.id, amount: servicePrice + deliveryFee, method: payment, status: 'pending' });
    if (paymentError) { showAppMessage('Pedido criado, pagamento pendente', `Pedido ${orderNumberValue} criado, mas o pagamento não foi registrado: ${paymentError.message}`); }
    const newOrder: LaundryOrder & { dbId?: string; laundryId?: string } = { id: orderNumberValue, dbId: orderRow.id, laundryId: selectedLaundry.id, service, date, value: servicePrice + deliveryFee, currentStep: 0, time, address, instructions, payment };
    setOrders((previous) => [newOrder, ...previous]);
    setSelectedOrderId(orderNumberValue);
    setOrderNumber(orderNumberValue);
    setScreen('confirmation');
  };

  // Finaliza o fluxo do pedido
  const resetOrder = () => {
    setService('Lavagem e dobra');
    setAddress('');
    setInstructions('');
    setDate('Hoje, 04 nov.');
    setTime('14h–16h');
    setPayment('Pix');

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
          onNewOrder={() => { setSelectedLaundry(null); setSelectedServiceDetails(services[0]); setScreen('home'); }}
        />
      );

    case 'profile':
      return (
        <ProfileScreen
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          navigate={setScreen}
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
