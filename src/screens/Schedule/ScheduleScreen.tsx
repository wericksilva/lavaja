
import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StyleSheet,
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
import { formatDatePtBr, getTodayISODate } from '../../utils/date';

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
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const selected = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date();
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });
  const [timeDraft, setTimeDraft] = useState(time);
  const [timeDraftError, setTimeDraftError] = useState('');

  const todayISO = getTodayISODate();
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const firstWeekday = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarCells = useMemo(
    () => [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
    [firstWeekday, daysInMonth],
  );

  const openDatePicker = () => {
    const selected = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date();
    setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setDatePickerVisible(true);
  };

  const openTimePicker = () => {
    setTimeDraft(time || '14:00');
    setTimeDraftError('');
    setTimePickerVisible(true);
  };

  const changeTimeDraft = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2
      ? `${digits.slice(0, 2)}:${digits.slice(2)}`
      : digits;
    setTimeDraft(formatted);
    setTimeDraftError('');
  };

  const confirmTime = () => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeDraft)) {
      setTimeDraftError('Informe um horário válido entre 00:00 e 23:59.');
      return;
    }
    if (date === todayISO) {
      const selectedDateTime = new Date(`${date}T${timeDraft}:00`);
      if (selectedDateTime.getTime() <= Date.now()) {
        setTimeDraftError('Escolha um horário futuro para a coleta.');
        return;
      }
    }
    setTime(timeDraft);
    setErroHorario('');
    setTimePickerVisible(false);
  };

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
      setErroHorario('Selecione um horário para a coleta.');
      valido = false;
    } else if (date === todayISO && new Date(`${date}T${time}:00`).getTime() <= Date.now()) {
      setErroHorario('O horário escolhido já passou. Selecione um horário futuro.');
      valido = false;
    }

    if (date && date < todayISO) {
      setErroData('A data da coleta não pode estar no passado.');
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

        <Text style={styles.fieldLabel}>Dia da coleta</Text>
        <TouchableOpacity
          style={pickerStyles.selectionButton}
          onPress={openDatePicker}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={21} color={C.blue} />
          <View style={pickerStyles.selectionTextWrap}>
            <Text style={pickerStyles.selectionLabel}>Data escolhida</Text>
            <Text style={pickerStyles.selectionValue}>
              {date ? formatDatePtBr(date) : 'Selecione o dia'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={C.muted} />
        </TouchableOpacity>

        {erroData ? (
          <Text style={validationStyles.error}>{erroData}</Text>
        ) : null}

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Horário da coleta</Text>
        <TouchableOpacity
          style={pickerStyles.selectionButton}
          onPress={openTimePicker}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={21} color={C.blue} />
          <View style={pickerStyles.selectionTextWrap}>
            <Text style={pickerStyles.selectionLabel}>Horário escolhido</Text>
            <Text style={pickerStyles.selectionValue}>{time || 'Selecione o horário'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={C.muted} />
        </TouchableOpacity>

        {erroHorario ? (
          <Text style={validationStyles.error}>{erroHorario}</Text>
        ) : null}

        {/* CALENDÁRIO PERSONALIZADO */}
        <Modal
          visible={datePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View style={pickerStyles.overlay}>
            <View style={pickerStyles.modal}>
              <View style={pickerStyles.modalHeader}>
                <View>
                  <Text style={pickerStyles.modalTitle}>Escolha a data</Text>
                  <Text style={pickerStyles.modalSubtitle}>Você pode agendar a partir de hoje.</Text>
                </View>
                <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                  <Ionicons name="close" size={24} color={C.muted} />
                </TouchableOpacity>
              </View>

              <View style={pickerStyles.monthHeader}>
                <TouchableOpacity
                  disabled={calendarYear === new Date().getFullYear() && calendarMonthIndex === new Date().getMonth()}
                  onPress={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))}
                  style={pickerStyles.monthArrow}
                >
                  <Ionicons name="chevron-back" size={20} color={C.blue} />
                </TouchableOpacity>
                <Text style={pickerStyles.monthTitle}>
                  {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity
                  onPress={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))}
                  style={pickerStyles.monthArrow}
                >
                  <Ionicons name="chevron-forward" size={20} color={C.blue} />
                </TouchableOpacity>
              </View>

              <View style={pickerStyles.calendarGrid}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <View key={day} style={pickerStyles.calendarCell}>
                    <Text style={pickerStyles.weekday}>{day}</Text>
                  </View>
                ))}
                {calendarCells.map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={pickerStyles.calendarCell} />;
                  }
                  const month = String(calendarMonthIndex + 1).padStart(2, '0');
                  const dayText = String(day).padStart(2, '0');
                  const isoDate = `${calendarYear}-${month}-${dayText}`;
                  const disabled = isoDate < todayISO;
                  const selected = date === isoDate;
                  return (
                    <TouchableOpacity
                      key={isoDate}
                      disabled={disabled}
                      onPress={() => {
                        setDate(isoDate);
                        setErroData('');
                        setDatePickerVisible(false);
                      }}
                      style={[
                        pickerStyles.calendarCell,
                        pickerStyles.dayCell,
                        selected && pickerStyles.dayCellSelected,
                        disabled && pickerStyles.dayCellDisabled,
                      ]}
                    >
                      <Text style={[
                        pickerStyles.dayText,
                        selected && pickerStyles.dayTextSelected,
                        disabled && pickerStyles.dayTextDisabled,
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={pickerStyles.modalCancel}
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={pickerStyles.modalCancelText}>Fechar calendário</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* HORÁRIO LIVRE */}
        <Modal
          visible={timePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={pickerStyles.overlay}>
            <View style={pickerStyles.modal}>
              <View style={pickerStyles.modalHeader}>
                <View>
                  <Text style={pickerStyles.modalTitle}>Escolha o horário</Text>
                  <Text style={pickerStyles.modalSubtitle}>Digite o horário que prefere para a coleta.</Text>
                </View>
                <TouchableOpacity onPress={() => setTimePickerVisible(false)}>
                  <Ionicons name="close" size={24} color={C.muted} />
                </TouchableOpacity>
              </View>

              <Text style={pickerStyles.timeLabel}>Horário (24 horas)</Text>
              <TextInput
                value={timeDraft}
                onChangeText={changeTimeDraft}
                placeholder="Ex.: 09:30"
                keyboardType="numeric"
                maxLength={5}
                style={pickerStyles.timeInput}
                placeholderTextColor={C.muted}
              />
              {timeDraftError ? (
                <Text style={validationStyles.error}>{timeDraftError}</Text>
              ) : null}

              <TouchableOpacity style={pickerStyles.confirmButton} onPress={confirmTime}>
                <Text style={pickerStyles.confirmButtonText}>Confirmar horário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={pickerStyles.modalCancel}
                onPress={() => setTimePickerVisible(false)}
              >
                <Text style={pickerStyles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

const pickerStyles = StyleSheet.create({
  selectionButton: {
    minHeight: 64,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  selectionTextWrap: { flex: 1 },
  selectionLabel: { color: C.muted, fontSize: 11, marginBottom: 4 },
  selectionValue: { color: C.navy, fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modal: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  modalTitle: { color: C.navy, fontSize: 19, fontWeight: '900' },
  modalSubtitle: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 290 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  monthArrow: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { color: C.navy, fontSize: 15, fontWeight: '800', textTransform: 'capitalize' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', height: 40, alignItems: 'center', justifyContent: 'center' },
  weekday: { color: C.muted, fontSize: 11, fontWeight: '700' },
  dayCell: { borderRadius: 11 },
  dayCellSelected: { backgroundColor: C.blue },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { color: C.navy, fontSize: 13, fontWeight: '600' },
  dayTextSelected: { color: C.white, fontWeight: '900' },
  dayTextDisabled: { color: C.muted },
  modalCancel: { alignItems: 'center', paddingVertical: 13, marginTop: 5 },
  modalCancelText: { color: C.muted, fontSize: 13, fontWeight: '700' },
  timeLabel: { color: C.navy, fontSize: 12, fontWeight: '800', marginTop: 24, marginBottom: 8 },
  timeInput: { height: 58, borderWidth: 1, borderColor: C.line, borderRadius: 13, paddingHorizontal: 16, color: C.navy, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  confirmButton: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  confirmButtonText: { color: C.white, fontSize: 13, fontWeight: '900' },
});

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
