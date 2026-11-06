
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import type { Laundry } from '../../data/laundries';
import type { DbLaundryService } from '../../lib/database';
import { getLaundryServices } from '../../lib/database';
import { money } from '../../utils/money';
import type { Navigate } from '../../types';
import type { Review } from '../Orders/OrdersScreen';

type Props = {
  laundry: Laundry;
  navigate: Navigate;
  reviews: Review[];
  onSelectService: (item: DbLaundryService) => void;
};

export default function LaundryDetailsScreen({
  laundry,
  navigate,
  reviews,
  onSelectService,
}: Props) {
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [services, setServices] = useState<DbLaundryService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingServices(true);
    setServicesError('');
    getLaundryServices(laundry.id, true)
      .then((rows) => { if (active) setServices(rows); })
      .catch((error: unknown) => { if (active) setServicesError(error instanceof Error ? error.message : 'Não foi possível carregar os serviços.'); })
      .finally(() => { if (active) setLoadingServices(false); });
    return () => { active = false; };
  }, [laundry.id]);



  // Cada tela de detalhes mostra exclusivamente as avaliações desta lavanderia.
  const laundryReviews = reviews.filter(
    (review) => review.laundryId === laundry.id,
  );

  const averageRating =
    laundryReviews.length > 0
      ? laundryReviews.reduce((sum, review) => sum + review.rating, 0) /
        laundryReviews.length
      : 0;

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigate('home')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#18323E"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Detalhes da lavanderia
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons
                name="storefront-outline"
                size={58}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.bannerDecoration}>
              <Ionicons
                name="sparkles"
                size={23}
                color="#D5F4FA"
              />
            </View>
          </View>

          {/* Informações principais */}
          <View style={styles.mainInfo}>
            <Text style={styles.laundryName}>
              {laundry.name}
            </Text>

            <Text style={styles.description}>
              {laundry.description}
            </Text>

            <View style={styles.ratingRow}>
              <TouchableOpacity
                style={styles.ratingItem}
                onPress={() => setReviewsVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="star"
                  size={17}
                  color="#F2B544"
                />

                <Text style={styles.ratingText}>
                  {laundryReviews.length > 0
                    ? averageRating.toFixed(1)
                    : laundry.rating}
                </Text>

                <Text style={styles.ratingCaption}>
                  Avaliação
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="#8A989F"
                />
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <View style={styles.ratingItem}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#176B87"
                />

                <Text style={styles.ratingText}>
                  {laundry.distance}
                </Text>

                <Text style={styles.ratingCaption}>
                  Distância
                </Text>
              </View>
            </View>
          </View>

          {/* Localização */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={23}
                color="#176B87"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Localização</Text>
              <Text style={styles.infoDescription}>
                {laundry.address}
              </Text>
            </View>
          </View>

          {/* Taxa de entrega */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="bicycle-outline"
                size={23}
                color="#176B87"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Taxa de entrega
              </Text>

              <Text style={styles.infoDescription}>
                {money(laundry.deliveryFee)}
              </Text>
            </View>
          </View>

          {/* Serviços */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>
              Serviços disponíveis
            </Text>

            <Text style={styles.sectionSubtitle}>
              Escolha o serviço que deseja realizar nesta lavanderia.
            </Text>

            {loadingServices ? (
              <Text style={styles.sectionSubtitle}>Carregando serviços...</Text>
            ) : servicesError ? (
              <Text style={styles.sectionSubtitle}>{servicesError}</Text>
            ) : services.length === 0 ? (
              <Text style={styles.sectionSubtitle}>Esta lavanderia ainda não cadastrou serviços ativos.</Text>
            ) : services.map((item) => (
              <View
                key={item.id}
                style={styles.serviceCard}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name="shirt-outline"
                    size={25}
                    color="#176B87"
                  />
                </View>

                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {item.name}
                  </Text>

                  <Text style={styles.serviceDescription}>
                    {item.description || item.estimated_duration}
                  </Text>

                  <Text style={styles.servicePrice}>
                    A partir de {money(Number(item.price))}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.chooseButton}
                  onPress={() => { onSelectService(item); navigate('schedule'); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chooseButtonText}>
                    Escolher
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Informação adicional */}
          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#176B87"
            />

            <Text style={styles.noticeText}>
              A coleta será agendada no endereço informado por você na próxima etapa.
            </Text>
          </View>
        </ScrollView>

        {/* Modal de avaliações */}
        <Modal
          visible={reviewsVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setReviewsVisible(false)}
        >
          <View style={styles.reviewsOverlay}>
            <View style={styles.reviewsModal}>
              <View style={styles.reviewsHeader}>
                <View>
                  <Text style={styles.reviewsTitle}>
                    Avaliações
                  </Text>

                  <Text style={styles.reviewsSubtitle}>
                    {laundry.name}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setReviewsVisible(false)}
                  style={styles.reviewsClose}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="#18323E"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.reviewsSummary}>
                <Text style={styles.reviewsAverage}>
                  {laundryReviews.length > 0
                    ? averageRating.toFixed(1)
                    : '—'}
                </Text>

                <View>
                  <View style={styles.reviewsStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={
                          star <= Math.round(averageRating)
                            ? 'star'
                            : 'star-outline'
                        }
                        size={17}
                        color="#F2B544"
                      />
                    ))}
                  </View>

                  <Text style={styles.reviewsCount}>
                    {laundryReviews.length}{' '}
                    {laundryReviews.length === 1
                      ? 'avaliação'
                      : 'avaliações'}
                  </Text>
                </View>
              </View>

              <ScrollView
                style={styles.reviewsList}
                showsVerticalScrollIndicator={false}
              >
                {laundryReviews.length === 0 ? (
                  <View style={styles.reviewsEmpty}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={38}
                      color="#8A989F"
                    />

                    <Text style={styles.reviewsEmptyTitle}>
                      Ainda não há avaliações
                    </Text>

                    <Text style={styles.reviewsEmptyText}>
                      Quando os clientes avaliarem seus pedidos,
                      as opiniões aparecerão aqui.
                    </Text>
                  </View>
                ) : (
                  [...laundryReviews]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((review, index) => (
                      <View
                        key={`${review.orderId}-${index}`}
                        style={styles.reviewCard}
                      >
                        <View style={styles.reviewCardHeader}>
                          <View style={styles.reviewsStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name={
                                  star <= review.rating
                                    ? 'star'
                                    : 'star-outline'
                                }
                                size={15}
                                color="#F2B544"
                              />
                            ))}
                          </View>

                          <Text style={styles.reviewDate}>
                            {new Date(
                              review.createdAt,
                            ).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>

                        {review.comment.trim() ? (
                          <Text style={styles.reviewComment}>
                            {review.comment}
                          </Text>
                        ) : (
                          <Text style={styles.reviewNoComment}>
                            Avaliação sem comentário.
                          </Text>
                        )}
                      </View>
                    ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Rodapé */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>
              Taxa de entrega
            </Text>

            <Text style={styles.footerPrice}>
              {money(laundry.deliveryFee)}
            </Text>
          </View>

          <View style={[styles.mainButton, { opacity: 0.85 }]}>
            <Text style={styles.mainButtonText}>Escolha um serviço acima para continuar</Text>
          </View>
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
    paddingBottom: 25,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#18323E',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 40,
  },
  banner: {
    height: 165,
    backgroundColor: '#176B87',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
  },
  bannerIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerDecoration: {
    position: 'absolute',
    top: 30,
    right: 35,
  },
  mainInfo: {
    paddingTop: 20,
    paddingBottom: 18,
  },
  laundryName: {
    color: '#18323E',
    fontSize: 23,
    fontWeight: '800',
  },
  description: {
    color: '#7B8A92',
    fontSize: 13,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
    gap: 22,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    color: '#18323E',
    fontSize: 13,
    fontWeight: '800',
  },
  ratingCaption: {
    color: '#8A989F',
    fontSize: 11,
    marginLeft: 2,
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#DCE4E8',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    gap: 13,
  },
  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#18323E',
    fontSize: 13,
    fontWeight: '800',
  },
  infoDescription: {
    color: '#7B8A92',
    fontSize: 12,
    marginTop: 4,
  },
  servicesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#18323E',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#7B8A92',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 14,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EEF1',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 11,
  },
  serviceIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#E8F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#18323E',
    fontSize: 13,
    fontWeight: '800',
  },
  serviceDescription: {
    color: '#7B8A92',
    fontSize: 10,
    marginTop: 4,
  },
  servicePrice: {
    color: '#176B87',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  chooseButton: {
    backgroundColor: '#E8F3F6',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  chooseButtonText: {
    color: '#176B87',
    fontSize: 11,
    fontWeight: '800',
  },
  notice: {
    backgroundColor: '#E8F3F6',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 12,
  },
  noticeText: {
    color: '#42616E',
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EEF1',
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    color: '#7B8A92',
    fontSize: 10,
  },
  footerPrice: {
    color: '#18323E',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },
  mainButton: {
    flex: 1.7,
    backgroundColor: '#176B87',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  reviewsModal: {
    backgroundColor: '#F5F8FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 25,
    maxHeight: '85%',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  reviewsTitle: {
    color: '#18323E',
    fontSize: 22,
    fontWeight: '800',
  },
  reviewsSubtitle: {
    color: '#7B8A92',
    fontSize: 12,
    marginTop: 4,
  },
  reviewsClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 15,
  },
  reviewsAverage: {
    color: '#18323E',
    fontSize: 35,
    fontWeight: '900',
  },
  reviewsStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reviewsCount: {
    color: '#7B8A92',
    fontSize: 11,
    marginTop: 5,
  },
  reviewsList: {
    flexGrow: 0,
  },
  reviewsEmpty: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
  },
  reviewsEmptyTitle: {
    color: '#18323E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  reviewsEmptyText: {
    color: '#7B8A92',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  reviewDate: {
    color: '#8A989F',
    fontSize: 10,
  },
  reviewComment: {
    color: '#42616E',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 11,
  },
  reviewNoComment: {
    color: '#8A989F',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 11,
  },
});
