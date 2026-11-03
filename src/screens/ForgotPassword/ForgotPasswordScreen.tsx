
import React, { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';

type Props = {
  onBack: () => void;
  onSendRecovery: (email: string) => Promise<void>;
};

export default function ForgotPasswordScreen({
  onBack,
  onSendRecovery,
}: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const recuperarSenha = async () => {
    const emailLimpo = email.trim().toLowerCase();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);

    if (!emailLimpo) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!emailValido) {
      Alert.alert('E-mail inválido', 'Confira o endereço informado.');
      return;
    }

    try {
      setLoading(true);

      await onSendRecovery(emailLimpo);

      setEnviado(true);
    } catch (error) {
      Alert.alert(
        'Não foi possível enviar',
        'Ocorreu um erro ao solicitar a recuperação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <Header
        title="Recuperar senha"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={[
          styles.formPage,
          { flexGrow: 1, justifyContent: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: C.paleBlue,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
            }}
          >
            <Ionicons
              name="lock-open-outline"
              size={42}
              color={C.blue}
            />
          </View>

          <Text
            style={[
              styles.pageHeadline,
              { textAlign: 'center' },
            ]}
          >
            Esqueceu sua senha?
          </Text>

          <Text
            style={[
              styles.pageSub,
              {
                textAlign: 'center',
                marginTop: 10,
              },
            ]}
          >
            Não se preocupe! Informe seu e-mail cadastrado
            e enviaremos as instruções para recuperar
            o acesso à sua conta.
          </Text>
        </View>

        {!enviado ? (
          <>
            <Text style={styles.fieldLabel}>
              E-mail cadastrado
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 54,
                backgroundColor: C.white,
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 12,
                paddingHorizontal: 14,
                marginBottom: 22,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={21}
                color={C.blue}
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={C.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: C.text,
                  fontSize: 15,
                }}
              />
            </View>

            <PrimaryButton
              title={
                loading
                  ? 'Enviando...'
                  : 'Recuperar minha senha'
              }
              onPress={recuperarSenha}
              icon="arrow-forward"
            />

            {loading && (
              <ActivityIndicator
                color={C.blue}
                style={{ marginTop: 16 }}
              />
            )}
          </>
        ) : (
          <View
            style={{
              backgroundColor: C.paleBlue,
              borderRadius: 16,
              padding: 22,
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={C.green}
            />

            <Text
              style={{
                color: C.navy,
                fontSize: 19,
                fontWeight: 'bold',
                marginTop: 14,
                textAlign: 'center',
              }}
            >
              Solicitação realizada!
            </Text>

            <Text
              style={{
                color: C.text,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 10,
                lineHeight: 21,
              }}
            >
              Se o e-mail estiver cadastrado, você receberá
              as instruções para redefinir sua senha.
              Confira também sua caixa de spam.
            </Text>

            <View style={{ marginTop: 22, width: '100%' }}>
              <PrimaryButton
                title="Voltar para o login"
                onPress={onBack}
                icon="arrow-forward"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
