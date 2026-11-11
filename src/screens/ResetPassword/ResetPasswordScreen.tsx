
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
  onSave: (password: string) => Promise<void>;
};

export default function ResetPasswordScreen({
  onBack,
  onSave,
}: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const salvarNovaSenha = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha os dois campos de senha.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Senha muito curta',
        'A nova senha deve ter pelo menos 6 caracteres.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'A confirmação precisa ser igual à nova senha.',
      );
      return;
    }

    try {
      setLoading(true);
      await onSave(password);
    } catch (error) {
      Alert.alert(
        'Não foi possível alterar a senha',
        error instanceof Error
          ? error.message
          : 'Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <Header
        title="Criar nova senha"
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
              name="lock-closed-outline"
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
            Defina sua nova senha
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
            Escolha uma senha nova e confirme para
            recuperar o acesso à sua conta LavaJá.
          </Text>
        </View>

        <Text style={styles.fieldLabel}>
          Nova senha
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
            marginBottom: 18,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={21}
            color={C.blue}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua nova senha"
            placeholderTextColor={C.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
            style={{
              flex: 1,
              marginLeft: 10,
              color: C.text,
              fontSize: 15,
            }}
          />

          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={C.muted}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        <Text style={styles.fieldLabel}>
          Confirmar nova senha
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
            name="shield-checkmark-outline"
            size={21}
            color={C.blue}
          />

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Digite novamente sua senha"
            placeholderTextColor={C.muted}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
            style={{
              flex: 1,
              marginLeft: 10,
              color: C.text,
              fontSize: 15,
            }}
          />

          <Ionicons
            name={
              showConfirmPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={22}
            color={C.muted}
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        </View>

        <PrimaryButton
          title={loading ? 'Salvando...' : 'Salvar nova senha'}
          onPress={salvarNovaSenha}
          icon="checkmark"
        />

        {loading && (
          <ActivityIndicator
            color={C.blue}
            style={{ marginTop: 16 }}
          />
        )}

        <Text
          style={{
            color: C.muted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 18,
          }}
        >
          A senha deve conter pelo menos 6 caracteres.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
