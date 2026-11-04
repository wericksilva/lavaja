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
import type { LaundryOrder } from '../../types/order';

type Props = {
  onBack: () => void;
  order: LaundryOrder;
};

const steps = [
  {
    title: 'Pedido recebido',
    description: 'Recebemos sua solicitação e estamos organizando tudo.',
    icon: 'receipt-outline' as const,
  },
  {
    title: 'Coleta das roupas',
    description: 'O entregador está a caminho para buscar suas roupas.',
    icon: 'bicycle-outline' as const,
  },
  {
    title: 'Lavagem',
    description: 'Suas roupas estão passando pelo processo de lavagem.',
    icon: 'water-outline' as const,
  },
  {
    title: 'Secagem',
    description: 'Estamos secando suas roupas com todo cuidado.',
    icon: 'sunny-outline' as const,
  },
  {
    title: 'Pronto para entrega',
    description: 'Seu pedido está pronto e será entregue em breve.',
    icon: 'cube-outline' as const,
  },
  {
    title: 'Pedido entregue',
    description: 'Suas roupas foram entregues. Obrigado por escolher a LavaJá!',
    icon: 'checkmark-done-outline' as const,
  },
];

export default function TrackingScreen({ onBack, order }: Props) {
  const currentStep = Number.isFinite(order.currentStep)
    ? Math.min(Math.max(Math.trunc(order.currentStep), 0), steps.length - 1)
    : 0;

  const isDelivered = currentStep === steps.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title="Acompanhar pedido" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.heading}>Acompanhe sua lavagem</Text>
          <Text style={styles.subtitle}>
            Veja em tempo real cada etapa do cuidado com suas roupas.
          </Text>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderTop}>
            <View style={styles.orderIcon}>
              <Ionicons name="shirt-outline" size={23} color={C.blue} />
            </View>

            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Pedido</Text>
              <Text style={styles.orderId}>{order.id}</Text>
            </View>

            <View
              style={isDelivered ? styles.statusDelivered : styles.statusBadge}
            >
              <View
                style={isDelivered ? styles.statusDotDelivered : styles.statusDot}
              />
              <Text
                style={isDelivered ? styles.statusTextDelivered : styles.statusText}
                >
                {isDelivered ? 'Pedido entregue' : 'Em andamento'}
              </Text>
            </View>
          </View>

          <View style={styles.orderDivider} />

          <View style={styles.orderDetails}>
            <View style={styles.orderDetail}>
              <Text style={styles.detailLabel}>Serviço</Text>
              <Text style={styles.detailValue}>{order.service}</Text>
            </View>

            <View style={styles.orderDetail}>
              <Text style={styles.detailLabel}>Data do pedido</Text>
              <Text style={styles.detailValue}>{order.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Progresso do pedido</Text>
              <Text style={styles.progressSubtitle}>
                Etapa {currentStep + 1} de {steps.length}
              </Text>
            </View>

            <Text style={styles.progressPercent}>
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={{
                ...styles.progressFill,
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </View>

          <View style={styles.timeline}>
            {steps.map((step, index) => {
              const completed = index < currentStep;
              const active = index === currentStep;
              const pending = index > currentStep;

              return (
                <View key={step.title} style={styles.timelineItem}>
                  <View style={styles.timelineVisual}>
                    <View
                      style={
                        completed
                          ? styles.stepCompleted
                          : active
                          ? styles.stepActive
                          : styles.stepPending
                      }
                    >
                      <Ionicons
                        name={
                          completed
                            ? 'checkmark'
                            : step.icon
                        }
                        size={17}
                        color={
                          completed || active ? C.white : C.muted
                           }
                      />
                    </View>

                    {index < steps.length - 1 && (
                      <View
                        style={
                          completed
                            ? styles.timelineLineCompleted
                            : styles.timelineLine
                        }
                      />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text
                      style={
                        active
                          ? styles.activeStepTitle
                          : pending
                          ? styles.pendingStepTitle
                          : styles.stepTitle
                      }
                    >
                      {step.title}
                    </Text>

                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>

                    {active && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>ETAPA ATUAL</Text>
                      </View>
                    )}

                    {completed && (
                      <Text style={styles.completedText}>Etapa concluída</Text>
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
            <Text style={styles.infoTitle}>Fique tranquilo!</Text>
            <Text style={styles.infoText}>
              Você pode acompanhar o andamento do seu pedido por esta tela.
              Quando uma etapa for atualizada, o progresso será exibido aqui.
            </Text>
          </View>
        </View>

        <Text style={styles.demoNote}>
            Acompanhamento demonstrativo. As atualizações são feitas pelo painel
          administrativo enquanto o aplicativo estiver aberto.
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
    marginTop: 10,
    marginBottom: 18,
  },
  heading: {
    color: C.navy,
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  orderCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 15,
    marginBottom: 16,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    color: C.muted,
    fontSize: 10,
  },
  orderId: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.paleBlue,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusDelivered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E7F7F1',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.blue,
  },
  statusDotDelivered: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  statusText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextDelivered: {
    color: C.green,
    fontSize: 9,
    fontWeight: '800',
  },
  orderDivider: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 13,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderDetail: {
    flex: 1,
  },
  detailLabel: {
    color: C.muted,
    fontSize: 10,
  },
  detailValue: {
    color: C.navy,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
   progressCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  progressSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  progressPercent: {
    color: C.blue,
    fontSize: 19,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    backgroundColor: C.line,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 22,
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.blue,
    borderRadius: 10,
  },
  timeline: {
    paddingTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 91,
  },
  timelineVisual: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
  },
  stepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepCompleted: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepPending: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    width: 2,
    backgroundColor: C.line,
  },
  timelineLineCompleted: {
    position: 'absolute',
    top: 30,
    bottom: 0,
    width: 2,
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
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  pendingStepTitle: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
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
