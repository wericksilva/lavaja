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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import type { Navigate } from '../../types';

type ProfileValues = { name: string; phone: string; address: string };
type Props = {
  name: string;
  email: string;
  phone: string;
  address: string;
  isStore: boolean;
  navigate: Navigate;
  onSave: (values: ProfileValues) => Promise<boolean>;
  onLogout: () => Promise<void>;
};

export default function ProfileScreen({
  name, email, phone, address, isStore, navigate, onSave, onLogout,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [draftAddress, setDraftAddress] = useState(address);

  const startEditing = () => {
    setDraftName(name);
    setDraftPhone(phone);
    setDraftAddress(address);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraftName(name);
    setDraftPhone(phone);
    setDraftAddress(address);
    setEditing(false);
  };

  const saveChanges = async () => {
    const cleanName = draftName.trim();
    const cleanPhone = draftPhone.trim();
    const digits = cleanPhone.replace(/\D/g, '');

    if (!cleanName) {
      Alert.alert('Atenção', 'Informe seu nome completo.');
      return;
    }
    if (cleanPhone && (digits.length < 10 || digits.length > 13)) {
      Alert.alert('Telefone inválido', 'Informe um telefone com DDD e número válido.');
      return;
    }

    setSaving(true);
    try {
      const saved = await onSave({
        name: cleanName,
        phone: cleanPhone,
        address: draftAddress.trim(),
      });
      if (saved) setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    const performLogout = async () => {
      if (loggingOut) return;
      setLoggingOut(true);
      try {
        await onLogout();
      } finally {
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente sair da sua conta?')) void performLogout();
      return;
    }

    Alert.alert('Sair da conta', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void performLogout() },
    ]);
  };

  const goHome = () => {
    if (editing) cancelEditing();
    navigate('home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header title="Meu perfil" onBack={goHome} onHome={goHome} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Ionicons name={isStore ? 'storefront-outline' : 'person'} size={42} color={C.blue} /></View>
          <Text style={styles.userName}>{name || (isStore ? 'Minha lavanderia' : 'Cliente LavaJá')}</Text>
          <Text style={styles.userEmail}>{email || 'E-mail não informado'}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="checkmark-circle" size={15} color={C.green} />
            <Text style={styles.memberText}>{isStore ? 'Parceiro LavaJá' : 'Cliente LavaJá'}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dados da conta</Text>
          <TouchableOpacity onPress={editing ? cancelEditing : startEditing} style={styles.editButton} activeOpacity={0.7}>
            <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={17} color={C.blue} />
            <Text style={styles.editText}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="person-outline" size={20} color={C.blue} /></View>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Nome completo</Text>
              {editing ? <TextInput value={draftName} onChangeText={setDraftName} style={styles.input} placeholder="Seu nome" autoCapitalize="words" /> : <Text style={styles.value}>{name || 'Não informado'}</Text>}
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="mail-outline" size={20} color={C.blue} /></View>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>E-mail de acesso</Text>
              <Text style={styles.value}>{email || 'Não informado'}</Text>
              {editing && <Text style={styles.helper}>Para alterar o e-mail de acesso, use o fluxo de segurança da sua conta.</Text>}
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="call-outline" size={20} color={C.blue} /></View>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Telefone</Text>
              {editing ? <TextInput value={draftPhone} onChangeText={setDraftPhone} style={styles.input} keyboardType="phone-pad" placeholder="(00) 00000-0000" /> : <Text style={styles.value}>{phone || 'Não informado'}</Text>}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Endereço padrão</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <View style={styles.fieldIcon}><Ionicons name="location-outline" size={21} color={C.blue} /></View>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Endereço de coleta</Text>
              {editing ? <TextInput value={draftAddress} onChangeText={setDraftAddress} style={[styles.input, styles.addressInput]} placeholder="Rua, número, bairro e complemento" multiline /> : <Text style={styles.value}>{address || 'Nenhum endereço cadastrado'}</Text>}
            </View>
          </View>
        </View>

        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing} disabled={saving}>
              <Text style={styles.cancelButtonText}>Descartar alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={() => void saveChanges()} disabled={saving}>
              {saving ? <ActivityIndicator color={C.white} /> : <Ionicons name="checkmark-circle-outline" size={19} color={C.white} />}
              <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Minha conta</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigate('orders')}>
          <Ionicons name="receipt-outline" size={21} color={C.blue} />
          <Text style={styles.optionText}>{isStore ? 'Pedidos recebidos' : 'Meus pedidos'}</Text>
          <Ionicons name="chevron-forward" size={19} color={C.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigate('helpSupport')}>
          <Ionicons name="help-circle-outline" size={21} color={C.blue} />
          <Text style={styles.optionText}>Ajuda e suporte</Text>
          <Ionicons name="chevron-forward" size={19} color={C.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.logout, loggingOut && styles.disabled]} onPress={confirmLogout} disabled={loggingOut}>
          {loggingOut ? <ActivityIndicator color="#D64545" /> : <Ionicons name="log-out-outline" size={21} color="#D64545" />}
          <Text style={styles.logoutText}>{loggingOut ? 'Saindo...' : 'Sair da conta'}</Text>
        </TouchableOpacity>
        <Text style={styles.version}>LavaJá • Sua lavanderia, sem sair de casa.</Text>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={goHome}><Ionicons name="home-outline" size={21} color={C.muted} /><Text style={styles.navText}>Início</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('orders')}><Ionicons name="receipt-outline" size={21} color={C.muted} /><Text style={styles.navText}>Pedidos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('helpSupport')}><Ionicons name="help-circle-outline" size={21} color={C.muted} /><Text style={styles.navText}>Ajuda</Text></TouchableOpacity>
        <View style={styles.navItem}><Ionicons name="person" size={21} color={C.blue} /><Text style={[styles.navText, styles.navTextActive]}>Perfil</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  content: { padding: 20, paddingBottom: 30 },
  profileHeader: { alignItems: 'center', paddingVertical: 22, marginBottom: 12 },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  userName: { fontSize: 21, fontWeight: '900', color: C.navy, textAlign: 'center' },
  userEmail: { fontSize: 13, color: C.muted, marginTop: 5 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E7F7F1', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginTop: 12 },
  memberText: { color: C.green, fontSize: 11, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: C.navy, fontSize: 16, fontWeight: '900', marginBottom: 12, marginTop: 15 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 7 },
  editText: { color: C.blue, fontSize: 12, fontWeight: '800' },
  card: { backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.line, paddingHorizontal: 15, marginBottom: 12 },
  field: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 12 },
  fieldIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  fieldContent: { flex: 1 },
  label: { color: C.muted, fontSize: 11, marginBottom: 5 },
  value: { color: C.navy, fontSize: 13, fontWeight: '600' },
  input: { color: C.navy, fontSize: 14, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.line },
  addressInput: { minHeight: 58, textAlignVertical: 'top' },
  helper: { color: C.muted, fontSize: 10, marginTop: 5, lineHeight: 15 },
  separator: { height: 1, backgroundColor: C.line },
  editActions: { gap: 10, marginTop: 8 },
  cancelButton: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center' },
  cancelButtonText: { color: C.muted, fontWeight: '700', fontSize: 13 },
  saveButton: { minHeight: 50, borderRadius: 14, backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonText: { color: C.white, fontWeight: '800', fontSize: 14 },
  disabled: { opacity: 0.55 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, backgroundColor: C.white, borderRadius: 15, borderWidth: 1, borderColor: C.line, marginBottom: 9 },
  optionText: { flex: 1, color: C.navy, fontSize: 13, fontWeight: '700' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 16, marginTop: 14, borderRadius: 15, backgroundColor: '#FFF2F2' },
  logoutText: { color: '#D64545', fontSize: 13, fontWeight: '800' },
  version: { textAlign: 'center', color: C.muted, fontSize: 10, marginTop: 22, marginBottom: 8 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 10 },
  navItem: { alignItems: 'center', gap: 4, minWidth: 55 },
  navText: { fontSize: 10, color: C.muted, fontWeight: '600' },
  navTextActive: { color: C.blue, fontWeight: '800' },
});
