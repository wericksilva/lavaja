
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Field from '../../components/Field';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import { services } from '../../data/services';
import { money } from '../../utils/money';
import type { Navigate, Service } from '../../types';

type Props = {
  service: Service;
  setService: (value: Service) => void;
  address: string;
  setAddress: (value: string) => void;
  instructions: string;
  setInstructions: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  selectedService: (typeof services)[number];
  navigate: Navigate;
  continueToPayment: () => void;
};

export default function ScheduleScreen({
  service,
  setService,
  address,
  setAddress,
  instructions,
  setInstructions,
  date,
  setDate,
  time,
  setTime,
  selectedService,
  navigate,
  continueToPayment,
}: Props) {

  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');
  const [enderecoEncontrado, setEnderecoEncontrado] = useState(false);

  const buscarCep = async (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8);

    const cepFormatado = apenasNumeros.replace(
      /^(\d{5})(\d)/,
      '$1-$2'
    );

    setCep(cepFormatado);
    setErroCep('');
    setEnderecoEncontrado(false);

    if (apenasNumeros.length !== 8) {
      setAddress('');
      return;
    }

    try {
      setBuscandoCep(true);

      const resposta = await fetch(
        `https://viacep.com.br/ws/${apenasNumeros}/json/`
      );

      if (!resposta.ok) {
        throw new Error('Falha na consulta');
      }

      const dados = await resposta.json();

      if (dados.erro) {
        setAddress('');
        setErroCep('CEP não encontrado. Confira os números.');
        return;
      }

      const enderecoCompleto = [
        dados.logradouro,
        dados.bairro,
        dados.localidade,
        dados.uf,
      ]
        .filter(Boolean)
        .join(', ');

      setAddress(enderecoCompleto);
      setEnderecoEncontrado(true);

    } catch (error) {
      setErroCep(
        'Não foi possível consultar o CEP. Verifique sua conexão.'
      );
    } finally {
      setBuscandoCep(false);
    }
  };

  const continuar = () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      Alert.alert('CEP obrigatório', 'Digite um CEP válido com 8 números.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Endereço obrigatório', 'Informe seu endereço de coleta.');
      return;
    }

    if (!numero.trim()) {
      Alert.alert('Número obrigatório', 'Informe o número da residência.');
      return;
    }

    const enderecoFinal = [
      address,
      `Nº ${numero}`,
      complemento.trim() ? complemento : '',
      `CEP: ${cep}`,
    ]
      .filter(Boolean)
      .join(', ');

    setAddress(enderecoFinal);
    continueToPayment();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <Header
        title="Agendar coleta"
        onBack={() => navigate('home')}
      />

      <ScrollView
        contentContainerStyle={styles.formPage}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.stepProgress}>
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.pageHeadline}>
          Vamos buscar suas roupas.
        </Text>

        <Text style={styles.pageSub}>
          Escolha o serviço, endereço e melhor horário.
        </Text>

        {/* SERVIÇO */}

        <Text style={styles.formSectionTitle}>
          1. Escolha o serviço
        </Text>

        {services.map(item => (
          <TouchableOpacity
            key={item.name}
            onPress={() => setService(item.name)}
            style={[
              styles.optionCard,
              service === item.name && styles.optionCardSelected,
            ]}
          >
            <View
              style={[
                styles.optionRadio,
                service === item.name && styles.optionRadioSelected,
              ]}
            >
              {service === item.name ? (
                <View style={styles.radioDot} />
              ) : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>
                {item.name}
              </Text>

              <Text style={styles.optionDetail}>
                {item.detail}
              </Text>
            </View>

            <Text style={styles.optionPrice}>
              {money(item.price)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* ENDEREÇO */}

        <Text style={styles.formSectionTitle}>
          2. Endereço de coleta
        </Text>

        <Text style={styles.fieldLabel}>
          CEP
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.white,
            borderWidth: 1,
            borderColor: erroCep ? '#D64545' : C.line,
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 52,
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={C.blue}
          />

          <TextInput
            value={cep}
            onChangeText={buscarCep}
            placeholder="Digite seu CEP"
            keyboardType="numeric"
            maxLength={9}
            placeholderTextColor={C.muted}
            style={{
              flex: 1,
              marginLeft: 10,
              color: C.navy,
              fontSize: 15,
            }}
          />

          {buscandoCep ? (
            <ActivityIndicator color={C.blue} />
          ) : enderecoEncontrado ? (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={C.green}
            />
          ) : null}
        </View>

        {erroCep !== '' && (
          <Text
            style={{
              color: '#D64545',
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {erroCep}
          </Text>
        )}

        {enderecoEncontrado && (
          <Text
            style={{
              color: C.green,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            Endereço encontrado com sucesso!
          </Text>
        )}

        <Field
          label="Rua, bairro, cidade e estado"
          value={address}
          onChangeText={setAddress}
          placeholder="O endereço será preenchido pelo CEP"
          icon="home-outline"
        />

        <Field
          label="Número da residência"
          value={numero}
          onChangeText={setNumero}
          placeholder="Ex.: 123"
          icon="business-outline"
        />

        <Field
          label="Complemento (opcional)"
          value={complemento}
          onChangeText={setComplemento}
          placeholder="Apartamento, bloco, casa..."
          icon="albums-outline"
        />

        <Field
          label="Instruções para o entregador (opcional)"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Portaria, ponto de referência..."
          icon="chatbubble-ellipses-outline"
        />

        {/* DATA E HORÁRIO */}

        <Text style={styles.formSectionTitle}>
          3. Quando podemos buscar?
        </Text>

        <Text style={styles.fieldLabel}>
          Dia da coleta
        </Text>

        <View style={styles.chipRow}>
          {['Hoje, 29 out.', 'Amanhã, 30 out.', 'Sáb., 31 out.'].map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setDate(d)}
              style={[
                styles.chip,
                date === d && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  date === d && styles.chipTextSelected,
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          Janela de horário
        </Text>

        <View style={styles.chipRow}>
          {['10h–12h', '14h–16h', '18h–20h'].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTime(t)}
              style={[
                styles.timeChip,
                time === t && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  time === t && styles.chipTextSelected,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RESUMO */}

        <View style={styles.priceSummary}>
          <View>
            <Text style={styles.summaryLabel}>
              Serviço selecionado
            </Text>

            <Text style={styles.summaryValue}>
              {service}
            </Text>
          </View>

          <Text style={styles.summaryPrice}>
            {money(selectedService.price)}
          </Text>
        </View>

        <PrimaryButton
          title="Continuar para pagamento"
          onPress={continuar}
          icon="arrow-forward"
        />

        <Text style={styles.smallDisclaimer}>
          Valores estimados para demonstração.
          O preço final pode variar conforme peso e peças.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

