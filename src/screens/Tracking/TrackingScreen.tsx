import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import Header from '../../components/Header';

type Props = {
  onBack: () => void;
  currentStep: number;
};

const steps = [
  {
    title: 'Pedido recebido',
    description: 'Seu pedido foi confirmado com sucesso.',
  },
  {
    title: 'Coleta das roupas',
    description: 'Suas roupas foram coletadas.',
  },
  {
    title: 'Lavagem',
    description: 'Estamos cuidando das suas roupas.',
  },
  {
    title: 'Secagem',
    description: 'Suas roupas irão para a secagem.',
  },
  {
    title: 'Pronto para entrega',
    description: 'Seu pedido está sendo preparado.',
  },
  {
    title: 'Pedido entregue',
    description: 'Suas roupas foram entregues.',
  },
];

export default function TrackingScreen({
  onBack,
  currentStep,
}: Props) {

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title="Acompanhamento"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shirt-outline"
              size={30}
              color={C.blue}
            />
          </View>

          <Text style={styles.heading}>
            Acompanhe sua lavagem
          </Text>

          <Text style={styles.subtitle}>
            Veja cada etapa do cuidado com suas roupas.
          </Text>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.label}>NÚMERO DO PEDIDO</Text>
              <Text style={styles.orderNumber}>LJ-2048</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Em andamento
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.orderDetails}>
            <View>
              <Text style={styles.detailLabel}>Serviço</Text>
              <Text style={styles.detailValue}>
                Lavagem e dobra
              </Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>Data do pedido</Text>
              <Text style={styles.detailValue}>
                29 out. 2026
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            Andamento do pedido
          </Text>

          <Text style={styles.progressSubtitle}>
            Etapa {currentStep + 1} de {steps.length}
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                },
              ]}
            />
          </View>

          <View style={styles.timeline}>
            {steps.map((step, index) => {
              const completed = index < currentStep;
              const active = index === currentStep;

              return (
                <View
                  key={step.title}
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        completed && styles.stepCompleted,
                        active && styles.stepActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          completed
                            ? 'checkmark'
                            : active
                            ? 'water-outline'
                            : 'ellipse-outline'
                        }
                        size={completed ? 17 : 19}
                        color={
                          completed || active
                            ? C.white
                            : C.muted
                        }
                      />
                    </View>

                    {index !== steps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        active && styles.activeStepTitle,
                        !completed && !active && styles.pendingStepTitle,
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>

                    {active && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>
                          ETAPA ATUAL
                        </Text>
                      </View>
                    )}

                    {completed && (
                      <Text style={styles.completedText}>
                        Concluído
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={C.blue}
          />

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Fique tranquilo!
            </Text>

            <Text style={styles.infoText}>
              Seu pedido está sendo acompanhado. As etapas
              serão atualizadas conforme o andamento do serviço.
            </Text>
          </View>
        </View>

        <Text style={styles.demoNote}>
          Acompanhamento demonstrativo. A atualização automática
          será integrada ao sistema posteriormente.
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

  intro: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 22,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  heading: {
    color: C.navy,
    fontSize: 22,
    fontWeight: '800',
  },

  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  orderCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 15,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  label: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  orderNumber: {
    color: C.navy,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.paleBlue,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.blue,
  },

  statusText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
  },

  separator: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 15,
  },

  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  detailLabel: {
    color: C.muted,
    fontSize: 10,
  },

  detailValue: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  progressCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
  },

  progressTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '800',
  },

  progressSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
    marginBottom: 12,
  },

  progressBackground: {
    height: 7,
    borderRadius: 10,
    backgroundColor: C.line,
    overflow: 'hidden',
    marginBottom: 24,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: C.blue,
  },

  timeline: {
    marginTop: 2,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 83,
  },

  timelineLeft: {
    width: 35,
    alignItems: 'center',
  },

  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  stepCompleted: {
    backgroundColor: C.green,
  },

  stepActive: {
    backgroundColor: C.blue,
  },

  timelineLine: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    width: 2,
    backgroundColor: C.line,
  },

  timelineLineCompleted: {
    backgroundColor: C.green,
  },

  stepContent: {
    flex: 1,
    paddingLeft: 11,
    paddingBottom: 17,
  },

  stepTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },

  activeStepTitle: {
    color: C.blue,
  },

  pendingStepTitle: {
    color: C.muted,
  },

  stepDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.paleBlue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
  },

  currentBadgeText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '800',
  },

  completedText: {
    color: C.green,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF5FF',
    borderRadius: 15,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '800',
  },

  infoText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  demoNote: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 15,
  },
});