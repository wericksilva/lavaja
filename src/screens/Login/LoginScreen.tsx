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
email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  login: () => void;
  navigate: Navigate;
  showHome: () => void;
};


export default function LoginScreen({ email, setEmail, password, setPassword, login, navigate, showHome }: Props) {
  return (
  <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHero}>
          <Brand />
          <View style={styles.heroIllustration}>
            <View style={styles.bubbleOne} /><View style={styles.bubbleTwo} />
            <Ionicons name="shirt" size={74} color={C.blue} />
            <View style={styles.heroCheck}><Ionicons name="checkmark" size={19} color="#fff" /></View>
          </View>
          <Text style={styles.authTitle}>Roupa limpa.{'\n'}Tempo livre.</Text>
          <Text style={styles.authSubtitle}>A gente busca, lava e entrega na sua porta.</Text>
        </View>
        <View style={styles.authCard}>
          <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
          <Text style={styles.cardSubtitle}>Entre para agendar sua próxima coleta.</Text>
          <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" icon="mail-outline" />
          <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry icon="lock-closed-outline" />
          <TouchableOpacity style={styles.forgot}><Text style={styles.linkText}>Esqueci minha senha</Text></TouchableOpacity>
          <PrimaryButton title="Entrar" onPress={login} icon="arrow-forward" />
          <View style={styles.authFooter}><Text style={styles.mutedText}>Ainda não tem conta? </Text><TouchableOpacity onPress={() => navigate('register')}><Text style={styles.linkText}>Criar cadastro</Text></TouchableOpacity></View>
          <TouchableOpacity onPress={showHome} style={styles.demoLink}><Text style={styles.demoText}>Explorar o app de demonstração</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
