
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
import type { Navigate } from '../../types';
import { money } from '../../utils/money';

type Props = {
  navigate: Navigate;
};

const orders = [
  {
    id: 'LJ-2048',
    service: 'Lavagem e dobra',
    date: '29 out. 2026',
    value: 48.90,
    status: 'Em andamento',
    description: 'Suas roupas estão sendo cuidadas.',
    active: true,
  },
  {
    id: 'LJ-1982',
    service: 'Lavar e passar',
    date: '18 out. 2026',
    value: 68.90,
    status: 'Concluído',
    description: 'Pedido entregue com sucesso.',
    active: false,
  },
  {
    id: 'LJ-1837',
    service: 'Passadoria',
    date: '05 out. 2026',
    value: 38.90,
    status: 'Concluído',
    description: 'Pedido entregue com sucesso.',
    active: false,
  },
];

export default function OrdersScreen({ navigate }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title="Meus pedidos"
        onBack={() => navigate('home')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          Acompanhe suas roupas
        </Text>
        <TouchableOpacity
  style={{
    backgroundColor: C.navy,
    padding: 13,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }}
  onPress={() => navigate('admin')}
>
  <Ionicons
    name="settings-outline"
    size={18}
    color={C.white}
  />

  <Text
    style={{
      color: C.white,
      fontWeight: '800',
      fontSize: 12,
    }}
  >
    Área administrativa
  </Text>
</TouchableOpacity>

        <Text style={styles.subtitle}>
          Veja o andamento e o histórico dos seus pedidos.
        </Text>

        {orders.map((order) => (
          <View
            key={order.id}
            style={[
              styles.card,
              order.active && styles.activeCard,
            ]}
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
                <Text style={styles.service}>
                  {order.service}
                </Text>

                <Text style={styles.orderId}>
                  Pedido {order.id}
                </Text>
              </View>

              <View
                style={[
                  styles.status,
                  order.active
                    ? styles.statusActive
                    : styles.statusDone,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    order.active
                      ? styles.statusTextActive
                      : styles.statusTextDone,
                  ]}
                >
                  {order.status}
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

                <Text style={styles.detailText}>
                  {order.date}
                </Text>
              </View>

              <Text style={styles.value}>
                {money(order.value)}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.description}>
                <Ionicons
                  name={
                    order.active
                      ? 'sync-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={17}
                  color={order.active ? C.blue : C.green}
                />

                <Text style={styles.descriptionText}>
                  {order.description}
                </Text>
              </View>

              {order.active && (
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => navigate('tracking')}
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
              )}
            </View>
          </View>
        ))}

        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={C.blue}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.helpTitle}>
              Precisa de ajuda?
            </Text>

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
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={C.white}
          />

          <Text style={styles.newOrderText}>
            Fazer novo pedido
          </Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Pedidos ilustrativos para demonstração.
          O histórico real será conectado ao backend.
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
          <Ionicons
            name="receipt"
            size={21}
            color={C.blue}
          />
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
