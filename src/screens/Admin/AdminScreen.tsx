
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import Header from '../../components/Header';

type Props = {
  currentStep: number;
  onChangeStep: (step: number) => void;
  onBack: () => void;
};

const steps = [
  'Pedido recebido',
  'Coleta das roupas',
  'Lavagem',
  'Secagem',
  'Pronto para entrega',
  'Pedido entregue',
];

export default function AdminScreen({
  currentStep,
  onChangeStep,
  onBack,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title="Painel da lavanderia"
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Gerenciar pedido</Text>
        <Text style={styles.subtitle}>
          Atualize a etapa conforme o serviço avança.
        </Text>

        <View style={styles.orderCard}>
          <Text style={styles.label}>PEDIDO</Text>
          <Text style={styles.orderNumber}>LJ-2048</Text>
          <Text style={styles.service}>Lavagem e dobra</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>STATUS ATUAL</Text>
          <Text style={styles.currentStatus}>
            {steps[currentStep]}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Atualizar andamento
        </Text>

        {steps.map((step, index) => {
          const selected = index === currentStep;
          const completed = index < currentStep;

          return (
            <TouchableOpacity
              key={step}
              activeOpacity={0.75}
              style={[
                styles.stepButton,
                selected && styles.selectedStep,
              ]}
              onPress={() => onChangeStep(index)}
            >
              <View style={styles.stepIcon}>
                <Ionicons
                  name={
                    completed
                      ? 'checkmark-circle'
                      : selected
                      ? 'radio-button-on'
                      : 'ellipse-outline'
                  }
                  size={23}
                  color={
                    completed
                      ? C.green
                      : selected
                      ? C.blue
                      : C.muted
                  }
                />
              </View>

              <View style={styles.stepInfo}>
                <Text
                  style={[
                    styles.stepTitle,
                    selected && styles.selectedText,
                  ]}
                >
                  {step}
                </Text>

                <Text style={styles.stepDescription}>
                  {completed
                    ? 'Etapa concluída'
                    : selected
                    ? 'Etapa atual do pedido'
                    : 'Aguardando'}
                </Text>
              </View>

              {selected && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    ATUAL
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.warning}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={C.blue}
          />
          <Text style={styles.warningText}>
            Ao selecionar uma etapa, o acompanhamento do
            cliente será atualizado neste aplicativo.
          </Text>
        </View>

        <Text style={styles.demoNote}>
          Painel demonstrativo. As alterações ainda não são
          salvas em um banco de dados.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  heading: {
    color: C.navy,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 23,
  },
  label: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  orderNumber: {
    color: C.navy,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  service: {
    color: C.muted,
    fontSize: 12,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 15,
  },
  currentStatus: {
    color: C.blue,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    padding: 13,
    marginBottom: 9,
  },
  selectedStep: {
    borderColor: C.blue,
    backgroundColor: C.paleBlue,
  },
  stepIcon: {
    marginRight: 11,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedText: {
    color: C.blue,
  },
  stepDescription: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: C.blue,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  currentBadgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: '800',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#EDF5FF',
    borderRadius: 13,
    padding: 13,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    color: C.text,
    fontSize: 11,
    lineHeight: 17,
  },
  demoNote: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 15,
  },
});
