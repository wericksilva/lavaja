import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type Screen = 'login' | 'register' | 'home' | 'schedule' | 'payment' | 'confirmation';
type Service = 'Lavagem e dobra' | 'Lavar e passar' | 'Passadoria';
type PaymentMethod = 'Pix' | 'Cartão de crédito' | 'Pagar na entrega';

const C = {
  navy: '#102A43',
  blue: '#1769E0',
  blueDark: '#0F56BD',
  mint: '#C9F7E8',
  bg: '#F4F8FC',
  white: '#FFFFFF',
  text: '#243B53',
  muted: '#8293A5',
  line: '#E2EAF2',
  green: '#16856B',
  paleBlue: '#E8F1FF',
};

const services: { name: Service; detail: string; price: number; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Lavagem e dobra', detail: 'Prático para o dia a dia', price: 39.90, icon: 'shirt-outline' },
  { name: 'Lavar e passar', detail: 'Suas peças prontas para usar', price: 59.90, icon: 'sparkles-outline' },
  { name: 'Passadoria', detail: 'Só passar, sem lavar', price: 29.90, icon: 'cloud-outline' },
];

function money(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function PrimaryButton({ title, onPress, disabled = false, icon }: { title: string; onPress: () => void; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled}
      style={[styles.primaryButton, disabled && { opacity: 0.45 }]}>
      <Text style={styles.primaryButtonText}>{title}</Text>
      {icon ? <Ionicons name={icon} size={19} color="#fff" /> : null}
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, icon }: {
  label: string; value: string; onChangeText: (s: string) => void; placeholder: string;
  secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address' | 'phone-pad'; icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {icon ? <Ionicons name={icon} size={19} color={C.muted} style={{ marginRight: 10 }} /> : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
          placeholderTextColor="#A6B3C1" secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          style={styles.input} />
      </View>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.pageHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={21} color={C.navy} />
      </TouchableOpacity>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={{ width: 42 }} />
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [service, setService] = useState<Service>('Lavagem e dobra');
  const [date, setDate] = useState('Hoje, 29 out.');
  const [time, setTime] = useState('14h–16h');
  const [payment, setPayment] = useState<PaymentMethod>('Pix');
  const [instructions, setInstructions] = useState('');
  const [orderNumber] = useState('LJ-2048');

  const selectedService = services.find(s => s.name === service) || services[0];
  const total = useMemo(() => selectedService.price + 8.90, [selectedService]);

  const showHome = () => setScreen('home');
  const backFromSchedule = () => setScreen('home');

  const login = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Falta preencher', 'Informe seu e-mail e sua senha para continuar.');
      return;
    }
    setName(name || 'Cliente');
    setScreen('home');
  };

  const register = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Falta preencher', 'Preencha nome, e-mail, telefone e senha.');
      return;
    }
    setScreen('home');
  };

  const continueToPayment = () => {
    if (!address.trim()) {
      Alert.alert('Endereço necessário', 'Informe o endereço de coleta para continuar.');
      return;
    }
    setScreen('payment');
  };

  const confirmOrder = () => {
    setScreen('confirmation');
  };

  const resetOrder = () => {
    setService('Lavagem e dobra');
    setAddress('');
    setInstructions('');
    setScreen('home');
  };

  const Brand = () => (
    <View style={styles.brandRow}>
      <View style={styles.brandIcon}><Ionicons name="water" size={23} color="#fff" /></View>
      <Text style={styles.brandText}>lava<Text style={{ color: C.blue }}>já</Text></Text>
    </View>
  );

  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.authHero}>
              <Brand />
              <View style={styles.heroIllustration}>
                <View style={styles.bubbleOne} /><View style={styles.bubbleTwo} />
                <Ionicons name="shirt" size={74} color={C.blue} />
                <View style={styles.heroCheck}><Ionicons name="checkmark" size={19} color="#fff" /></View>
              </View>
              <Text style={styles.authTitle}>Roupa limpa.{'\n'}Tempo livre.</Text>
              <Text style={styles.authSubtitle}>A gente busca, lava e entrega na sua porta.</Text>
            </View>
            <View style={styles.authCard}>
              <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
              <Text style={styles.cardSubtitle}>Entre para agendar sua próxima coleta.</Text>
              <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" icon="mail-outline" />
              <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry icon="lock-closed-outline" />
              <TouchableOpacity style={styles.forgot}><Text style={styles.linkText}>Esqueci minha senha</Text></TouchableOpacity>
              <PrimaryButton title="Entrar" onPress={login} icon="arrow-forward" />
              <View style={styles.authFooter}><Text style={styles.mutedText}>Ainda não tem conta? </Text><TouchableOpacity onPress={() => setScreen('register')}><Text style={styles.linkText}>Criar cadastro</Text></TouchableOpacity></View>
              <TouchableOpacity onPress={showHome} style={styles.demoLink}><Text style={styles.demoText}>Explorar o app de demonstração</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <Header title="Criar cadastro" onBack={() => setScreen('login')} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
            <View style={styles.registerIcon}><Ionicons name="person-add-outline" size={28} color={C.blue} /></View>
            <Text style={styles.pageHeadline}>Vamos facilitar sua rotina.</Text>
            <Text style={styles.pageSub}>Crie sua conta para acompanhar suas roupas em cada etapa.</Text>
            <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Como podemos te chamar?" icon="person-outline" />
            <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" icon="mail-outline" />
            <Field label="Celular" value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" keyboardType="phone-pad" icon="call-outline" />
            <Field label="Crie uma senha" value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" secureTextEntry icon="lock-closed-outline" />
            <Text style={styles.terms}>Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.</Text>
            <PrimaryButton title="Criar minha conta" onPress={register} icon="arrow-forward" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (screen === 'home') {
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
              <TouchableOpacity onPress={() => setScreen('schedule')} style={styles.promoButton}><Text style={styles.promoButtonText}>Agendar coleta</Text><Ionicons name="arrow-forward" size={16} color={C.navy} /></TouchableOpacity>
            </View>
            <View style={styles.promoArt}><Ionicons name="shirt" size={54} color="#fff" /><View style={styles.promoSpark}><Ionicons name="sparkles" size={20} color={C.navy} /></View></View>
          </View>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>O que você precisa hoje?</Text><Text style={styles.sectionCaption}>Escolha seu serviço</Text></View>
          {services.map(item => (
            <TouchableOpacity key={item.name} activeOpacity={0.8} style={styles.serviceCard} onPress={() => { setService(item.name); setScreen('schedule'); }}>
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
            <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert('Meus pedidos', 'O histórico de pedidos será conectado na próxima etapa.')}><Ionicons name="receipt-outline" size={21} color={C.muted} /><Text style={styles.navText}>Pedidos</Text></TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert('Perfil', 'A área de perfil será conectada na próxima etapa.')}><Ionicons name="person-outline" size={21} color={C.muted} /><Text style={styles.navText}>Perfil</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'schedule') {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <Header title="Agendar coleta" onBack={backFromSchedule} />
        <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
          <View style={styles.stepProgress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressInactive} /></View>
          <Text style={styles.pageHeadline}>Vamos buscar suas roupas.</Text>
          <Text style={styles.pageSub}>Escolha o serviço, endereço e melhor horário.</Text>
          <Text style={styles.formSectionTitle}>1. Escolha o serviço</Text>
          {services.map(item => (
            <TouchableOpacity key={item.name} onPress={() => setService(item.name)} style={[styles.optionCard, service === item.name && styles.optionCardSelected]}>
              <View style={[styles.optionRadio, service === item.name && styles.optionRadioSelected]}>{service === item.name ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{item.name}</Text><Text style={styles.optionDetail}>{item.detail}</Text></View>
              <Text style={styles.optionPrice}>{money(item.price)}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.formSectionTitle}>2. Endereço de coleta</Text>
          <Field label="Rua, número e complemento" value={address} onChangeText={setAddress} placeholder="Ex.: Rua das Flores, 123, ap. 4" icon="location-outline" />
          <Field label="Instruções para o entregador (opcional)" value={instructions} onChangeText={setInstructions} placeholder="Portaria, ponto de referência..." icon="chatbubble-ellipses-outline" />
          <Text style={styles.formSectionTitle}>3. Quando podemos buscar?</Text>
          <Text style={styles.fieldLabel}>Dia da coleta</Text>
          <View style={styles.chipRow}>{['Hoje, 29 out.', 'Amanhã, 30 out.', 'Sáb., 31 out.'].map(d => <TouchableOpacity key={d} onPress={() => setDate(d)} style={[styles.chip, date === d && styles.chipSelected]}><Text style={[styles.chipText, date === d && styles.chipTextSelected]}>{d}</Text></TouchableOpacity>)}</View>
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Janela de horário</Text>
          <View style={styles.chipRow}>{['10h–12h', '14h–16h', '18h–20h'].map(t => <TouchableOpacity key={t} onPress={() => setTime(t)} style={[styles.timeChip, time === t && styles.chipSelected]}><Text style={[styles.chipText, time === t && styles.chipTextSelected]}>{t}</Text></TouchableOpacity>)}</View>
          <View style={styles.priceSummary}>
            <View><Text style={styles.summaryLabel}>Serviço selecionado</Text><Text style={styles.summaryValue}>{service}</Text></View>
            <Text style={styles.summaryPrice}>{money(selectedService.price)}</Text>
          </View>
          <PrimaryButton title="Continuar para pagamento" onPress={continueToPayment} icon="arrow-forward" />
          <Text style={styles.smallDisclaimer}>Valores estimados para demonstração. O preço final pode variar conforme peso e peças.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'payment') {
    return (
      <SafeAreaView style={styles.safe}>
        <ExpoStatusBar style="dark" />
        <Header title="Pagamento" onBack={() => setScreen('schedule')} />
        <ScrollView contentContainerStyle={styles.formPage}>
          <View style={styles.stepProgress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /></View>
          <Text style={styles.pageHeadline}>Quase tudo pronto!</Text>
          <Text style={styles.pageSub}>Confira os detalhes e escolha como pagar.</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderCardTop}><View style={styles.orderIcon}><Ionicons name="shirt-outline" size={23} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={styles.orderTitle}>{service}</Text><Text style={styles.orderSub}>Coleta: {date} · {time}</Text></View><TouchableOpacity onPress={() => setScreen('schedule')}><Text style={styles.linkText}>Editar</Text></TouchableOpacity></View>
            <View style={styles.cardDivider} />
            <View style={styles.addressLine}><Ionicons name="location-outline" size={18} color={C.muted} /><Text style={styles.addressText}>{address}</Text></View>
            {instructions ? <Text style={styles.instructionText}>Instruções: {instructions}</Text> : null}
          </View>
          <Text style={styles.formSectionTitle}>Forma de pagamento</Text>
          {([{ name: 'Pix' as PaymentMethod, icon: 'qr-code-outline' as const, detail: 'Pague na confirmação do pedido' }, { name: 'Cartão de crédito' as PaymentMethod, icon: 'card-outline' as const, detail: 'Crédito ou débito' }, { name: 'Pagar na entrega' as PaymentMethod, icon: 'wallet-outline' as const, detail: 'Confirme com o entregador' }]).map(p => (
            <TouchableOpacity key={p.name} onPress={() => setPayment(p.name)} style={[styles.paymentOption, payment === p.name && styles.optionCardSelected]}>
              <Ionicons name={p.icon} size={23} color={C.blue} />
              <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{p.name}</Text><Text style={styles.optionDetail}>{p.detail}</Text></View>
              <View style={[styles.optionRadio, payment === p.name && styles.optionRadioSelected]}>{payment === p.name ? <View style={styles.radioDot} /> : null}</View>
            </TouchableOpacity>
          ))}
          <View style={styles.priceBreakdown}>
            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Serviço · {service}</Text><Text style={styles.breakdownValue}>{money(selectedService.price)}</Text></View>
            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Coleta e entrega</Text><Text style={styles.breakdownValue}>{money(8.90)}</Text></View>
            <View style={styles.cardDivider} />
            <View style={styles.breakdownRow}><Text style={styles.totalLabel}>Total estimado</Text><Text style={styles.totalValue}>{money(total)}</Text></View>
          </View>
          <PrimaryButton title="Confirmar pedido" onPress={confirmOrder} icon="checkmark-circle-outline" />
          <Text style={styles.smallDisclaimer}>Demonstração: nenhum pagamento real será cobrado nesta versão.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.confirmPage}>
        <View style={styles.successCircle}><Ionicons name="checkmark" size={48} color="#fff" /></View>
        <Text style={styles.confirmTitle}>Pedido agendado!</Text>
        <Text style={styles.confirmSub}>Pode deixar com a gente. Vamos avisar você quando o entregador estiver a caminho.</Text>
        <View style={styles.confirmNumber}><Text style={styles.confirmNumberLabel}>NÚMERO DO PEDIDO</Text><Text style={styles.confirmNumberValue}>{orderNumber}</Text></View>
        <View style={styles.confirmDetails}>
          <View style={styles.confirmRow}><Ionicons name="calendar-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Coleta</Text><Text style={styles.confirmDetailValue}>{date} · {time}</Text></View></View>
          <View style={styles.confirmRow}><Ionicons name="location-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Endereço</Text><Text style={styles.confirmDetailValue}>{address}</Text></View></View>
          <View style={styles.confirmRow}><Ionicons name="card-outline" size={20} color={C.blue} /><View style={{ flex: 1 }}><Text style={styles.confirmDetailLabel}>Pagamento</Text><Text style={styles.confirmDetailValue}>{payment} · {money(total)}</Text></View></View>
        </View>
        <View style={styles.statusNotice}><Ionicons name="notifications-outline" size={21} color={C.green} /><Text style={styles.statusNoticeText}>Este é um pedido de demonstração. Rastreamento e notificações serão conectados ao backend.</Text></View>
        <PrimaryButton title="Voltar para o início" onPress={resetOrder} icon="home-outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  authScroll: { paddingBottom: 28 },
  authHero: { paddingHorizontal: 26, paddingTop: 22, paddingBottom: 24, backgroundColor: C.bg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 25, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  heroIllustration: { alignSelf: 'center', marginTop: 28, marginBottom: 24, width: 132, height: 132, borderRadius: 44, backgroundColor: '#E1EEFF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  bubbleOne: { position: 'absolute', top: 12, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: C.mint },
  bubbleTwo: { position: 'absolute', bottom: 16, left: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: '#8AB8FF' },
  heroCheck: { position: 'absolute', bottom: 9, right: 9, width: 31, height: 31, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.bg },
  authTitle: { fontSize: 34, lineHeight: 39, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  authSubtitle: { color: C.muted, fontSize: 15, marginTop: 9, lineHeight: 22 },
  authCard: { marginHorizontal: 16, padding: 22, backgroundColor: C.white, borderRadius: 26, borderWidth: 1, borderColor: '#EDF2F7' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.navy },
  cardSubtitle: { fontSize: 14, color: C.muted, marginTop: 6, marginBottom: 20, lineHeight: 20 },
  fieldWrap: { marginBottom: 15 },
  fieldLabel: { fontSize: 13, color: C.text, fontWeight: '700', marginBottom: 8 },
  inputShell: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: '#FBFDFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: C.navy, fontSize: 15, paddingVertical: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18 },
  linkText: { color: C.blue, fontSize: 13, fontWeight: '800' },
  primaryButton: { backgroundColor: C.blue, borderRadius: 15, minHeight: 54, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: C.blue, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  authFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  mutedText: { color: C.muted, fontSize: 13 },
  demoLink: { alignSelf: 'center', paddingTop: 19 },
  demoText: { color: C.muted, fontSize: 12, textDecorationLine: 'underline' },
  pageHeader: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: C.bg },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line },
  pageTitle: { fontSize: 17, color: C.navy, fontWeight: '800' },
  formPage: { padding: 22, paddingBottom: 38 },
  registerIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  pageHeadline: { fontSize: 27, fontWeight: '900', color: C.navy, letterSpacing: -0.7, lineHeight: 33 },
  pageSub: { fontSize: 14, color: C.muted, lineHeight: 21, marginTop: 7, marginBottom: 24 },
  terms: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 0, marginBottom: 18 },
  homeScroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  greeting: { fontSize: 23, color: C.navy, fontWeight: '900', marginTop: 18, letterSpacing: -0.5 },
  greetingSub: { fontSize: 13, color: C.muted, marginTop: 4 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  promoCard: { backgroundColor: C.navy, borderRadius: 25, padding: 20, minHeight: 220, flexDirection: 'row', overflow: 'hidden' },
  promoPill: { alignSelf: 'flex-start', backgroundColor: '#254563', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 7, marginBottom: 12 },
  promoPillText: { color: C.mint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  promoTitle: { color: '#fff', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.5 },
  promoBody: { color: '#C4D2E0', fontSize: 12, marginTop: 8, marginBottom: 16 },
  promoButton: { alignSelf: 'flex-start', backgroundColor: C.mint, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoButtonText: { color: C.navy, fontWeight: '800', fontSize: 12 },
  promoArt: { width: 82, height: 100, alignSelf: 'center', borderRadius: 26, backgroundColor: '#1D4C77', alignItems: 'center', justifyContent: 'center', marginLeft: 4, transform: [{ rotate: '8deg' }] },
  promoSpark: { position: 'absolute', top: -9, right: -7, backgroundColor: C.mint, width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { marginTop: 27, marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: C.navy, letterSpacing: -0.3 },
  sectionCaption: { fontSize: 12, color: C.muted, marginTop: 4 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 19, borderWidth: 1, borderColor: '#EAF0F6', padding: 14, marginBottom: 10, gap: 12 },
  serviceIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  serviceName: { color: C.navy, fontSize: 14, fontWeight: '800' },
  serviceDetail: { color: C.muted, fontSize: 11, marginTop: 4 },
  servicePrice: { color: C.blue, fontSize: 12, fontWeight: '800', marginTop: 7 },
  stepsRow: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.line, paddingVertical: 18, paddingHorizontal: 8 },
  stepItem: { flex: 1, alignItems: 'center' },
  stepIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepTitle: { color: C.navy, fontSize: 12, fontWeight: '800' },
  stepBody: { color: C.muted, fontSize: 10, marginTop: 4 },
  bottomNav: { marginTop: 22, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', gap: 5, minWidth: 60 },
  navActive: { color: C.blue, fontSize: 10, fontWeight: '800' },
  navText: { color: C.muted, fontSize: 10, fontWeight: '600' },
  stepProgress: { flexDirection: 'row', gap: 6, marginBottom: 23 },
  progressActive: { height: 4, flex: 1, borderRadius: 3, backgroundColor: C.blue },
  progressInactive: { height: 4, flex: 1, borderRadius: 3, backgroundColor: '#DCE6F0' },
  formSectionTitle: { fontSize: 15, color: C.navy, fontWeight: '900', marginTop: 18, marginBottom: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: C.line, borderRadius: 16, backgroundColor: C.white, padding: 14, marginBottom: 9 },
  optionCardSelected: { borderColor: C.blue, backgroundColor: '#F3F8FF' },
  optionRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#B9C6D4', alignItems: 'center', justifyContent: 'center' },
  optionRadioSelected: { borderColor: C.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.blue },
  optionTitle: { color: C.navy, fontSize: 13, fontWeight: '800' },
  optionDetail: { color: C.muted, fontSize: 11, marginTop: 4 },
  optionPrice: { color: C.navy, fontSize: 12, fontWeight: '800' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 11, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white },
  timeChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white },
  chipSelected: { borderColor: C.blue, backgroundColor: C.paleBlue },
  chipText: { color: C.text, fontSize: 11, fontWeight: '700' },
  chipTextSelected: { color: C.blue },
  priceSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, marginTop: 23, marginBottom: 16 },
  summaryLabel: { color: C.muted, fontSize: 11 },
  summaryValue: { color: C.navy, fontSize: 13, fontWeight: '800', marginTop: 4 },
  summaryPrice: { color: C.navy, fontSize: 17, fontWeight: '900' },
  smallDisclaimer: { color: C.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 12 },
  orderCard: { backgroundColor: C.white, borderRadius: 19, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 8 },
  orderCardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  orderIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  orderTitle: { color: C.navy, fontSize: 14, fontWeight: '900' },
  orderSub: { color: C.muted, fontSize: 11, marginTop: 5 },
  cardDivider: { height: 1, backgroundColor: C.line, marginVertical: 14 },
  addressLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  addressText: { flex: 1, color: C.text, fontSize: 12, lineHeight: 18 },
  instructionText: { color: C.muted, fontSize: 11, marginTop: 9, lineHeight: 16 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 15, marginBottom: 9 },
  priceBreakdown: { marginTop: 17, marginBottom: 20, backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6, gap: 12 },
  breakdownLabel: { color: C.muted, fontSize: 12, flex: 1 },
  breakdownValue: { color: C.text, fontSize: 12, fontWeight: '700' },
  totalLabel: { color: C.navy, fontSize: 14, fontWeight: '900' },
  totalValue: { color: C.blue, fontSize: 19, fontWeight: '900' },
  confirmPage: { padding: 24, paddingTop: 48, paddingBottom: 42, alignItems: 'stretch' },
  successCircle: { alignSelf: 'center', width: 94, height: 94, borderRadius: 32, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  confirmTitle: { textAlign: 'center', color: C.navy, fontSize: 29, fontWeight: '900', letterSpacing: -0.6 },
  confirmSub: { textAlign: 'center', color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 10, marginBottom: 24, paddingHorizontal: 8 },
  confirmNumber: { backgroundColor: C.white, borderRadius: 17, borderWidth: 1, borderColor: C.line, alignItems: 'center', padding: 17, marginBottom: 15 },
  confirmNumberLabel: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  confirmNumberValue: { color: C.blue, fontSize: 24, fontWeight: '900', marginTop: 6, letterSpacing: 1 },
  confirmDetails: { backgroundColor: C.white, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 17, gap: 19 },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  confirmDetailLabel: { color: C.muted, fontSize: 11 },
  confirmDetailValue: { color: C.navy, fontSize: 13, fontWeight: '800', marginTop: 4, lineHeight: 18 },
  statusNotice: { marginVertical: 18, backgroundColor: '#E8F8F2', borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  statusNoticeText: { color: '#286C5A', flex: 1, fontSize: 11, lineHeight: 17 },
});
