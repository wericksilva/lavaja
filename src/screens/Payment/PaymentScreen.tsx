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
import type { ServiceItem } from '../../data/services';
import { money } from '../../utils/money';
import { formatDatePtBr } from '../../utils/date';
import type { Navigate, Service, PaymentMethod } from '../../types';

type Props = {
service: Service;
  date: string;
  time: string;
  address: string;
  instructions: string;
  payment: PaymentMethod;
  setPayment: (value: PaymentMethod) => void;
  selectedService: ServiceItem;
  total: number;
  navigate: Navigate;
  confirmOrder: () => void;
  confirming?: boolean;
};

export default function PaymentScreen({ service, date, time, address, instructions, payment, setPayment, selectedService, total, navigate, confirmOrder, confirming = false }: Props) {
  return (
  <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <Header title="Pagamento" onBack={() => navigate('schedule')} />
    <ScrollView contentContainerStyle={styles.formPage}>
      <View style={styles.stepProgress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /></View>
      <Text style={styles.pageHeadline}>Quase tudo pronto!</Text>
      <Text style={styles.pageSub}>Confira os detalhes e escolha como pagar.</Text>
      <View style={styles.orderCard}>
        <View style={styles.orderCardTop}><View style={styles.orderIcon}><Ionicons name="shirt-outline" size={23} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={styles.orderTitle}>{service}</Text><Text style={styles.orderSub}>Coleta: {formatDatePtBr(date)} · {time}</Text></View><TouchableOpacity onPress={() => navigate('schedule')}><Text style={styles.linkText}>Editar</Text></TouchableOpacity></View>
        <View style={styles.cardDivider} />
        <View style={styles.addressLine}><Ionicons name="location-outline" size={18} color={C.muted} /><Text style={styles.addressText}>{address}</Text></View>
        {instructions ? <Text style={styles.instructionText}>Instruções: {instructions}</Text> : null}
      </View>
      <Text style={styles.formSectionTitle}>Forma de pagamento</Text>
      {([{ name: 'Pix' as PaymentMethod, icon: 'qr-code-outline' as const, detail: 'Pague na confirmação do pedido' }, { name: 'Cartão de crédito' as PaymentMethod, icon: 'card-outline' as const, detail: 'Crédito ou débito' }, { name: 'Pagar na entrega' as PaymentMethod, icon: 'wallet-outline' as const, detail: 'Confirme com o entregador' }]).map(p => (
        <TouchableOpacity key={p.name} onPress={() => setPayment(p.name)} style={[styles.paymentOption, payment === p.name && styles.optionCardSelected]}>
          <Ionicons name={p.icon} size={23} color={C.blue} />
          <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{p.name}</Text><Text style={styles.optionDetail}>{p.detail}</Text></View>
          <View style={[styles.optionRadio, payment === p.name && styles.optionRadioSelected]}>{payment === p.name ? <View style={styles.radioDot} /> : null}</View>
        </TouchableOpacity>
      ))}
      <View style={styles.priceBreakdown}>
        <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Serviço · {service}</Text><Text style={styles.breakdownValue}>{money(selectedService.price)}</Text></View>
        <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Coleta e entrega</Text><Text style={styles.breakdownValue}>{money(total - selectedService.price)}</Text></View>
        <View style={styles.cardDivider} />
        <View style={styles.breakdownRow}><Text style={styles.totalLabel}>Total estimado</Text><Text style={styles.totalValue}>{money(total)}</Text></View>
      </View>
      <PrimaryButton title={confirming ? 'Criando pedido...' : 'Confirmar pedido'} onPress={confirmOrder} icon={confirming ? undefined : 'checkmark-circle-outline'} disabled={confirming} />
      <Text style={styles.smallDisclaimer}>Demonstração: nenhum pagamento real será cobrado nesta versão.</Text>
    </ScrollView>
  </SafeAreaView>
  );
}
