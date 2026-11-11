import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Field from '../../components/Field';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import type { Navigate } from '../../types';

export type AccountType = 'client' | 'store' | 'motoboy';

type Props = {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  accountType: AccountType;
  setAccountType: (value: AccountType) => void;
  register: () => void | Promise<void>;
  navigate: Navigate;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function RegisterScreen({
  name, setName, email, setEmail, phone, setPhone,
  password, setPassword, accountType, setAccountType,
  register, navigate,
}: Props) {
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateAndRegister = async () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');

    if (!name.trim()) {
      setNameError('O nome completo é obrigatório.');
      valid = false;
    }
    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um e-mail válido.');
      valid = false;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) {
      setPhoneError('O celular é obrigatório.');
      valid = false;
    } else if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setPhoneError('Informe um celular válido com DDD.');
      valid = false;
    }
    if (!password) {
      setPasswordError('A senha é obrigatória.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres.');
      valid = false;
    }
    if (!valid || loading) return;

    setLoading(true);
    try {
      await register();
    } finally {
      setLoading(false);
    }
  };

  const isClientSelected = accountType === 'client';
  const isStoreSelected = accountType === 'store';
  const isCourierSelected = accountType === 'motoboy';

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <Header title="Criar cadastro" onBack={() => navigate('login')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
          <View style={styles.registerIcon}>
            <Ionicons name="person-add-outline" size={28} color={C.blue} />
          </View>
          <Text style={styles.pageHeadline}>Vamos facilitar sua rotina.</Text>
          <Text style={styles.pageSub}>{accountType === 'motoboy' ? 'Crie sua conta para aceitar corridas e realizar entregas.' : 'Crie sua conta para acompanhar suas roupas em cada etapa.'}</Text>

          <Text style={localStyles.sectionTitle}>Como você deseja utilizar o LavaJá?</Text>
          <View style={localStyles.optionsContainer}>
            <TouchableOpacity activeOpacity={0.75} onPress={() => setAccountType('client')} style={[localStyles.accountOption, isClientSelected && localStyles.accountOptionSelected]}>
              {isClientSelected && <View style={localStyles.checkIcon}><Ionicons name="checkmark-circle" size={19} color={C.blue} /></View>}
              <Ionicons name="person-outline" size={30} color={isClientSelected ? C.blue : '#64748B'} />
              <Text style={[localStyles.optionTitle, isClientSelected && localStyles.optionTitleSelected]}>Sou cliente</Text>
              <Text style={localStyles.optionDescription}>Quero solicitar serviços</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} onPress={() => setAccountType('store')} style={[localStyles.accountOption, isStoreSelected && localStyles.accountOptionSelected]}>
              {isStoreSelected && <View style={localStyles.checkIcon}><Ionicons name="checkmark-circle" size={19} color={C.blue} /></View>}
              <Ionicons name="storefront-outline" size={30} color={isStoreSelected ? C.blue : '#64748B'} />
              <Text style={[localStyles.optionTitle, isStoreSelected && localStyles.optionTitleSelected]}>Sou lavanderia</Text>
              <Text style={localStyles.optionDescription}>Quero gerenciar pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} onPress={() => setAccountType('motoboy')} style={[localStyles.accountOption, isCourierSelected && localStyles.accountOptionSelected]}>
              {isCourierSelected && <View style={localStyles.checkIcon}><Ionicons name="checkmark-circle" size={19} color={C.blue} /></View>}
              <Ionicons name="bicycle-outline" size={30} color={isCourierSelected ? C.blue : '#64748B'} />
              <Text style={[localStyles.optionTitle, isCourierSelected && localStyles.optionTitleSelected]}>Sou motoboy</Text>
              <Text style={localStyles.optionDescription}>Quero fazer entregas</Text>
            </TouchableOpacity>
          </View>

          <Field label={accountType === 'store' ? 'Nome da lavanderia ou responsável' : 'Nome completo'} value={name} onChangeText={(value) => { setName(value); if (nameError) setNameError(''); }} placeholder={accountType === 'store' ? 'Nome da sua lavanderia' : accountType === 'motoboy' ? 'Seu nome completo' : 'Como podemos te chamar?'} icon="person-outline" />
          {!!nameError && <Text style={validationStyles.error}>{nameError}</Text>}

          <Field label="E-mail" value={email} onChangeText={(value) => { setEmail(value); if (emailError) setEmailError(''); }} placeholder="voce@email.com" keyboardType="email-address" icon="mail-outline" />
          {!!emailError && <Text style={validationStyles.error}>{emailError}</Text>}

          <Field label="Celular" value={phone} onChangeText={(value) => { setPhone(formatPhone(value)); if (phoneError) setPhoneError(''); }} placeholder="(11) 99999-9999" keyboardType="phone-pad" icon="call-outline" />
          {!!phoneError && <Text style={validationStyles.error}>{phoneError}</Text>}

          <Field label="Crie uma senha" value={password} onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }} placeholder="Mínimo de 8 caracteres" secureTextEntry icon="lock-closed-outline" />
          {!!passwordError && <Text style={validationStyles.error}>{passwordError}</Text>}

          <Text style={styles.terms}>Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.</Text>
          <PrimaryButton title={loading ? 'Criando conta...' : 'Criar minha conta'} onPress={validateAndRegister} icon="arrow-forward" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = {
  sectionTitle: { fontSize: 14, fontWeight: '700' as const, color: '#253247', marginTop: 8, marginBottom: 12 },
  optionsContainer: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 10, marginBottom: 22 },
  accountOption: { flexGrow: 1, flexBasis: '30%' as const, minWidth: 90, minHeight: 120, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' as const, justifyContent: 'center' as const, position: 'relative' as const },
  accountOptionSelected: { borderColor: C.blue, backgroundColor: '#EFF6FF' },
  checkIcon: { position: 'absolute' as const, top: 7, right: 7 },
  optionTitle: { fontSize: 14, fontWeight: '700' as const, color: '#253247', marginTop: 9 },
  optionTitleSelected: { color: C.blue },
  optionDescription: { fontSize: 10, color: '#64748B', textAlign: 'center' as const, marginTop: 5 },
};

const validationStyles = {
  error: { color: '#D64545', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 },
};
