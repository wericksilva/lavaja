
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import type { Navigate } from '../../types';

type Props = {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  navigate: Navigate;
};

export default function ProfileScreen({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  navigate,
}: Props) {
  const [editing, setEditing] = useState(false);

  const sair = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          onPress: () => navigate('login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title="Meu perfil"
        onBack={() => navigate('home')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FOTO E IDENTIFICAÇÃO */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={42}
              color={C.blue}
            />
          </View>

          <Text style={styles.userName}>
            {name || 'Cliente LavaJá'}
          </Text>

          <Text style={styles.userEmail}>
            {email || 'usuario@email.com'}
          </Text>

          <View style={styles.memberBadge}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={C.green}
            />
            <Text style={styles.memberText}>
              Cliente LavaJá
            </Text>
          </View>
        </View>

        {/* DADOS PESSOAIS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Dados pessoais
          </Text>

          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            style={styles.editButton}
          >
            <Ionicons
              name={editing ? 'close-outline' : 'create-outline'}
              size={17}
              color={C.blue}
            />

            <Text style={styles.editText}>
              {editing ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Ionicons name="person-outline" size={20} color={C.blue} />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>Nome completo</Text>

              {editing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Seu nome"
                />
              ) : (
                <Text style={styles.value}>
                  {name || 'Não informado'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Ionicons name="mail-outline" size={20} color={C.blue} />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>E-mail</Text>

              {editing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Seu e-mail"
                />
              ) : (
                <Text style={styles.value}>
                  {email || 'Não informado'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Ionicons name="call-outline" size={20} color={C.blue} />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>Telefone</Text>

              {editing ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="Seu telefone"
                />
              ) : (
                <Text style={styles.value}>
                  {phone || 'Não informado'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ENDEREÇO */}
        <Text style={styles.sectionTitle}>
          Endereço de coleta
        </Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <View style={styles.fieldIcon}>
              <Ionicons
                name="location-outline"
                size={21}
                color={C.blue}
              />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>Endereço principal</Text>

              {editing ? (
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  placeholder="Informe seu endereço"
                />
              ) : (
                <Text style={styles.value}>
                  {address || 'Nenhum endereço cadastrado'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* SALVAR */}
        {editing && (
          <PrimaryButton
            title="Salvar alterações"
            onPress={() => {
              setEditing(false);
              Alert.alert(
                'Sucesso',
                'Seus dados foram atualizados!'
              );
            }}
            icon="checkmark-circle-outline"
          />
        )}

        {/* ATALHOS */}
        <Text style={styles.sectionTitle}>
          Minha conta
        </Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigate('orders')}
        >
          <Ionicons
            name="receipt-outline"
            size={21}
            color={C.blue}
          />

          <Text style={styles.optionText}>
            Meus pedidos
          </Text>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={C.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            Alert.alert(
              'Ajuda',
              'Entre em contato com nossa equipe de atendimento.'
            )
          }
        >
          <Ionicons
            name="help-circle-outline"
            size={21}
            color={C.blue}
          />

          <Text style={styles.optionText}>
            Ajuda e suporte
          </Text>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={C.muted}
          />
        </TouchableOpacity>

        {/* SAIR */}
        <TouchableOpacity
          style={styles.logout}
          onPress={sair}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#D64545"
          />

          <Text style={styles.logoutText}>
            Sair da conta
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          LavaJá • Sua lavanderia, sem sair de casa.
        </Text>

      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('home')}
        >
          <Ionicons name="home-outline" size={21} color={C.muted} />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('orders')}
        >
          <Ionicons name="receipt-outline" size={21} color={C.muted} />
          <Text style={styles.navText}>Pedidos</Text>
        </TouchableOpacity>

        <View style={styles.navItem}>
          <Ionicons name="person" size={21} color={C.blue} />
          <Text style={styles.navActive}>Perfil</Text>
        </View>
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
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    marginBottom: 15,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  userName: {
    fontSize: 21,
    fontWeight: '900',
    color: C.navy,
  },

  userEmail: {
    fontSize: 13,
    color: C.muted,
    marginTop: 5,
  },

  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E7F7F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },

  memberText: {
    color: C.green,
    fontSize: 11,
    fontWeight: '800',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 15,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 7,
  },

  editText: {
    color: C.blue,
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
  },

  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldContent: {
    flex: 1,
  },

  label: {
    color: C.muted,
    fontSize: 11,
    marginBottom: 5,
  },

  value: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  input: {
    color: C.navy,
    fontSize: 13,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: C.blue,
    paddingVertical: 5,
  },

  separator: {
    height: 1,
    backgroundColor: C.line,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: C.white,
    borderRadius: 15,
    padding: 16,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: C.line,
  },

  optionText: {
    flex: 1,
    color: C.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#FFF0F0',
    borderRadius: 15,
    padding: 16,
    marginTop: 22,
  },

  logoutText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '800',
  },

  version: {
    color: C.muted,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 22,
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
