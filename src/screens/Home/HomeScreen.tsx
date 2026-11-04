import React from 'react';
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

export default function HomeScreen({
  name,
  setService,
  navigate,
  isStore,
  selectedLaundry,
  setSelectedLaundry,
}: Props) {
  const firstName = name.trim().split(' ')[0] || 'Cliente';

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
              <Text style={styles.brand}>
                Lava<Text style={styles.brandHighlight}>Já</Text>
              </Text>

              <Text style={styles.greeting}>
                Olá, {firstName}! 👋
              </Text>

              <Text style={styles.headerSubtitle}>
                {isStore
                  ? 'Gerencie sua lavanderia.'
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
              {/* Área da lavanderia */}
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
                  Acompanhe seus pedidos e gerencie seus atendimentos em um só lugar.
                </Text>

                <TouchableOpacity
                  style={styles.storeBannerButton}
                  onPress={() => navigate('admin')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.storeBannerButtonText}>
                    Acessar painel
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#176B87"
                  />
                </TouchableOpacity>
              </View>

              {/* Atalhos da lavanderia */}
              <Text style={styles.sectionTitle}>
                Acesso rápido
              </Text>

              <View style={styles.quickActions}>
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

                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => navigate('profile')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionIcon}>
                    <Ionicons
                      name="person-outline"
                      size={23}
                      color="#176B87"
                    />
                  </View>

                  <Text style={styles.quickActionText}>
                    Perfil
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Banner promocional */}
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

                  <TouchableOpacity
                    style={styles.promoButton}
                    onPress={() => startSchedule()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.promoButtonText}>
                      Agendar coleta
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
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

              {/* Escolha da lavanderia */}
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
                      onPress={() => setSelectedLaundry(laundry)}
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

              {/* Serviços */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    Nossos serviços
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Escolha o serviço que você precisa.
                  </Text>
                </View>

                <Ionicons
                  name="shirt-outline"
                  size={22}
                  color="#176B87"
                />
              </View>

              <View style={styles.serviceList}>
                {services.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.serviceCard}
                    onPress={() => startSchedule(item.name)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.serviceIcon}>
                      <Ionicons
                        name="shirt-outline"
                        size={24}
                        color="#176B87"
                      />
                    </View>

                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>
                        {item.name}
                      </Text>

                      <Text style={styles.serviceDescription}>
                        {item.description}
                      </Text>

                      <Text style={styles.servicePrice}>
                        A partir de {money(item.price)}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={21}
                      color="#8A9AA3"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Como funciona */}
              <Text style={styles.sectionTitle}>
                Como funciona
              </Text>

              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <View style={styles.stepIcon}>
                    <Ionicons
                      name="storefront-outline"
                      size={23}
                      color="#176B87"
                    />
                  </View>

                  <Text style={styles.stepTitle}>
                    1. Escolha
                  </Text>

                  <Text style={styles.stepDescription}>
                    Selecione a lavanderia e o serviço.
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={23}
                      color="#176B87"
                    />
                  </View>

                  <Text style={styles.stepTitle}>
                    2. Agende
                  </Text>

                  <Text style={styles.stepDescription}>
                    Escolha o melhor horário para coleta.
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepIcon}>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={23}
                      color="#176B87"
                    />
                  </View>

                  <Text style={styles.stepTitle}>
                    3. Receba
                  </Text>

                  <Text style={styles.stepDescription}>
                    Receba suas roupas limpas em casa.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Navegação inferior */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigate('home')}
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
  stepsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  step: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E8EEF1',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    color: '#18323E',
    fontSize: 11,
    fontWeight: '800',
  },
  stepDescription: {
    color: '#7B8A92',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
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
    fontSize: 12,
    fontWeight: '700',
  },
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