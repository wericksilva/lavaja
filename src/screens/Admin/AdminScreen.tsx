
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
import type { LaundryOrder } from '../../types/order';
import { money } from '../../utils/money';

type Props = {
  orders: LaundryOrder[];
  onChangeOrder: (id: string) => void;
  onBack: () => void;
  onServices: () => void;
};

const steps = [
  'Pedido recebido',
  'Coleta das roupas',
  'Lavagem',
  'Secagem',
  'Pronto para entrega',
  'Pedido entregue',
];

const getValidStep = (currentStep: number): number => {
  if (!Number.isFinite(currentStep)) {
    return 0;
  }

  return Math.min(
    Math.max(Math.trunc(currentStep), 0),
    steps.length - 1,
  );
};

export default function AdminScreen({
  orders,
  onChangeOrder,
  onBack,
  onServices,
}: Props) {
  const activeOrders = orders.filter(
    (order) => getValidStep(order.currentStep) < steps.length - 1,
  ).length;

  const deliveredOrders = orders.length - activeOrders;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title="Painel administrativo" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Gerenciar pedidos</Text>

        <Text style={styles.subtitle}>
          Acompanhe seus pedidos e gerencie sua lavanderia.
        </Text>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Pedidos</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{activeOrders}</Text>
            <Text style={styles.summaryLabel}>Em andamento</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{deliveredOrders}</Text>
            <Text style={styles.summaryLabel}>Entregues</Text>
          </View>
        </View>

        {/* ACESSO AOS SERVIÇOS */}
        <TouchableOpacity
          style={styles.servicesCard}
          activeOpacity={0.85}
          onPress={onServices}
        >
          <View style={styles.servicesIcon}>
            <Ionicons
              name="pricetags-outline"
              size={25}
              color={C.blue}
            />
          </View>

          <View style={styles.servicesInfo}>
            <Text style={styles.servicesTitle}>
              Serviços e preços
            </Text>

            <Text style={styles.servicesDescription}>
              Cadastre serviços, configure preços e prazos de entrega.
            </Text>

            <Text style={styles.servicesAction}>
              GERENCIAR SERVIÇOS
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={C.blue}
          />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pedidos recebidos</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color={C.blue}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Nenhum pedido encontrado
            </Text>

            <Text style={styles.emptyText}>
              Quando houver pedidos cadastrados, eles aparecerão aqui para
              você acompanhar e atualizar as etapas.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const currentStep = getValidStep(order.currentStep);
            const status = steps[currentStep];
            const isDelivered = currentStep === steps.length - 1;

            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.orderIcon}>
                    <Ionicons
                      name="shirt-outline"
                      size={22}
                      color={C.blue}
                    />
                  </View>

                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>
                      Pedido {order.id}
                    </Text>

                    <Text style={styles.service}>
                      {order.service}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      isDelivered
                        ? styles.badgeDone
                        : styles.badgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isDelivered
                          ? styles.badgeTextDone
                          : styles.badgeTextActive,
                      ]}
                    >
                      {isDelivered ? 'Entregue' : 'Em andamento'}
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.details}>
                  <View style={styles.stepDetail}>
                    <Text style={styles.detailLabel}>
                      Etapa atual
                    </Text>

                    <Text style={styles.detailValue}>
                      {status}
                    </Text>
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.detailLabel}>Valor</Text>

                    <Text style={styles.value}>
                      {money(order.value)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.updateLabel}>
                  Atualizar andamento:
                </Text>

                {steps.map((step, index) => {
                  const selected = index === currentStep;
                  const completed = index < currentStep;

                  return (
                    <TouchableOpacity
                      key={`${order.id}-${index}`}
                      activeOpacity={0.7}
                      style={[
                        styles.stepOption,
                        selected && styles.stepSelected,
                      ]}
                      onPress={() =>
                        onChangeOrder(`${order.id}:${index}`)
                      }
                    >
                      <Ionicons
                        name={
                          selected
                            ? 'radio-button-on'
                            : completed
                              ? 'checkmark-circle'
                              : 'ellipse-outline'
                        }
                        size={19}
                        color={
                          selected
                            ? C.blue
                            : completed
                              ? C.green
                              : C.muted
                        }
                      />

                      <Text
                        style={[
                          styles.stepText,
                          selected && styles.stepTextSelected,
                        ]}
                      >
                        {step}
                      </Text>

                      {selected && (
                        <Text style={styles.currentText}>
                          ATUAL
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })
        )}

        <Text style={styles.note}>
          Painel demonstrativo. As alterações ficam salvas apenas enquanto o
          aplicativo estiver aberto.
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
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: C.white,
    borderRadius: 15,
    paddingVertical: 17,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    color: C.navy,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: C.line,
  },
  servicesCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    marginBottom: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servicesIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesInfo: {
    flex: 1,
  },
  servicesTitle: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  servicesDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  servicesAction: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 9,
    letterSpacing: 0.4,
  },
  sectionTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  service: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeActive: {
    backgroundColor: C.paleBlue,
  },
  badgeDone: {
    backgroundColor: '#E7F7F1',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: C.blue,
  },
  badgeTextDone: {
    color: C.green,
  },
  separator: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 13,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  stepDetail: {
    flex: 1,
    paddingRight: 10,
  },
  detailLabel: {
    color: C.muted,
    fontSize: 10,
  },
  detailValue: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  updateLabel: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9,
  },
  stepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 10,
    borderRadius: 9,
    marginBottom: 4,
  },
  stepSelected: {
    backgroundColor: C.paleBlue,
  },
  stepText: {
    color: C.text,
    fontSize: 11,
    flex: 1,
  },
  stepTextSelected: {
    color: C.blue,
    fontWeight: '800',
  },
  currentText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 7,
  },
  note: {
    color: C.muted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 5,
  },
});
