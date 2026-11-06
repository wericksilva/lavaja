import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Field from '../../components/Field';
import Brand from '../../components/Brand';
import PrimaryButton from '../../components/PrimaryButton';
import type { Navigate } from '../../types';

type Props = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  login: () => void | Promise<void>;
  navigate: Navigate;
  showHome: () => void;
};

const MAX_ATTEMPTS = 3;

export default function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  login,
  navigate,
  showHome,
}: Props) {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const remainingAttempts = MAX_ATTEMPTS - attempts;

  const handleLogoPress = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      showHome();
    }
  };

  const validateAndLogin = async () => {
    if (blocked || loading) return;

    let valid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Informe um e-mail válido.');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('A senha é obrigatória.');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);

    try {
      await login();

      // Login realizado com sucesso.
      setAttempts(0);
      setBlocked(false);
    } catch (error) {
      const newAttempts = attempts + 1;

      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setBlocked(true);
        setPasswordError(
          'Acesso bloqueado após 3 tentativas incorretas. Recupere sua senha para entrar novamente.'
        );
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;

        setPasswordError(
          `Senha incorreta. Você ainda tem ${remaining} ${
            remaining === 1 ? 'tentativa' : 'tentativas'
          }.`
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar. Tente novamente.';

      if (Platform.OS === 'web') {
        window.alert(
          newAttempts >= MAX_ATTEMPTS
            ? 'Acesso bloqueado!\n\nVocê atingiu o limite de 3 tentativas. Utilize "Esqueci minha senha" para recuperar seu acesso.'
            : `Senha incorreta!\n\nRestam ${MAX_ATTEMPTS - newAttempts} tentativa(s).`
        );
      } else {
        Alert.alert(
          newAttempts >= MAX_ATTEMPTS
            ? 'Acesso bloqueado'
            : 'Falha no login',
          newAttempts >= MAX_ATTEMPTS
            ? 'Você atingiu o limite de 3 tentativas. Utilize "Esqueci minha senha" para recuperar seu acesso.'
            : `Senha incorreta. Restam ${MAX_ATTEMPTS - newAttempts} tentativa(s).`
        );
      }

      console.log('Erro no login:', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('forgotPassword');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHero}>
            <TouchableOpacity
              onPress={handleLogoPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Logo LavaJá"
            >
              <Brand />
            </TouchableOpacity>

            <View style={styles.heroIllustration}>
              <View style={styles.bubbleOne} />
              <View style={styles.bubbleTwo} />

              <Ionicons name="shirt" size={74} color={C.blue} />

              <View style={styles.heroCheck}>
                <Ionicons name="checkmark" size={19} color="#fff" />
              </View>
            </View>

            <Text style={styles.authTitle}>
              Roupa limpa.{"\n"}Tempo livre.
            </Text>

            <Text style={styles.authSubtitle}>
              A gente busca, lava e entrega na sua porta.
            </Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.cardTitle}>Bem-vindo de volta</Text>

            <Text style={styles.cardSubtitle}>
              Entre para agendar sua próxima coleta.
            </Text>

            <Field
              label="E-mail"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError('');
              }}
              placeholder="voce@email.com"
              keyboardType="email-address"
              icon="mail-outline"
            />

            {!!emailError && (
              <Text style={validationStyles.error}>
                {emailError}
              </Text>
            )}

            <Field
              label="Senha"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Sua senha"
              secureTextEntry
              icon="lock-closed-outline"
            />

            {!!passwordError && (
              <Text style={validationStyles.error}>
                {passwordError}
              </Text>
            )}

            {!blocked && (
              <Text style={validationStyles.attempts}>
                Tentativas restantes: {remainingAttempts} de {MAX_ATTEMPTS}
              </Text>
            )}

            {blocked && (
              <View style={validationStyles.blockedBox}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#D64545"
                />

                <Text style={validationStyles.blockedText}>
                  Seu acesso está bloqueado. Recupere sua senha para
                  cadastrar uma nova e voltar a entrar.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.forgot}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={
                blocked
                  ? 'Acesso bloqueado'
                  : loading
                    ? 'Entrando...'
                    : 'Entrar'
              }
              onPress={validateAndLogin}
              icon="arrow-forward"
            />

            <View style={styles.authFooter}>
              <Text style={styles.mutedText}>
                Ainda não tem conta?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigate('register')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  Criar cadastro
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const validationStyles = {
  error: {
    color: '#D64545',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  attempts: {
    color: '#64748B',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 14,
    marginLeft: 4,
  },
  blockedBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF1F1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  blockedText: {
    color: '#D64545',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
};