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

export default function ScheduleScreen({ service, setService, address, setAddress, instructions, setInstructions, date, setDate, time, setTime, selectedService, navigate, continueToPayment }: Props) {
  return (
  <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <Header title="Agendar coleta" onBack={() => navigate('home')} />
    <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
      <View style={styles.stepProgress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressInactive} /></View>
      <Text style={styles.pageHeadline}>Vamos buscar suas roupas.</Text>
      <Text style={styles.pageSub}>Escolha o serviço, endereço e melhor horário.</Text>
      <Text style={styles.formSectionTitle}>1. Escolha o serviço</Text>
      {services.map(item => (
        <TouchableOpacity key={item.name} onPress={() => setService(item.name)} style={[styles.optionCard, service === item.name && styles.optionCardSelected]}>
          <View style={[styles.optionRadio, service === item.name && styles.optionRadioSelected]}>{service === item.name ? <View style={styles.radioDot} /> : null}</View>
          <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{item.name}</Text><Text style={styles.optionDetail}>{item.detail}</Text></View>
          <Text style={styles.optionPrice}>{money(item.price)}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.formSectionTitle}>2. Endereço de coleta</Text>
      <Field label="Rua, número e complemento" value={address} onChangeText={setAddress} placeholder="Ex.: Rua das Flores, 123, ap. 4" icon="location-outline" />
      <Field label="Instruções para o entregador (opcional)" value={instructions} onChangeText={setInstructions} placeholder="Portaria, ponto de referência..." icon="chatbubble-ellipses-outline" />
      <Text style={styles.formSectionTitle}>3. Quando podemos buscar?</Text>
      <Text style={styles.fieldLabel}>Dia da coleta</Text>
      <View style={styles.chipRow}>{['Hoje, 29 out.', 'Amanhã, 30 out.', 'Sáb., 31 out.'].map(d => <TouchableOpacity key={d} onPress={() => setDate(d)} style={[styles.chip, date === d && styles.chipSelected]}><Text style={[styles.chipText, date === d && styles.chipTextSelected]}>{d}</Text></TouchableOpacity>)}</View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Janela de horário</Text>
      <View style={styles.chipRow}>{['10h–12h', '14h–16h', '18h–20h'].map(t => <TouchableOpacity key={t} onPress={() => setTime(t)} style={[styles.timeChip, time === t && styles.chipSelected]}><Text style={[styles.chipText, time === t && styles.chipTextSelected]}>{t}</Text></TouchableOpacity>)}</View>
      <View style={styles.priceSummary}>
        <View><Text style={styles.summaryLabel}>Serviço selecionado</Text><Text style={styles.summaryValue}>{service}</Text></View>
        <Text style={styles.summaryPrice}>{money(selectedService.price)}</Text>
      </View>
      <PrimaryButton title="Continuar para pagamento" onPress={continueToPayment} icon="arrow-forward" />
      <Text style={styles.smallDisclaimer}>Valores estimados para demonstração. O preço final pode variar conforme peso e peças.</Text>
    </ScrollView>
  </SafeAreaView>
  );
}
