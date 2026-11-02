import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { Screen, Service, PaymentMethod } from './src/types';
import { services } from './src/data/services';

import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen from './src/screens/Register/RegisterScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import ConfirmationScreen from './src/screens/Confirmation/ConfirmationScreen';
import OrdersScreen from './src/screens/Orders/OrdersScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [service, setService] = useState<Service>('Lavagem e dobra');
  const [date, setDate] = useState('Hoje, 29 out.');
  const [time, setTime] = useState('14h–16h');
  const [payment, setPayment] = useState<PaymentMethod>('Pix');
  const [instructions, setInstructions] = useState('');
  const [orderNumber] = useState('LJ-2048');

  const selectedService = services.find((item) => item.name === service) || services[0];
  const total = useMemo(() => selectedService.price + 8.90, [selectedService]);

  const login = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Falta preencher', 'Informe seu e-mail e sua senha para continuar.');
      return;
    }
    setName(name || 'Cliente');
    setScreen('home');
  };

  const register = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Falta preencher', 'Preencha nome, e-mail, telefone e senha.');
      return;
    }
    setScreen('home');
  };

  const continueToPayment = () => {
    if (!address.trim()) {
      Alert.alert('Endereço necessário', 'Informe o endereço de coleta para continuar.');
      return;
    }
    setScreen('payment');
  };

  const confirmOrder = () => setScreen('confirmation');

  const resetOrder = () => {
    setService('Lavagem e dobra');
    setAddress('');
    setInstructions('');
    setScreen('home');
  };

  switch (screen) {
    
   case 'orders':
      return <OrdersScreen navigate={setScreen} />;

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
          register={register}
          navigate={setScreen}
        />
      );

    case 'home':
      return <HomeScreen name={name} setService={setService} navigate={setScreen} />;

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
      return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} login={login} navigate={setScreen} showHome={() => setScreen('home')} />;
  }
}
