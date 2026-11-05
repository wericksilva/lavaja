import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { services } from '../../data/services';
import { laundries, type Laundry } from '../../data/laundries';
import { money } from '../../utils/money';
import type { Navigate, Service } from '../../types';

type Props = {
  name: string;
  setService: (value: Service) => void;
  navigate: Navigate;
  isStore: boolean;
  selectedLaundry: Laundry | null;
  setSelectedLaundry: (value: Laundry) => void;
};

const weeklyRevenue = [
  { day: 'Seg', value: 180 },
  { day: 'Ter', value: 250 },
  { day: 'Qua', value: 210 },
  { day: 'Qui', value: 320 },
  { day: 'Sex', value: 280 },
  { day: 'Sáb', value: 420 },
  { day: 'Dom', value: 150 },
];

export default function HomeScreen({
  name,
  setService,
  navigate,
  isStore,
  selectedLaundry,
  setSelectedLaundry,
}: Props) {
  const firstName = name.trim().split(' ')[0] || 'Cliente';
  const [showDashboard, setShowDashboard] = useState(false);

  const startSchedule = (serviceName?: Service) => {
    if (!selectedLaundry) {
      Alert.alert(
        'Escolha uma lavanderia',
        'Selecione a lavanderia onde deseja realizar seu serviço antes de continuar.',
      );
      return;
    }

    if (serviceName) {
      setService(serviceName);
    }

    navigate('schedule');
  };

  const maxRevenue = Math.max(...weeklyRevenue.map((item) => item.value));

  const dashboardStats = [
    {
      title: 'Recebidos hoje',
      value: '12',
      icon: 'today-outline' as const,
      color: '#176B87',
      background: '#E8F3F6',
      description: 'Pedidos do dia',
    },
    {
      title: 'Aguardando aprovação',
      value: '4',
      icon: 'time-outline' as const,
      color: '#D99120',
      background: '#FFF5E3',
      description: 'Precisam de atenção',
    },
    {
      title: 'Em andamento',
      value: '8',
      icon: 'sync-outline' as const,
      color: '#3976C5',
      background: '#EAF2FF',
      description: 'Em processamento',
    },
    {
      title: 'Concluídos',
      value: '26',
      icon: 'checkmark-circle-outline' as const,
       color: '#16865B',
      background: '#E7F7F1',
      description: 'Finalizados no mês',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  setShowDashboard(false);
                  navigate('home');
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Voltar para a tela inicial do LavaJá"
              >
                <Text style={styles.brand}>
                  Lava<Text style={styles.brandHighlight}>Já</Text>
                </Text>
              </TouchableOpacity>

              <Text style={styles.greeting}>
                Olá, {firstName}! 👋
              </Text>

              <Text style={styles.headerSubtitle}>
                {isStore
                  ? showDashboard
                    ? 'Visão geral da sua lavanderia.'
                    : 'Gerencie sua lavanderia.'
                  : 'Vamos cuidar das suas roupas?'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigate('profile')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={23}
                color="#176B87"
              />
            </TouchableOpacity>
          </View>

          {isStore ? (
            <>
              {showDashboard ? (
                <>
                  {/* CABEÇALHO DO DASHBOARD */}
                  <View style={styles.dashboardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dashboardTitle}>
                        Dashboard da lavanderia
                      </Text>

                      <Text style={styles.dashboardSubtitle}>
                        Acompanhe os resultados do seu negócio.
                      </Text>
                    </View>

                    <View style={styles.dashboardHeaderIcon}>
                       <Ionicons
                        name="analytics-outline"
                        size={25}
                        color="#176B87"
                      />
                    </View>
                  </View>

                  {/* FATURAMENTO */}
                  <View style={styles.revenueCard}>
                    <View style={styles.revenueTop}>
                      <View>
                        <Text style={styles.revenueLabel}>
                          Faturamento do mês
                        </Text>

                        <Text style={styles.revenueValue}>
                          R$ 8.450,00
                        </Text>
                      </View>

                      <View style={styles.revenueIcon}>
                        <Ionicons
                          name="wallet-outline"
                          size={25}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>

                    <View style={styles.revenueFooter}>
                      <Ionicons
                        name="trending-up"
                        size={17}
                        color="#B8F0D6"
                      />

                      <Text style={styles.revenueFooterText}>
                        +12,5% em relação ao mês anterior
                      </Text>
                    </View>
                  </View>

                  {/* INDICADORES */}
                  <Text style={styles.sectionTitle}>
                    Resumo dos pedidos
                  </Text>

                  <View style={styles.statsGrid}>
                    {dashboardStats.map((item) => (
                      <View key={item.title} style={styles.statCard}>
                        <View
                          style={[
                            styles.statIcon,
                            { backgroundColor: item.background },
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color={item.color}
                          />
                        </View>

                        <Text style={styles.statValue}>
                          {item.value}
                        </Text>

                        <Text style={styles.statTitle}>
                          {item.title}
                        </Text>

                        <Text style={styles.statDescription}>
                          {item.description}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* GRÁFICO */}
                  <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                      <View>
                        <Text style={styles.chartTitle}>
                          Faturamento semanal
                        </Text>

                        <Text style={styles.chartSubtitle}>
                          Últimos 7 dias
                        </Text>
                      </View>

                      <View style={styles.chartBadge}>
                        <Ionicons
                          name="bar-chart-outline"
                          size={17}
                          color="#176B87"
                        />
                      </View>
                    </View>

                    <View style={styles.chart}>
                      {weeklyRevenue.map((item) => (
                        <View key={item.day} style={styles.chartColumn}>
                          <Text style={styles.chartBarValue}>
                            {item.value}
                          </Text>

                          <View style={styles.chartBarBackground}>
                            <View
                              style={[
                                styles.chartBar,
                                {
                                  height: `${(item.value / maxRevenue) * 100}%`,
                                },
                              ]}
                            />
                          </View>

                          <Text style={styles.chartDay}>
                            {item.day}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.chartLegend}>
                      <View style={styles.chartLegendDot} />
                      <Text style={styles.chartLegendText}>
                        Faturamento diário em reais
                      </Text>
                    </View>
                  </View>

                  {/* ATENÇÃO */}
                  <View style={styles.pendingCard}>
                    <View style={styles.pendingIcon}>
                      <Ionicons
                        name="notifications-outline"
                        size={23}
                        color="#D99120"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingTitle}>
                        Você tem 4 pedidos pendentes
                      </Text>

                      <Text style={styles.pendingDescription}>
                        Existem pedidos aguardando sua aprovação.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#D99120"
                    />
                  </View>

                  {/* AÇÕES */}
                  <Text style={styles.sectionTitle}>
                    Gerenciamento
                  </Text>

                  <TouchableOpacity
                    style={styles.managementButton}
                    onPress={() => navigate('admin')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.managementIcon}>
                      <Ionicons
                        name="settings-outline"
                        size={22}
                        color="#176B87"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.managementTitle}>
                        Área administrativa
                      </Text>

                      <Text style={styles.managementDescription}>
                         Gerencie pedidos e atendimentos.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#8A9AA3"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.managementButton}
                    onPress={() => navigate('orders')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.managementIcon}>
                      <Ionicons
                        name="receipt-outline"
                        size={22}
                        color="#176B87"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.managementTitle}>
                        Visualizar pedidos
                      </Text>

                      <Text style={styles.managementDescription}>
                        Consulte o histórico de pedidos.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#8A9AA3"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backDashboardButton}
                    onPress={() => setShowDashboard(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={18}
                      color="#176B87"
                    />

                    <Text style={styles.backDashboardText}>
                      Voltar à página inicial
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* ÁREA DA LAVANDERIA */}
                  <View style={styles.storeBanner}>
                    <View style={styles.storeBannerIcon}>
                      <Ionicons
                        name="storefront-outline"
                        size={30}
                        color="#FFFFFF"
                      />
                    </View>

                    <Text style={styles.storeBannerTitle}>
                      Área da lavanderia
                    </Text>

                    <Text style={styles.storeBannerDescription}>
                      Acompanhe seus pedidos, faturamento e desempenho em um só lugar.
                    </Text>

                    <TouchableOpacity
                    style={styles.storeBannerButton}
                      onPress={() => setShowDashboard(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="analytics-outline"
                        size={19}
                        color="#176B87"
                      />

                      <Text style={styles.storeBannerButtonText}>
                        Dashboard da lavanderia
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={17}
                        color="#176B87"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* ATALHOS */}
                  <Text style={styles.sectionTitle}>
                    Acesso rápido
                  </Text>

                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickAction}
                      onPress={() => setShowDashboard(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.quickActionIcon}>
                        <Ionicons
                          name="analytics-outline"
                          size={23}
                          color="#176B87"
                        />
                      </View>

                      <Text style={styles.quickActionText}>
                        Dashboard
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickAction}
                      onPress={() => navigate('admin')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.quickActionIcon}>
                        <Ionicons
                          name="grid-outline"
                          size={23}
                          color="#176B87"
                        />
                      </View>

                      <Text style={styles.quickActionText}>
                        Painel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickAction}
                      onPress={() => navigate('orders')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.quickActionIcon}>
                        <Ionicons
                          name="receipt-outline"
                          size={23}
                          color="#176B87"
                        />
                      </View>

                      <Text style={styles.quickActionText}>
                        Pedidos
                      </Text>
                    </TouchableOpacity>
                     </View>
                </>
              )}
            </>
          ) : (
            <>
              {/* BANNER PROMOCIONAL */}
              <View style={styles.promoCard}>
                <View style={styles.promoContent}>
                  <View style={styles.promoPill}>
                    <Text style={styles.promoPillText}>
                      LAVANDERIA SEM COMPLICAÇÃO
                    </Text>
                  </View>

                  <Text style={styles.promoTitle}>
                    Suas roupas limpas sem sair de casa.
                  </Text>

                  <Text style={styles.promoDescription}>
                    Escolha uma lavanderia, agende a coleta e deixe o resto com a gente.
                  </Text>

                 
                </View>

                <View style={styles.promoIllustration}>
                  <Ionicons
                    name="shirt-outline"
                    size={62}
                    color="#FFFFFF"
                  />

                  <Ionicons
                    name="sparkles"
                    size={23}
                    color="#D5F4FA"
                    style={styles.sparkle}
                  />
                </View>
              </View>

              {/* ESCOLHA DA LAVANDERIA */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    Escolha sua lavanderia
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Selecione onde deseja realizar seu serviço.
                  </Text>
                </View>

                <Ionicons
                  name="location-outline"
                  size={21}
                  color="#176B87"
                />
              </View>

              {selectedLaundry && (
                <View style={styles.selectedNotice}>
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color="#16865B"
                    />

                  <Text style={styles.selectedNoticeText}>
                    Lavanderia selecionada: {selectedLaundry.name}
                  </Text>
                </View>
              )}

              <View style={styles.laundryList}>
                {laundries.map((laundry) => {
                  const isSelected =
                    selectedLaundry?.id === laundry.id;

                  return (
                    <TouchableOpacity
                      key={laundry.id}
                      style={[
                        styles.laundryCard,
                        isSelected && styles.laundryCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedLaundry(laundry);
                        navigate('laundryDetails');
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.laundryIcon}>
                        <Ionicons
                          name="storefront-outline"
                          size={27}
                          color="#176B87"
                        />
                      </View>

                      <View style={styles.laundryInfo}>
                        <View style={styles.laundryNameRow}>
                          <Text style={styles.laundryName}>
                            {laundry.name}
                          </Text>

                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={21}
                              color="#16865B"
                            />
                          )}
                        </View>

                        <Text style={styles.laundryDescription}>
                          {laundry.description}
                        </Text>

                        <View style={styles.laundryDetails}>
                          <View style={styles.detailItem}>
                            <Ionicons
                              name="star"
                              size={14}
                              color="#F2B544"
                            />

                            <Text style={styles.detailText}>
                              {laundry.rating}
                            </Text>
                          </View>

                          <View style={styles.detailItem}>
                            <Ionicons
                              name="location-outline"
                              size={14}
                              color="#73818B"
                            />

                            <Text style={styles.detailText}>
                              {laundry.distance} · {laundry.address}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.deliveryFee}>
                          Taxa de entrega: {money(laundry.deliveryFee)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>


              {/* COMO FUNCIONA */}
<View style={styles.howItWorksSection}>
  <Text style={styles.sectionTitle}>Como funciona</Text>

  <Text style={styles.howItWorksSubtitle}>
    É simples cuidar das suas roupas com a LavaJá.
  </Text>

  <View style={styles.stepsContainer}>
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>1</Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons
          name="storefront-outline"
          size={25}
          color="#176B87"
        />
      </View>

      <Text style={styles.stepTitle}>Escolha</Text>

      <Text style={styles.stepDescription}>
        Selecione a lavanderia e o serviço desejado.
      </Text>
    </View>

    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>2</Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons
          name="calendar-outline"
          size={25}
          color="#176B87"
        />
      </View>

      <Text style={styles.stepTitle}>Agende</Text>

      <Text style={styles.stepDescription}>
        Escolha o melhor dia e horário para a coleta.
      </Text>
    </View>

    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>3</Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons
          name="checkmark-done-outline"
          size={25}
          color="#176B87"
        />
      </View>

      <Text style={styles.stepTitle}>Receba</Text>

      <Text style={styles.stepDescription}>
        Receba suas roupas limpas e prontas em casa.
      </Text>
    </View>
  </View>
</View>
            </>
          )}
        </ScrollView>

        {/* NAVEGAÇÃO INFERIOR */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setShowDashboard(false);
              navigate('home');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="home"
              size={22}
              color="#176B87"
            />

            <Text style={[styles.navText, styles.navTextActive]}>
              Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigate('orders')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="receipt-outline"
              size={22}
              color="#83919A"
            />

            <Text style={styles.navText}>
              Pedidos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigate('profile')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#83919A"
            />

            <Text style={styles.navText}>
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  brand: {
    fontSize: 25,
    fontWeight: '800',
    color: '#176B87',
  },
  brandHighlight: {
    color: '#20A6A6',
  },
  greeting: {
    fontSize: 19,
    fontWeight: '700',
    color: '#18323E',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#75858E',
    marginTop: 4,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E5F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CLIENTE
  promoCard: {
    backgroundColor: '#176B87',
    borderRadius: 20,
    padding: 20,
    minHeight: 220,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 28,
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promoPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginTop: 14,
    maxWidth: 235,
  },
  promoDescription: {
    color: '#DCEFF4',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 235,
  },
  promoButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#20A6A6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  promoIllustration: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  sparkle: {
    position: 'absolute',
    top: 45,
    right: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18323E',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7B8A92',
  },
  selectedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F5EE',
    borderRadius: 10,
    padding: 11,
    marginBottom: 12,
    gap: 8,
  },
  selectedNoticeText: {
    color: '#176B4A',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  laundryList: {
    gap: 12,
    marginBottom: 28,
  },
  laundryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EEF1',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  laundryCardSelected: {
    borderColor: '#20A6A6',
    backgroundColor: '#F0FAFA',
  },
  laundryIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
    },
  laundryInfo: {
    flex: 1,
  },
  laundryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  laundryName: {
    color: '#18323E',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  laundryDescription: {
    color: '#7B8A92',
    fontSize: 11,
    marginTop: 4,
  },
  laundryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#6F7F88',
    fontSize: 10,
  },
  deliveryFee: {
    color: '#176B87',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B7C4CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#20A6A6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#20A6A6',
  },
  serviceList: {
    gap: 11,
    marginBottom: 28,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#18323E',
    fontSize: 14,
    fontWeight: '800',
  },
  serviceDescription: {
    color: '#7B8A92',
    fontSize: 11,
    marginTop: 4,
  },
  servicePrice: {
    color: '#176B87',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
  },
  howItWorksSection: {
  marginTop: 5,
  marginBottom: 20,
},

howItWorksSubtitle: {
  color: '#7B8A92',
  fontSize: 12,
  marginTop: -1,
  marginBottom: 17,
},

stepsContainer: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 5,
},

step: {
  flex: 1,
  minHeight: 190,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  paddingHorizontal: 10,
  paddingVertical: 15,
  borderWidth: 1,
  borderColor: '#E8EEF1',
  alignItems: 'center',
},

stepNumber: {
  position: 'absolute',
  top: 9,
  right: 9,
  width: 23,
  height: 23,
  borderRadius: 12,
  backgroundColor: '#E8F3F6',
  alignItems: 'center',
  justifyContent: 'center',
},

stepNumberText: {
  color: '#176B87',
  fontSize: 11,
  fontWeight: '800',
},

stepIcon: {
  width: 49,
  height: 49,
  borderRadius: 15,
  backgroundColor: '#E8F3F6',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 9,
  marginBottom: 13,
},

stepTitle: {
  color: '#18323E',
  fontSize: 13,
  fontWeight: '800',
  textAlign: 'center',
},

stepDescription: {
  color: '#7B8A92',
  fontSize: 10,
  lineHeight: 15,
  marginTop: 7,
  textAlign: 'center',
},
  // HOME DA LAVANDERIA
  storeBanner: {
    backgroundColor: '#176B87',
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
  },
  storeBannerIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  storeBannerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  storeBannerDescription: {
    color: '#DCEFF4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  storeBannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  storeBannerButtonText: {
    color: '#176B87',
    fontSize: 12,
    fontWeight: '800',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    paddingVertical: 17,
    alignItems: 'center',
    gap: 9,
  },
  quickActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#18323E',
    fontSize: 11,
    fontWeight: '700',
  },

  // DASHBOARD
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    color: '#18323E',
    fontSize: 20,
    fontWeight: '800',
  },
  dashboardSubtitle: {
    color: '#7B8A92',
    fontSize: 12,
    marginTop: 5,
  },
  dashboardHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  revenueCard: {
    backgroundColor: '#176B87',
    borderRadius: 18,
    padding: 19,
    marginBottom: 25,
  },
  revenueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    color: '#DCEFF4',
    fontSize: 13,
  },
  revenueValue: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 8,
  },
  revenueIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: 17,
     paddingTop: 13,
  },
  revenueFooterText: {
    color: '#B8F0D6',
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 25,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    padding: 14,
    minHeight: 145,
  },
  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#18323E',
    fontSize: 25,
    fontWeight: '800',
  },
  statTitle: {
    color: '#344B57',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  statDescription: {
    color: '#8A9AA3',
    fontSize: 10,
    marginTop: 5,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    padding: 17,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    color: '#18323E',
    fontSize: 15,
    fontWeight: '800',
  },
  chartSubtitle: {
    color: '#8A9AA3',
    fontSize: 11,
    marginTop: 4,
  },
  chartBadge: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    height: 175,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 22,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    color: '#71838D',
    fontSize: 9,
    marginBottom: 7,
  },
  chartBarBackground: {
    width: 20,
    height: 115,
    backgroundColor: '#EDF3F5',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#20A6A6',
    borderRadius: 8,
  },
  chartDay: {
    color: '#71838D',
    fontSize: 10,
    marginTop: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 17,
     },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20A6A6',
  },
  chartLegendText: {
    color: '#8A9AA3',
    fontSize: 10,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: '#F7E5BF',
    borderRadius: 15,
    padding: 14,
    gap: 11,
    marginBottom: 25,
  },
  pendingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFEDC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingTitle: {
    color: '#8B5C13',
    fontSize: 12,
    fontWeight: '800',
  },
  pendingDescription: {
    color: '#A17A3D',
    fontSize: 10,
    marginTop: 4,
  },
  managementButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  managementIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementTitle: {
    color: '#18323E',
    fontSize: 13,
    fontWeight: '800',
  },
  managementDescription: {
    color: '#8A9AA3',
    fontSize: 10,
    marginTop: 4,
  },
  backDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 15,
    marginTop: 12,
  },
  backDashboardText: {
    color: '#176B87',
    fontSize: 12,
    fontWeight: '800',
  },

  // NAVEGAÇÃO
  bottomNav: {
    height: 67,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EEF1',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    color: '#83919A',
    fontSize: 10,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#176B87',
    fontWeight: '800',
  },
});