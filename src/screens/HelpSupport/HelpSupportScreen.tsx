import React, { useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import type { Screen } from '../../types';

type Props = {
  navigate: (screen: Screen) => void;
};

type FormErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const WHATSAPP_NUMBER = '5561991699805';

export default function HelpSupportScreen({ navigate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const openWhatsApp = async () => {
    const text = encodeURIComponent(
      'Olá! Preciso de ajuda com o aplicativo LavaJá.'
    );

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível abrir o WhatsApp. Tente novamente.'
      );
    }
  };

  const validateField = (
    field: keyof FormErrors,
    value: string
  ): string | undefined => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      const fieldNames: Record<keyof FormErrors, string> = {
        name: 'Nome',
        email: 'E-mail',
        subject: 'Assunto',
        message: 'Mensagem',
      };

      return `O campo ${fieldNames[field]} é obrigatório.`;
    }

    if (
      field === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
    ) {
      return 'Digite um endereço de e-mail válido.';
    }

    return undefined;
  };

  const handleChange = (
    field: keyof FormErrors,
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: validateField(field, value),
      }));
    }
  };

  const submitForm = () => {
    const newErrors: FormErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      subject: validateField('subject', subject),
      message: validateField('message', message),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (error) => Boolean(error)
    );

    if (hasErrors) {
      return;
    }

    Alert.alert(
      'Mensagem registrada',
      'O formulário está pronto. O envio real será ativado quando conectarmos o serviço de atendimento do LavaJá.'
    );

    setSubject('');
    setMessage('');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate('profile')}
        >
          <Text style={styles.backText}>‹ Voltar ao perfil</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ajuda e suporte</Text>

        <Text style={styles.subtitle}>
          Estamos aqui para ajudar. Escolha uma das opções abaixo.
        </Text>

        {/* ATENDIMENTO WHATSAPP */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappIcon}>
            <Text style={styles.whatsappIconText}>W</Text>
          </View>

          <View style={styles.whatsappContent}>
            <Text style={styles.cardTitle}>Fale pelo WhatsApp</Text>

            <Text style={styles.cardDescription}>
              Converse com nossa equipe de atendimento.
            </Text>

            <Text style={styles.phone}>(61) 99169-9805</Text>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={openWhatsApp}
            >
              <Text style={styles.whatsappButtonText}>
                Abrir WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULÁRIO DE CONTATO */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Envie uma mensagem</Text>

          <Text style={styles.cardDescription}>
            Preencha os campos e deixe sua dúvida ou solicitação.
          </Text>

          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Seu nome"
            placeholderTextColor="#8A94A6"
            value={name}
            onChangeText={(value) =>
              handleChange('name', value, setName)
            }
            autoCapitalize="words"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#8A94A6"
            value={email}
            onChangeText={(value) =>
              handleChange('email', value, setEmail)
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <Text style={styles.label}>Assunto</Text>

          <TextInput
            style={[styles.input, errors.subject && styles.inputError]}
            placeholder="Qual é o assunto?"
            placeholderTextColor="#8A94A6"
            value={subject}
            onChangeText={(value) =>
              handleChange('subject', value, setSubject)
            }
          />
          {errors.subject && (
            <Text style={styles.errorText}>{errors.subject}</Text>
          )}

          <Text style={styles.label}>Mensagem</Text>

          <TextInput
            style={[
              styles.input,
              styles.messageInput,
              errors.message && styles.inputError,
            ]}
            placeholder="Escreva sua mensagem..."
            placeholderTextColor="#8A94A6"
            value={message}
            onChangeText={(value) =>
              handleChange('message', value, setMessage)
            }
            multiline
            textAlignVertical="top"
          />
          {errors.message && (
            <Text style={styles.errorText}>{errors.message}</Text>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitForm}
          >
            <Text style={styles.submitButtonText}>
              Enviar mensagem
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            O envio pelo formulário será conectado ao serviço de
            atendimento em uma próxima etapa.
          </Text>
        </View>

        {/* DÚVIDAS FREQUENTES */}
        <View style={styles.faqCard}>
          <Text style={styles.sectionTitle}>Dúvidas frequentes</Text>

          <Text style={styles.faqQuestion}>
            Como faço um agendamento?
          </Text>

          <Text style={styles.faqAnswer}>
            Acesse a tela inicial, escolha o serviço desejado e siga
            as etapas do agendamento.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.faqQuestion}>
            Como acompanho meu pedido?
          </Text>

          <Text style={styles.faqAnswer}>
            Acesse a área de pedidos e selecione o pedido para
            consultar o andamento.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.faqQuestion}>
            Preciso alterar meu endereço?
          </Text>

          <Text style={styles.faqAnswer}>
            Entre em contato com nossa equipe pelo WhatsApp para
            receber orientação.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    padding: 20,
    paddingBottom: 36,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },

  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '600',
  },

  title: {
    color: '#142B4A',
    fontSize: 27,
    fontWeight: '800',
    marginBottom: 7,
  },

  subtitle: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  whatsappCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAF1',
  },

  whatsappIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  whatsappIconText: {
    color: '#159957',
    fontSize: 22,
    fontWeight: '800',
  },

  whatsappContent: {
    flex: 1,
  },

  cardTitle: {
    color: '#142B4A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
  },

  cardDescription: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },

  phone: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  whatsappButton: {
    backgroundColor: '#159957',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 9,
    alignSelf: 'flex-start',
    marginTop: 13,
  },

  whatsappButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#142B4A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 7,
  },

  label: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 7,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D7DFEA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#142B4A',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },

  inputError: {
    borderColor: '#D92D20',
  },

  errorText: {
    color: '#D92D20',
    fontSize: 12,
    marginTop: 5,
  },

  messageInput: {
    minHeight: 110,
  },

  submitButton: {
    backgroundColor: '#1769AA',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  note: {
    color: '#8A94A6',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EAF1',
  },

  faqQuestion: {
    color: '#142B4A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 13,
    marginBottom: 5,
  },

  faqAnswer: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
  },

  separator: {
    height: 1,
    backgroundColor: '#EDF0F5',
    marginTop: 13,
  },
});
