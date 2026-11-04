import type { Navigate } from '../../types';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type ServiceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  deadline: string;
  active: boolean;
};

type Props = {
  navigate: Navigate;
};

const initialServices: ServiceItem[] = [
  {
    id: '1',
    name: 'Lavagem tradicional',
    description: 'Lavagem e secagem de roupas do dia a dia.',
    price: 25,
    deadline: '24 horas',
    active: true,
  },
  {
    id: '2',
    name: 'Lavagem expressa',
    description: 'Lavagem rápida para quem tem urgência.',
    price: 40,
    deadline: '6 horas',
    active: true,
  },
  {
    id: '3',
    name: 'Passadoria',
    description: 'Passadoria profissional de peças de roupa.',
    price: 18,
    deadline: '48 horas',
    active: false,
  },
];

export default function ServicesScreen({ navigate }: Props) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [active, setActive] = useState(true);

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  function openNewService() {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDeadline('');
    setActive(true);
    setModalVisible(true);
  }

  function openEditService(service: ServiceItem) {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description);
    setPrice(String(service.price).replace('.', ','));
    setDeadline(service.deadline);
    setActive(service.active);
    setModalVisible(true);
  }

  function saveService() {
    const numericPrice = Number(price.replace(',', '.'));

    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe o nome do serviço.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Atenção', 'Informe a descrição do serviço.');
      return;
    }

    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Atenção', 'Informe um preço válido.');
      return;
    }

    if (!deadline.trim()) {
      Alert.alert('Atenção', 'Informe o prazo estimado.');
      return;
    }

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId
            ? {
                ...service,
                name: name.trim(),
                description: description.trim(),
                price: numericPrice,
                deadline: deadline.trim(),
                active,
              }
            : service
        )
      );

      Alert.alert('Sucesso', 'Serviço atualizado!');
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        deadline: deadline.trim(),
        active,
      };

      setServices((current) => [newService, ...current]);
      Alert.alert('Sucesso', 'Serviço cadastrado!');
    }

    setModalVisible(false);
  }

  function toggleService(id: string) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? { ...service, active: !service.active }
          : service
      )
    );
  }

  function deleteService(id: string) {
    Alert.alert(
      'Excluir serviço',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setServices((current) =>
              current.filter((service) => service.id !== id)
            );
          },
        },
      ]
    );
  }

  const activeCount = services.filter((item) => item.active).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate('home')}
        >
          <Ionicons name="arrow-back" size={23} color="#172B4D" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Serviços e preços</Text>
          <Text style={styles.headerSubtitle}>
            Configure os serviços da sua lavanderia
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="pricetag-outline" size={25} color="#087F8C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Seus serviços</Text>
            <Text style={styles.summaryDescription}>
              Gerencie os serviços oferecidos aos clientes.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{services.length}</Text>
            <Text style={styles.statLabel}>Cadastrados</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#15966A' }]}>
              {activeCount}
            </Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#8993A4' }]}>
              {services.length - activeCount}
            </Text>
            <Text style={styles.statLabel}>Inativos</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Lista de serviços</Text>
            <Text style={styles.sectionSubtitle}>
              Os serviços ativos ficam disponíveis para os clientes.
            </Text>
          </View>
        </View>

        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={42} color="#AAB3C0" />
            <Text style={styles.emptyTitle}>Nenhum serviço cadastrado</Text>
            <Text style={styles.emptyText}>
              Cadastre seu primeiro serviço para começar.
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceTop}>
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name="shirt-outline"
                    size={23}
                    color="#087F8C"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      service.active
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: service.active
                            ? '#15966A'
                            : '#8993A4',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: service.active ? '#137A58' : '#687386',
                        },
                      ]}
                    >
                      {service.active ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.servicePrice}>
                  {formatPrice(service.price)}
                </Text>
              </View>

              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>

              <View style={styles.deadlineRow}>
                <Ionicons name="time-outline" size={17} color="#7B8798" />
                <Text style={styles.deadlineText}>
                  Prazo estimado: {service.deadline}
                </Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.serviceActions}>
                <View style={styles.switchContainer}>
                  <Switch
                    value={service.active}
                    onValueChange={() => toggleService(service.id)}
                    trackColor={{ false: '#D7DDE5', true: '#8BD4CC' }}
                    thumbColor={service.active ? '#087F8C' : '#F4F5F7'}
                  />
                  <Text style={styles.switchLabel}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditService(service)}
                  >
                    <Ionicons name="create-outline" size={17} color="#087F8C" />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteService(service.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#D94B4B"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={openNewService}
        >
          <Ionicons name="add-circle-outline" size={21} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Cadastrar novo serviço</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingId ? 'Editar serviço' : 'Novo serviço'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Preencha as informações abaixo.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={23} color="#526174" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Nome do serviço</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: Lavagem tradicional"
                placeholderTextColor="#A0A9B6"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva o que está incluso no serviço..."
                placeholderTextColor="#A0A9B6"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Preço (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 25,00"
                placeholderTextColor="#A0A9B6"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Prazo estimado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 24 horas ou 2 dias"
                placeholderTextColor="#A0A9B6"
                value={deadline}
                onChangeText={setDeadline}
              />

              <View style={styles.activeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTitle}>Serviço ativo</Text>
                  <Text style={styles.activeDescription}>
                    Disponibilizar este serviço para os clientes.
                  </Text>
                </View>

                <Switch
                  value={active}
                  onValueChange={setActive}
                  trackColor={{ false: '#D7DDE5', true: '#8BD4CC' }}
                  thumbColor={active ? '#087F8C' : '#F4F5F7'}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveService}
              >
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Salvar alterações' : 'Cadastrar serviço'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 17,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172B4D',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7B8798',
    marginTop: 3,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F5',
    borderRadius: 16,
    padding: 17,
    marginBottom: 15,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#173C49',
  },
  summaryDescription: {
    fontSize: 12,
    color: '#607B83',
    marginTop: 4,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172B4D',
  },
  statLabel: {
    fontSize: 11,
    color: '#7B8798',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172B4D',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7B8798',
    marginTop: 4,
    lineHeight: 17,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EDF0F4',
  },
  serviceTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F6F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: '#E7F6EF',
  },
  inactiveBadge: {
    backgroundColor: '#F0F2F5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#087F8C',
    marginLeft: 5,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
    marginTop: 13,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  deadlineText: {
    fontSize: 12,
    color: '#7B8798',
    marginLeft: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EDF0F4',
    marginVertical: 13,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F5',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 5,
  },
  editButtonText: {
    fontSize: 12,
    color: '#087F8C',
    fontWeight: '700',
  },
  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#087F8C',
    borderRadius: 13,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    gap: 9,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#172B4D',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    color: '#7B8798',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 29, 48, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 25,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7B8798',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34445A',
    marginBottom: 7,
    marginTop: 13,
  },
  input: {
    backgroundColor: '#F7F9FB',
    borderWidth: 1,
    borderColor: '#E3E8EF',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: '#172B4D',
  },
  textArea: {
    minHeight: 85,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 20,
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172B4D',
  },
  activeDescription: {
    fontSize: 11,
    color: '#7B8798',
    marginTop: 4,
    paddingRight: 10,
  },
  saveButton: {
    backgroundColor: '#087F8C',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    padding: 13,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '700',
  },
});
