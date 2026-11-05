
import React, { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';

import Field from '../../components/Field';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';

import type { ServiceItem } from '../../data/services';
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
  selectedService: ServiceItem;
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

  const [erroEndereco, setErroEndereco] = useState('');
  const [erroNumero, setErroNumero] = useState('');
  const [erroData, setErroData] = useState('');
  const [erroHorario, setErroHorario] = useState('');

  // CONSULTAR CEP
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
      setErroEndereco('');

    } catch {
      setErroCep(
        'Não foi possível consultar o CEP. Verifique sua conexão.'
      );
    } finally {
      setBuscandoCep(false);
    }
  };

  // VALIDAR FORMULÁRIO
  const continuar = () => {
    let valido = true;

    setErroCep('');
    setErroEndereco('');
    setErroNumero('');
    setErroData('');
    setErroHorario('');

    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setErroCep('Digite um CEP válido com 8 números.');
      valido = false;
    }

    if (!address.trim()) {
      setErroEndereco('O endereço de coleta é obrigatório.');
      valido = false;
    }

    if (!numero.trim()) {
      setErroNumero('O número da residência é obrigatório.');
      valido = false;
    }

    if (!date) {
      setErroData('Selecione o dia da coleta.');
      valido = false;
    }

    if (!time) {
      setErroHorario('Selecione uma janela de horário.');
      valido = false;
    }

    if (!valido) return;

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
        {/* PROGRESSO */}
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
          1. Serviço selecionado
        </Text>

        <View style={styles.optionCardSelected}>
          <View style={styles.optionRadioSelected}>
            <View style={styles.radioDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{selectedService.name}</Text>
            <Text style={styles.optionDetail}>{selectedService.detail || selectedService.description}</Text>
          </View>
          <Text style={styles.optionPrice}>{money(selectedService.price)}</Text>
        </View>

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
          <Text style={validationStyles.error}>
            {erroCep}
          </Text>
        )}

        {enderecoEncontrado && (
          <Text style={validationStyles.success}>
            Endereço encontrado com sucesso!
          </Text>
        )}

        {/* RUA, BAIRRO, CIDADE */}
        <Field
          label="Rua, bairro, cidade e estado"
          value={address}
          onChangeText={(value) => {
            setAddress(value);
            if (erroEndereco) setErroEndereco('');
          }}
          placeholder="O endereço será preenchido pelo CEP"
          icon="home-outline"
        />

        {erroEndereco ? (
          <Text style={validationStyles.error}>
            {erroEndereco}
          </Text>
        ) : null}

        {/* NÚMERO */}
        <Field
          label="Número da residência"
          value={numero}
          onChangeText={(value) => {
            setNumero(value);
            if (erroNumero) setErroNumero('');
          }}
          placeholder="Ex.: 123"
          icon="business-outline"
        />

        {erroNumero ? (
          <Text style={validationStyles.error}>
            {erroNumero}
          </Text>
        ) : null}

        {/* COMPLEMENTO */}
        <Field
          label="Complemento (opcional)"
          value={complemento}
          onChangeText={setComplemento}
          placeholder="Apartamento, bloco, casa..."
          icon="albums-outline"
        />

        {/* INSTRUÇÕES */}
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
              onPress={() => {
                setDate(d);
                setErroData('');
              }}
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

        {erroData ? (
          <Text style={validationStyles.error}>
            {erroData}
          </Text>
        ) : null}

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          Janela de horário
        </Text>

        <View style={styles.chipRow}>
          {['10h–12h', '14h–16h', '18h–20h'].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setTime(t);
                setErroHorario('');
              }}
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

        {erroHorario ? (
          <Text style={validationStyles.error}>
            {erroHorario}
          </Text>
        ) : null}

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

        {/* CONTINUAR */}
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

const validationStyles = {
  error: {
    color: '#D64545',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 12,
    marginLeft: 4,
  },
  success: {
    color: C.green,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
};
