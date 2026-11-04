import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { Screen, Service, PaymentMethod } from './src/types';
import { services } from './src/data/services';
import type { Laundry } from './src/data/laundries';

import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen, {
  type AccountType,
} from './src/screens/Register/RegisterScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import ConfirmationScreen from './src/screens/Confirmation/ConfirmationScreen';
import OrdersScreen from './src/screens/Orders/OrdersScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupport/HelpSupportScreen';
import ForgotPasswordScreen from './src/screens/ForgotPassword/ForgotPasswordScreen';
import TrackingScreen from './src/screens/Tracking/TrackingScreen';
import AdminScreen from './src/screens/Admin/AdminScreen';
import LaundryDetailsScreen from './src/screens/LaundryDetails/LaundryDetailsScreen';
import ServicesScreen from './src/screens/Services/ServicesScreen';

import type { LaundryOrder } from './src/types/order';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');

  // Dados do usuário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Tipo de conta
  const [accountType, setAccountType] = useState<AccountType>('client');

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
  const [orders, setOrders] = useState<LaundryOrder[]>([
    {
      id: 'LJ-2048',
      service: 'Lavagem e dobra',
      date: '29 out. 2026',
      value: 48.90,
      currentStep: 2,
    },
    {
      id: 'LJ-1982',
      service: 'Lavar e passar',
      date: '18 out. 2026',
      value: 68.90,
      currentStep: 5,
    },
    {
      id: 'LJ-1837',
      service: 'Passadoria',
      date: '05 out. 2026',
      value: 38.90,
      currentStep: 5,
    },
  ]);

  const [selectedOrderId, setSelectedOrderId] = useState('LJ-2048');

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  const selectedService =
    services.find((item) => item.name === service) ?? services[0];

  // Serviço + taxa de entrega da lavanderia
  const total = useMemo(
    () => selectedService.price + (selectedLaundry?.deliveryFee ?? 8.90),
    [selectedService, selectedLaundry],
  );

  // Atualiza a etapa de um pedido
  const updateOrderStep = (value: string) => {
    const separatorIndex = value.lastIndexOf(':');

    if (separatorIndex <= 0) {
      return;
    }

    const id = value.slice(0, separatorIndex);
    const newStep = Number(value.slice(separatorIndex + 1));

    if (
      !id ||
      !Number.isInteger(newStep) ||
      newStep < 0 ||
      newStep > 5
    ) {
      return;
    }

    setOrders((previous) =>
      previous.map((order) =>
        order.id === id
          ? { ...order, currentStep: newStep }
          : order,
      ),
    );
  };

  // Login
  const login = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Falta preencher',
        'Informe seu e-mail e sua senha para continuar.',
      );
      return;
    }

    setName((currentName) => currentName.trim() || 'Cliente');

    if (accountType === 'store') {
      setScreen('admin');
    } else {
      setScreen('home');
    }
  };

  // Cadastro
  const register = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        'Falta preencher',
        'Preencha nome, e-mail, telefone e senha.',
      );
      return;
    }

    setScreen('home');
  };

  // Continua para o pagamento
  const continueToPayment = () => {
    if (!selectedLaundry) {
      Alert.alert(
        'Lavanderia não selecionada',
        'Volte à tela inicial e escolha uma lavanderia.',
      );
      setScreen('home');
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
  const confirmOrder = () => {
    const highestOrderNumber = orders.reduce((highest, order) => {
      const match = order.id.match(/^LJ-(\d+)$/);
      const number = match ? Number(match[1]) : 0;

      return Math.max(highest, number);
    }, 0);

    const newOrderNumber = `LJ-${highestOrderNumber + 1}`;

    const newOrder: LaundryOrder = {
      id: newOrderNumber,
      service,
      date,
      value: total,
      currentStep: 0,
      time,
      address,
      instructions,
      payment,
    };

    setOrders((previous) => [newOrder, ...previous]);
    setSelectedOrderId(newOrderNumber);
    setOrderNumber(newOrderNumber);
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

    // Mantém a lavanderia escolhida
    setScreen('home');
  };

  switch (screen) {
    case 'forgotPassword':
      return (
        <ForgotPasswordScreen
          onBack={() => setScreen('login')}
          onSendRecovery={async (recoveryEmail) => {
            console.log('Solicitação de recuperação:', recoveryEmail);
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
        setSelectedLaundry={setSelectedLaundry}
      />
    );
  }

  return (
    <AdminScreen
      orders={orders}
      onChangeOrder={updateOrderStep}
      onBack={() => setScreen('home')}
      onServices={() => setScreen('services')}
    />
  );

      return (
        <AdminScreen
          orders={orders}
          onChangeOrder={updateOrderStep}
          onBack={() => setScreen('orders')}
        />
      );

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
          showHome={() => setScreen('home')}
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
          setSelectedLaundry={setSelectedLaundry}
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
            setSelectedLaundry={setSelectedLaundry}
          />
        );
      }

      return (
        <LaundryDetailsScreen
          laundry={selectedLaundry}
          setService={setService}
          navigate={setScreen}
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

      case 'services':
  if (accountType !== 'store') {
    return (
      <HomeScreen
        name={name}
        setService={setService}
        navigate={setScreen}
        isStore={false}
        selectedLaundry={selectedLaundry}
        setSelectedLaundry={setSelectedLaundry}
      />
    );
  }

  return <ServicesScreen navigate={setScreen} />;

    default:
      return (
        <LoginScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          login={login}
          navigate={setScreen}
          showHome={() => setScreen('home')}
        />
      );
  }
}