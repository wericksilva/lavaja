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
import { formatDatePtBr } from '../../utils/date';
import type { Navigate, Service, PaymentMethod } from '../../types';

type Props = {
orderNumber: string;
  date: string;
  time: string;
  address: string;
  payment: PaymentMethod;
  total: number;
  resetOrder: () => void;
};

export default function ConfirmationScreen({ orderNumber, date, time, address, payment, total, resetOrder }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
  <ExpoStatusBar style="dark" />
  <ScrollView contentContainerStyle={styles.confirmPage}>
    <View style={styles.successCircle}><Ionicons name="checkmark" size={48} color="#fff" /></View>
    <Text style={styles.confirmTitle}>Pedido agendado!</Text>
    <Text style={styles.confirmSub}>Pode deixar com a gente. Vamos avisar você quando o entregador estiver a caminho.</Text>
    <View style={styles.confirmNumber}><Text style={styles.confirmNumberLabel}>NÚMERO DO PEDIDO</Text><Text style={styles.confirmNumberValue}>{orderNumber}</Text></View>
    <View style={styles.confirmDetails}>
      <View style={styles.confirmRow}><Ionicons name="calendar-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Coleta</Text><Text style={styles.confirmDetailValue}>{formatDatePtBr(date)} · {time}</Text></View></View>
      <View style={styles.confirmRow}><Ionicons name="location-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Endereço</Text><Text style={styles.confirmDetailValue}>{address}</Text></View></View>
      <View style={styles.confirmRow}><Ionicons name="card-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Forma de pagamento informada</Text><Text style={styles.confirmDetailValue}>{payment} · {money(total)}</Text></View></View>
    </View>
    <View style={styles.statusNotice}><Ionicons name="notifications-outline" size={21} color={C.green} /><Text style={styles.statusNoticeText}>Este é um pedido de demonstração. Rastreamento e notificações serão conectados ao backend.</Text></View>
    <PrimaryButton title="Voltar para o início" onPress={resetOrder} icon="home-outline" />
  </ScrollView>
    </SafeAreaView>
  );
}
