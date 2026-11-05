import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import Header from '../../components/Header';
import type { Navigate } from '../../types';
import { money } from '../../utils/money';
import type { LaundryOrder } from '../../types/order';

export type Review = {
  orderId: string;
  laundryId?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Props = {
  navigate: Navigate;
  orders: LaundryOrder[];
  onTrack: (id: string) => void;
  isStore: boolean;
  reviews: Review[];
  onSubmitReview: (
    orderId: string,
    rating: number,
    comment: string,
  ) => Promise<boolean>;
  onNewOrder: () => void;
  onRefreshOrders: () => Promise<void>;
  onOpenChat: (orderId: string) => void;
  onCancelOrder: (orderId: string) => Promise<void>;
};

export default function OrdersScreen({
  navigate,
  orders,
  onTrack,
  isStore,
  reviews,
  onSubmitReview,
  onNewOrder,
  onRefreshOrders,
  onOpenChat,
  onCancelOrder,
}: Props) {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const openReview = (orderId: string) => {
    setReviewOrderId(orderId);
    setReviewRating(0);
    setReviewComment('');
  };

  const closeReview = () => {
    setReviewOrderId(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const submitCurrentReview = async () => {
    if (!reviewOrderId || submittingReview) return;

    if (reviewRating === 0) {
      Alert.alert(
        'Avaliação necessária',
        'Escolha uma nota de 1 a 5 estrelas.',
      );
      return;
    }

    try {
      setSubmittingReview(true);
      const saved = await onSubmitReview(
        reviewOrderId,
        reviewRating,
        reviewComment.trim(),
      );
      if (saved) closeReview();
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedOrders((current) =>
      current.includes(id)
        ? current.filter((orderId) => orderId !== id)
        : [...current, id],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title="Meus pedidos"
        onBack={() => navigate('home')}
        onHome={() => navigate('home')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Acompanhe suas roupas</Text>

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

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.75}
          disabled={refreshing}
          onPress={async () => {
            if (refreshing) return;
            setRefreshing(true);
            try {
              await onRefreshOrders();
            } finally {
              setRefreshing(false);
            }
          }}
        >
          {refreshing ? <ActivityIndicator size="small" color={C.blue} /> : <Ionicons name="refresh-outline" size={18} color={C.blue} />}
          <Text style={styles.refreshButtonText}>{refreshing ? 'Atualizando...' : 'Atualizar pedidos'}</Text>
        </TouchableOpacity>

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
            const isCancelled = order.status === 'cancelled';
            const isExpanded = expandedOrders.includes(order.id);

            const existingReview = reviews.find(
              (review) => review.orderId === order.id,
            );

            const hasExtraDetails = Boolean(
              order.time ||
                order.address ||
                order.instructions ||
                order.payment,
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
                      {isCancelled ? 'Cancelado' : ['Aguardando', 'Coleta agendada', 'Coletado', 'Em lavagem', 'Pronto', 'Entregue'][Math.max(0, Math.min(5, order.currentStep))]}
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
                        {order.paymentStatus ? (
                          <DetailRow icon="shield-checkmark-outline" label="Situação do pagamento" value={order.paymentStatus === 'paid' ? 'Pago' : order.paymentStatus === 'refunded' ? 'Estornado' : order.paymentStatus === 'failed' ? 'Não aprovado' : 'Aguardando confirmação'} />
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
                      name={isCancelled ? 'close-circle-outline' : isCompleted ? 'checkmark-circle-outline' : 'sync-outline'}
                      size={17}
                      color={isCancelled ? '#B42318' : isCompleted ? C.green : C.blue}
                    />

                    <Text style={styles.descriptionText}>
                      {isCancelled ? 'Este pedido foi cancelado.' : isCompleted
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

                <View style={styles.orderActions}>
                  <TouchableOpacity style={styles.chatButton} onPress={() => onOpenChat(order.id)} activeOpacity={0.8}>
                    <Ionicons name="chatbubble-ellipses-outline" size={17} color={C.blue} />
                    <Text style={styles.chatButtonText}>Conversar com a lavanderia</Text>
                  </TouchableOpacity>
                  {!isCompleted && order.currentStep <= (isStore ? 2 : 1) && (order as typeof order & { status?: string }).status !== 'cancelled' && (
                    <TouchableOpacity style={styles.cancelButton} onPress={() => onCancelOrder(order.id)} activeOpacity={0.8}>
                      <Ionicons name="close-circle-outline" size={17} color="#B42318" />
                      <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isCompleted && !isStore && (
                  <View style={styles.reviewSection}>
                    {existingReview ? (
                      <View style={styles.reviewDone}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={C.green}
                        />
                        <Text style={styles.reviewDoneText}>
                          Você avaliou este serviço: {existingReview.rating}/5
                          estrelas
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => openReview(order.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="star-outline"
                          size={19}
                          color={C.white}
                        />
                        <Text style={styles.reviewButtonText}>
                          Avaliar serviço
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

       

        {!isStore && (
          <TouchableOpacity
            style={styles.newOrder}
            onPress={onNewOrder}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={C.white}
            />
            <Text style={styles.newOrderText}>Fazer novo pedido</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.demoNote}>
          Seus pedidos são carregados da sua conta no LavaJá.
        </Text>
      </ScrollView>

      <Modal
        visible={reviewOrderId !== null}
        transparent
        animationType="fade"
        onRequestClose={closeReview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModal}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeReview}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={C.muted} />
            </TouchableOpacity>

            <Ionicons name="star" size={35} color="#F5B82E" />

            <Text style={styles.modalTitle}>
              Avalie nosso serviço
            </Text>

            <Text style={styles.modalSubtitle}>
              Como foi sua experiência com a lavanderia?
            </Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={38}
                    color="#F5B82E"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingDescription}>
              {reviewRating === 0
                ? 'Selecione sua nota'
                : `${reviewRating} de 5 estrelas`}
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Conte como foi sua experiência (opcional)"
              placeholderTextColor={C.muted}
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitReview, submittingReview && { opacity: 0.6 }]}
              onPress={submitCurrentReview}
              disabled={submittingReview}
              activeOpacity={0.8}
            >
              <Text style={styles.submitReviewText}>
                {submittingReview ? 'Salvando avaliação...' : 'Enviar avaliação'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelReview}
              onPress={closeReview}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelReviewText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('home')}
        >
          <Ionicons name="home-outline" size={21} color={C.muted} />
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
          <Ionicons name="person-outline" size={21} color={C.muted} />
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
  refreshButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: C.paleBlue,
  },
  refreshButtonText: { color: C.blue, fontSize: 12, fontWeight: '800' },
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
  reviewSection: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  reviewButton: {
    backgroundColor: C.blue,
    borderRadius: 11,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDoneText: {
    color: C.green,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  modalTitle: {
    color: C.navy,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 12,
  },
  modalSubtitle: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    marginTop: 22,
  },
  ratingDescription: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 18,
  },
  commentInput: {
    width: '100%',
    minHeight: 105,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    padding: 13,
    color: C.navy,
    fontSize: 13,
    marginBottom: 18,
  },
  submitReview: {
    width: '100%',
    backgroundColor: C.blue,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  submitReviewText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },
  cancelReview: {
    padding: 12,
    marginTop: 5,
  },
  cancelReviewText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  orderActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 12 },
  payButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.blue, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  payButtonText: { color: C.white, fontSize: 11, fontWeight: '800' },
  chatButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: C.line, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  chatButtonText: { color: C.blue, fontSize: 11, fontWeight: '800' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#F3C6C4', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  cancelButtonText: { color: '#B42318', fontSize: 11, fontWeight: '800' },
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