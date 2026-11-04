import React, { useState } from 'react';
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
import type { Navigate } from '../../types';
import { money } from '../../utils/money';
import type { LaundryOrder } from '../../types/order';

type Props = {
  navigate: Navigate;
  orders: LaundryOrder[];
  onTrack: (id: string) => void;
  isStore: boolean;
};

export default function OrdersScreen({
  navigate,
  orders,
  onTrack,
  isStore,
}: Props) {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleDetails = (id: string) => {
    setExpandedOrders((current) =>
      current.includes(id)
        ? current.filter((orderId) => orderId !== id)
        : [...current, id]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title="Meus pedidos" onBack={() => navigate('home')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Acompanhe suas roupas</Text>

        {/* Botão administrativo exclusivo para lavanderias */}
        {isStore && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigate('admin')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={18} color={C.white} />
            <Text style={styles.adminButtonText}>
              Área administrativa
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.subtitle}>
          Veja o andamento e o histórico dos seus pedidos.
        </Text>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={42} color={C.muted} />
            <Text style={styles.emptyTitle}>
              Nenhum pedido encontrado
            </Text>
            <Text style={styles.emptyText}>
              Seus pedidos aparecerão aqui quando você fizer uma solicitação.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isCompleted = order.currentStep === 5;
            const isExpanded = expandedOrders.includes(order.id);

            const hasExtraDetails = Boolean(
              order.time ||
              order.address ||
              order.instructions ||
              order.payment
            );

            return (
              <View
                key={order.id}
                style={[styles.card, !isCompleted && styles.activeCard]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.orderIcon}>
                    <Ionicons
                      name="shirt-outline"
                      size={22}
                      color={C.blue}
                    />
                  </View>

                  <View style={styles.orderInfo}>
                    <Text style={styles.service}>{order.service}</Text>
                    <Text style={styles.orderId}>
                      Pedido {order.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.status,
                      isCompleted
                        ? styles.statusDone
                        : styles.statusActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isCompleted
                          ? styles.statusTextDone
                          : styles.statusTextActive,
                      ]}
                    >
                      {isCompleted ? 'Concluído' : 'Em andamento'}
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.details}>
                  <View style={styles.detailLine}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={C.muted}
                    />
                    <Text style={styles.detailText}>{order.date}</Text>
                  </View>

                  <Text style={styles.value}>
                    {money(order.value)}
                  </Text>
                </View>

                {hasExtraDetails && (
                  <View style={styles.extraDetails}>
                    <TouchableOpacity
                      style={styles.detailsToggle}
                      onPress={() => toggleDetails(order.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.detailsToggleText}>
                        {isExpanded
                          ? 'Ocultar detalhes'
                          : 'Ver detalhes do pedido'}
                      </Text>

                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={17}
                        color={C.blue}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.detailsContent}>
                        {order.time ? (
                          <DetailRow
                            icon="time-outline"
                            label="Horário da coleta"
                            value={order.time}
                          />
                        ) : null}

                        {order.address ? (
                          <DetailRow
                            icon="location-outline"
                            label="Endereço"
                            value={order.address}
                          />
                        ) : null}

                        {order.payment ? (
                          <DetailRow
                            icon="card-outline"
                            label="Forma de pagamento"
                            value={order.payment}
                          />
                        ) : null}

                        {order.instructions ? (
                          <DetailRow
                            icon="document-text-outline"
                            label="Instruções"
                            value={order.instructions}
                          />
                        ) : null}
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.cardBottom}>
                  <View style={styles.description}>
                    <Ionicons
                      name={
                        isCompleted
                          ? 'checkmark-circle-outline'
                          : 'sync-outline'
                      }
                      size={17}
                      color={isCompleted ? C.green : C.blue}
                    />

                    <Text style={styles.descriptionText}>
                      {isCompleted
                        ? 'Pedido entregue com sucesso.'
                        : 'Suas roupas estão sendo cuidadas.'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => onTrack(order.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.trackButtonText}>
                      Acompanhar
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={C.blue}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={C.blue}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
            <Text style={styles.helpText}>
              Nossa equipe está pronta para ajudar com seu pedido.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={C.muted}
          />
        </View>

        <TouchableOpacity
          style={styles.newOrder}
          onPress={() => navigate('schedule')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={C.white}
          />
          <Text style={styles.newOrderText}>Fazer novo pedido</Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Pedidos ilustrativos para demonstração. O histórico real será
          conectado ao backend.
        </Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('home')}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color={C.muted}
          />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>

        <View style={styles.navItem}>
          <Ionicons name="receipt" size={21} color={C.blue} />
          <Text style={styles.navActive}>Pedidos</Text>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('profile')}
        >
          <Ionicons
            name="person-outline"
            size={21}
            color={C.muted}
          />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type DetailRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={C.muted} />

      <View style={styles.detailRowText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  heading: {
    color: C.navy,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },
  adminButton: {
    backgroundColor: C.navy,
    padding: 13,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adminButtonText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 12,
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: C.line,
  },
  activeCard: {
    borderColor: '#BBD4FF',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  orderInfo: {
    flex: 1,
  },
  service: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  orderId: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: C.paleBlue,
  },
  statusDone: {
    backgroundColor: '#E7F7F1',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: C.blue,
  },
  statusTextDone: {
    color: C.green,
  },
  separator: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 14,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailText: {
    color: C.muted,
    fontSize: 12,
  },
  value: {
    color: C.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  extraDetails: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    marginTop: 13,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 3,
  },
  detailsToggleText: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  detailsContent: {
    gap: 13,
    paddingTop: 13,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  detailRowText: {
    flex: 1,
  },
  detailLabel: {
    color: C.muted,
    fontSize: 10,
    marginBottom: 3,
  },
  detailValue: {
    color: C.text,
    fontSize: 12,
    lineHeight: 18,
  },
  cardBottom: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  description: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  descriptionText: {
    color: C.text,
    fontSize: 11,
    flexShrink: 1,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: C.paleBlue,
  },
  trackButtonText: {
    color: C.blue,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  emptyTitle: {
    color: C.navy,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
  },
  helpCard: {
    backgroundColor: '#EDF5FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 4,
    marginBottom: 16,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  helpText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  newOrder: {
    backgroundColor: C.blue,
    borderRadius: 13,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  newOrderText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
  demoNote: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 10,
    paddingBottom: 8,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 70,
  },
  navText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  navActive: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
  },
});