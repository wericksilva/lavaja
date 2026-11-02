import React from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';
import Field from '../../components/Field';
import Header from '../../components/Header';
import Brand from '../../components/Brand';
import PrimaryButton from '../../components/PrimaryButton';
import { services } from '../../data/services';
import { money } from '../../utils/money';
import type { Navigate, Service, PaymentMethod } from '../../types';

type Props = {
name: string;
  setService: (value: Service) => void;
  navigate: Navigate;
};

export default function HomeScreen({ name, setService, navigate }: Props) {
  return (
  <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.homeTop}>
        <View><Brand /><Text style={styles.greeting}>Oi, {name.trim().split(' ')[0] || 'tudo bem'} 👋</Text><Text style={styles.greetingSub}>Sua lavanderia, sem sair de casa.</Text></View>
        <TouchableOpacity style={styles.avatar} onPress={() => Alert.alert('Perfil', 'A área de perfil será conectada na próxima etapa.')}><Ionicons name="person-outline" size={22} color={C.navy} /></TouchableOpacity>
      </View>
      <View style={styles.promoCard}>
        <View style={{ flex: 1 }}>
          <View style={styles.promoPill}><Text style={styles.promoPillText}>LAVAJÁ NA SUA PORTA</Text></View>
          <Text style={styles.promoTitle}>Seu tempo vale{'\n'}mais que uma pilha de roupa.</Text>
          <Text style={styles.promoBody}>Buscamos, cuidamos e devolvemos.</Text>
          <TouchableOpacity onPress={() => navigate('schedule')} style={styles.promoButton}><Text style={styles.promoButtonText}>Agendar coleta</Text><Ionicons name="arrow-forward" size={16} color={C.navy} /></TouchableOpacity>
        </View>
        <View style={styles.promoArt}><Ionicons name="shirt" size={54} color="#fff" /><View style={styles.promoSpark}><Ionicons name="sparkles" size={20} color={C.navy} /></View></View>
      </View>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>O que você precisa hoje?</Text><Text style={styles.sectionCaption}>Escolha seu serviço</Text></View>
      {services.map(item => (
        <TouchableOpacity key={item.name} activeOpacity={0.8} style={styles.serviceCard} onPress={() => { setService(item.name); navigate('schedule'); }}>
          <View style={styles.serviceIcon}><Ionicons name={item.icon} size={25} color={C.blue} /></View>
          <View style={{ flex: 1 }}><Text style={styles.serviceName}>{item.name}</Text><Text style={styles.serviceDetail}>{item.detail}</Text><Text style={styles.servicePrice}>A partir de {money(item.price)}</Text></View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </TouchableOpacity>
      ))}
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Como funciona</Text></View>
      <View style={styles.stepsRow}>
        {[{ icon: 'calendar-outline' as const, title: 'Agende', body: 'Escolha o horário' }, { icon: 'bicycle-outline' as const, title: 'Buscamos', body: 'Na sua porta' }, { icon: 'sparkles-outline' as const, title: 'Entregamos', body: 'Tudo limpinho' }].map((s, i) => (
          <View key={s.title} style={styles.stepItem}><View style={styles.stepIcon}><Ionicons name={s.icon} size={22} color={C.blue} /></View><Text style={styles.stepTitle}>{s.title}</Text><Text style={styles.stepBody}>{s.body}</Text></View>
        ))}
      </View>
      <View style={styles.bottomNav}>
        <View style={styles.navItem}><Ionicons name="home" size={21} color={C.blue} /><Text style={styles.navActive}>Início</Text></View>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('orders')} ><Ionicons name="receipt-outline" size={21} color={C.muted} /><Text style={styles.navText}>Pedidos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert('Perfil', 'A área de perfil será conectada na próxima etapa.')}><Ionicons name="person-outline" size={21} color={C.muted} /><Text style={styles.navText}>Perfil</Text></TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}
