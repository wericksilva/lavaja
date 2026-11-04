import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/theme';
import { styles } from '../../styles/globalStyles';

import Brand from '../../components/Brand';

import { services } from '../../data/services';
import { money } from '../../utils/money';

import type { Navigate, Service } from '../../types';

type Props = {
  name: string;
  setService: (value: Service) => void;
  navigate: Navigate;
  isStore: boolean;
};

export default function HomeScreen({
  name,
  setService,
  navigate,
  isStore,
}: Props) {
  const firstName = name.trim().split(' ')[0] || 'tudo bem';

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.homeScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.homeTop}>
          <View>
            <Brand />

            <Text style={styles.greeting}>
              Oi, {firstName} 👋
            </Text>

            <Text style={styles.greetingSub}>
              {isStore
                ? 'Bem-vindo ao LavaJá.'
                : 'Sua lavanderia, sem sair de casa.'}
            </Text>
          </View>

          {/* BOTÃO PERFIL */}
          <TouchableOpacity
            onPress={() => navigate('profile')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: C.paleBlue,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color={C.blue}
            />
          </TouchableOpacity>
        </View>

        {isStore ? (
          <>
            {/* CONTEÚDO DA LAVANDERIA */}

            <View style={styles.promoCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.promoPill}>
                  <Text style={styles.promoPillText}>
                    ÁREA DA LAVANDERIA
                  </Text>
                </View>

                <Text style={styles.promoTitle}>
                  Gerencie sua{'\n'}
                  lavanderia.
                </Text>

                <Text style={styles.promoBody}>
                  Acompanhe pedidos e atualize o andamento dos serviços.
                </Text>

                <TouchableOpacity
                  onPress={() => navigate('admin')}
                  style={styles.promoButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.promoButtonText}>
                    Abrir painel
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={C.navy}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.promoArt}>
                <Ionicons
                  name="storefront"
                  size={54}
                  color="#fff"
                />

                <View style={styles.promoSpark}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={C.navy}
                  />
                </View>
              </View>
            </View>

            {/* ATALHOS DA LAVANDERIA */}
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                Gerencie seu negócio
              </Text>

              <Text style={styles.sectionCaption}>
                Acesse as principais funcionalidades
              </Text>
            </View>

            {/* PAINEL ADMINISTRATIVO */}
            <TouchableOpacity
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => navigate('admin')}
            >
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="grid-outline"
                  size={25}
                  color={C.blue}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>
                  Painel administrativo
                </Text>

                <Text style={styles.serviceDetail}>
                  Gerencie pedidos e atualize os status.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={C.muted}
              />
            </TouchableOpacity>

            {/* PEDIDOS */}
            <TouchableOpacity
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => navigate('orders')}
            >
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={25}
                  color={C.blue}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>
                  Pedidos
                </Text>

                <Text style={styles.serviceDetail}>
                  Consulte os pedidos cadastrados.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={C.muted}
              />
            </TouchableOpacity>

            {/* PERFIL */}
            <TouchableOpacity
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => navigate('profile')}
            >
              <View style={styles.serviceIcon}>
                <Ionicons
                  name="person-outline"
                  size={25}
                  color={C.blue}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>
                  Meu perfil
                </Text>

                <Text style={styles.serviceDetail}>
                  Consulte e atualize seus dados.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={C.muted}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* CONTEÚDO DO CLIENTE */}

            {/* CARD PROMOCIONAL */}
            <View style={styles.promoCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.promoPill}>
                  <Text style={styles.promoPillText}>
                    LAVAJÁ NA SUA PORTA
                  </Text>
                </View>

                <Text style={styles.promoTitle}>
                  Seu tempo vale{'\n'}
                  mais que uma pilha de roupa.
                </Text>

                <Text style={styles.promoBody}>
                  Buscamos, cuidamos e devolvemos.
                </Text>

                <TouchableOpacity
                  onPress={() => navigate('schedule')}
                  style={styles.promoButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.promoButtonText}>
                    Agendar coleta
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={C.navy}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.promoArt}>
                <Ionicons
                  name="shirt"
                  size={54}
                  color="#fff"
                />

                <View style={styles.promoSpark}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={C.navy}
                  />
                </View>
              </View>
            </View>

            {/* SERVIÇOS */}
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                O que você precisa hoje?
              </Text>

              <Text style={styles.sectionCaption}>
                Escolha seu serviço
              </Text>
            </View>

            {services.map((item) => (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.8}
                style={styles.serviceCard}
                onPress={() => {
                  setService(item.name);
                  navigate('schedule');
                }}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name={item.icon}
                    size={25}
                    color={C.blue}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>
                    {item.name}
                  </Text>

                  <Text style={styles.serviceDetail}>
                    {item.detail}
                  </Text>

                  <Text style={styles.servicePrice}>
                    A partir de {money(item.price)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={C.muted}
                />
              </TouchableOpacity>
            ))}

            {/* COMO FUNCIONA */}
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                Como funciona
              </Text>
            </View>

            <View style={styles.stepsRow}>
              {[
                {
                  icon: 'calendar-outline' as const,
                  title: 'Agende',
                  body: 'Escolha o horário',
                },
                {
                  icon: 'bicycle-outline' as const,
                  title: 'Buscamos',
                  body: 'Na sua porta',
                },
                {
                  icon: 'sparkles-outline' as const,
                  title: 'Entregamos',
                  body: 'Tudo limpinho',
                },
              ].map((s) => (
                <View
                  key={s.title}
                  style={styles.stepItem}
                >
                  <View style={styles.stepIcon}>
                    <Ionicons
                      name={s.icon}
                      size={22}
                      color={C.blue}
                    />
                  </View>

                  <Text style={styles.stepTitle}>
                    {s.title}
                  </Text>

                  <Text style={styles.stepBody}>
                    {s.body}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomNav}>
        {/* INÍCIO */}
        <View style={styles.navItem}>
          <Ionicons
            name="home"
            size={21}
            color={C.blue}
          />

          <Text style={styles.navActive}>
            Início
          </Text>
        </View>

        {/* PEDIDOS */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('orders')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="receipt-outline"
            size={21}
            color={C.muted}
          />

          <Text style={styles.navText}>
            Pedidos
          </Text>
        </TouchableOpacity>

        {/* PERFIL */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={21}
            color={C.muted}
          />

          <Text style={styles.navText}>
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}