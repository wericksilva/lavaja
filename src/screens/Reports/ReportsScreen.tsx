import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';
import Header from '../../components/Header';
import type { LaundryOrder } from '../../types/order';
import { money } from '../../utils/money';
type Props = { orders: LaundryOrder[]; onBack: () => void };
export default function ReportsScreen({ orders, onBack }: Props) {
  const report = useMemo(() => {
    const valid = orders.filter((o) => o.currentStep !== -1);
    const delivered = valid.filter((o) => o.currentStep === 5);
    const cancelled = valid.filter((o) => (o as LaundryOrder & { status?: string }).status === 'cancelled');
    const active = valid.filter((o) => o.currentStep < 5 && (o as LaundryOrder & { status?: string }).status !== 'cancelled');
    const revenue = delivered.reduce((sum, o) => sum + Number(o.value || 0), 0);
    const total = valid.reduce((sum, o) => sum + Number(o.value || 0), 0);
    const byService = new Map<string, number>();
    valid.forEach((o) => byService.set(o.service, (byService.get(o.service) ?? 0) + 1));
    return { total: valid.length, delivered: delivered.length, active: active.length, cancelled: cancelled.length, revenue, average: delivered.length ? revenue / delivered.length : 0, byService: [...byService.entries()].sort((a,b) => b[1]-a[1]).slice(0,5) };
  }, [orders]);
  const Metric = ({ title, value, icon }: {title:string;value:string;icon:keyof typeof Ionicons.glyphMap}) => <View style={styles.metric}><View style={styles.metricIcon}><Ionicons name={icon} size={21} color={C.blue}/></View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{title}</Text></View>;
  return <SafeAreaView style={styles.safe}><StatusBar style="dark"/><Header title="Relatórios da loja" onBack={onBack}/><ScrollView contentContainerStyle={styles.content}><Text style={styles.heading}>Desempenho da lavanderia</Text><Text style={styles.subtitle}>Indicadores calculados a partir dos pedidos carregados para esta loja.</Text>
    <View style={styles.grid}><Metric title="Pedidos recebidos" value={String(report.total)} icon="receipt-outline"/><Metric title="Em andamento" value={String(report.active)} icon="sync-outline"/><Metric title="Entregues" value={String(report.delivered)} icon="checkmark-circle-outline"/><Metric title="Cancelados" value={String(report.cancelled)} icon="close-circle-outline"/></View>
    <View style={styles.revenue}><Text style={styles.revenueLabel}>Faturamento de pedidos entregues</Text><Text style={styles.revenueValue}>{money(report.revenue)}</Text><Text style={styles.average}>Ticket médio: {money(report.average)}</Text></View>
    <Text style={styles.section}>Serviços mais solicitados</Text>{report.byService.length ? report.byService.map(([name,count])=><View key={name} style={styles.serviceRow}><Text style={styles.serviceName}>{name}</Text><Text style={styles.serviceCount}>{count} pedido(s)</Text></View>) : <Text style={styles.empty}>Ainda não há dados suficientes para gerar o ranking.</Text>}
    <Text style={styles.note}>Os valores representam o total dos pedidos entregues, não necessariamente o valor líquido recebido. Taxas do provedor, estornos e conciliação bancária devem ser considerados no fechamento financeiro.</Text>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},content:{padding:20,paddingBottom:40},heading:{fontSize:23,fontWeight:'800',color:C.navy,marginTop:8},subtitle:{fontSize:12,lineHeight:18,color:C.muted,marginTop:6,marginBottom:18},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},metric:{width:'48%',flexGrow:1,backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:15,padding:14},metricIcon:{width:38,height:38,borderRadius:12,backgroundColor:C.paleBlue,alignItems:'center',justifyContent:'center',marginBottom:10},metricValue:{fontSize:23,fontWeight:'900',color:C.navy},metricLabel:{fontSize:11,color:C.muted,marginTop:4},revenue:{backgroundColor:C.navy,borderRadius:17,padding:18,marginTop:16},revenueLabel:{fontSize:12,color:'#D5E5F5'},revenueValue:{fontSize:29,fontWeight:'900',color:C.white,marginTop:7},average:{fontSize:11,color:'#D5E5F5',marginTop:5},section:{fontSize:16,fontWeight:'800',color:C.navy,marginTop:24,marginBottom:10},serviceRow:{flexDirection:'row',justifyContent:'space-between',backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:12,padding:14,marginBottom:8},serviceName:{fontSize:13,color:C.navy,fontWeight:'700'},serviceCount:{fontSize:12,color:C.blue,fontWeight:'800'},empty:{fontSize:12,color:C.muted,marginTop:10},note:{fontSize:10,lineHeight:16,color:C.muted,marginTop:22}});
