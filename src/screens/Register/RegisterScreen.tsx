import React from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Field from '../../components/Field';
import Header from '../../components/Header';
import Brand from '../../components/Brand';
import PrimaryButton from '../../components/PrimaryButton';
import { services } from '../../data/services';
import { money } from '../../utils/money';
import type { Navigate, Service, PaymentMethod } from '../../types';

type Props = {
name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  register: () => void;
  navigate: Navigate;
};

export default function RegisterScreen({ name, setName, email, setEmail, phone, setPhone, password, setPassword, register, navigate }: Props) {
  return (
  <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <Header title="Criar cadastro" onBack={() => navigate('login')} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
        <View style={styles.registerIcon}><Ionicons name="person-add-outline" size={28} color={C.blue} /></View>
        <Text style={styles.pageHeadline}>Vamos facilitar sua rotina.</Text>
        <Text style={styles.pageSub}>Crie sua conta para acompanhar suas roupas em cada etapa.</Text>
        <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Como podemos te chamar?" icon="person-outline" />
        <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" icon="mail-outline" />
        <Field label="Celular" value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" keyboardType="phone-pad" icon="call-outline" />
        <Field label="Crie uma senha" value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" secureTextEntry icon="lock-closed-outline" />
        <Text style={styles.terms}>Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.</Text>
        <PrimaryButton title="Criar minha conta" onPress={register} icon="arrow-forward" />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
