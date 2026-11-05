import React, { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
  login: () => void;
  navigate: Navigate;
  showHome: () => void;
};

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

  const handleLogoPress = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      showHome();
    }
  };

  const validateAndLogin = () => {
    let valid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setEmailError('Informe um e-mail válido.');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('A senha é obrigatória.');
      valid = false;
    }

    if (valid) {
      login();
    }
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
            <Text style={styles.cardTitle}>
              Bem-vindo de volta
            </Text>

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

            {emailError ? (
              <Text style={validationStyles.error}>
                {emailError}
              </Text>
            ) : null}

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

            {passwordError ? (
              <Text style={validationStyles.error}>
                {passwordError}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgot}
              onPress={() => navigate('forgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Entrar"
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
};