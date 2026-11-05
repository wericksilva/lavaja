import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { C } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type AppNotification = { id: string; order_id: string; title: string; body: string; is_read: boolean; created_at: string };
type Props = { userId: string; onBack: () => void; onOpenOrder: (orderId: string) => void; onUnreadCountChange: (count: number) => void };

export default function NotificationsScreen({ userId, onBack, onOpenOrder, onUnreadCountChange }: Props) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!userId) return;
    const { data, error: queryError } = await supabase.from('app_notifications').select('id,order_id,title,body,is_read,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
    if (queryError) setError(queryError.message);
    else {
      const rows = (data ?? []) as AppNotification[];
      setItems(rows);
      onUnreadCountChange(rows.filter((item) => !item.is_read).length);
      setError('');
    }
    setLoading(false);
  }, [userId, onUnreadCountChange]);
  useEffect(() => {
    void load();
    const channel = supabase.channel(`notification-list-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications', filter: `user_id=eq.${userId}` }, () => { void load(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load, userId]);
  const open = async (item: AppNotification) => {
    if (!item.is_read) {
      const { error: updateError } = await supabase.from('app_notifications').update({ is_read: true }).eq('id', item.id).eq('user_id', userId);
      if (!updateError) {
        setItems((current) => current.map((row) => row.id === item.id ? { ...row, is_read: true } : row));
        onUnreadCountChange(Math.max(0, items.filter((row) => !row.is_read).length - 1));
      }
    }
    onOpenOrder(item.order_id);
  };
  const markAllRead = async () => {
    const { error: updateError } = await supabase.from('app_notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (!updateError) { setItems((current) => current.map((row) => ({ ...row, is_read: true }))); onUnreadCountChange(0); }
    else setError(updateError.message);
  };
  return <SafeAreaView style={styles.safe}><StatusBar style="dark"/><Header title="Notificações" onBack={onBack}/><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.headingRow}><View><Text style={styles.heading}>Atualizações</Text><Text style={styles.subtitle}>Acompanhe tudo que acontece com seus pedidos.</Text></View>{items.some((item) => !item.is_read) && <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Marcar todas como lidas</Text></TouchableOpacity>}</View>
    {loading ? <ActivityIndicator color={C.blue} style={{ marginTop: 36 }}/> : error ? <Text style={styles.error}>{error}</Text> : items.length === 0 ? <View style={styles.empty}><Ionicons name="notifications-off-outline" size={42} color={C.muted}/><Text style={styles.emptyTitle}>Nenhuma notificação</Text><Text style={styles.emptyText}>Quando houver uma atualização, ela aparecerá aqui.</Text></View> : items.map((item) => <TouchableOpacity key={item.id} style={[styles.card, !item.is_read && styles.unread]} onPress={() => void open(item)} activeOpacity={0.8}><View style={styles.icon}><Ionicons name="receipt-outline" size={21} color={C.blue}/></View><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text><Text style={styles.date}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text></View><Ionicons name="chevron-forward" size={20} color={C.muted}/></TouchableOpacity>)}
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},content:{padding:18,paddingBottom:36},headingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:16},heading:{fontSize:23,fontWeight:'900',color:C.navy},subtitle:{fontSize:12,color:C.muted,marginTop:5},markAll:{fontSize:11,fontWeight:'800',color:C.blue},card:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:15,padding:14,marginBottom:10},unread:{borderColor:C.blue,backgroundColor:'#F2F8FC'},icon:{width:42,height:42,borderRadius:13,backgroundColor:C.paleBlue,alignItems:'center',justifyContent:'center'},copy:{flex:1},title:{fontSize:13,fontWeight:'800',color:C.navy},body:{fontSize:12,lineHeight:17,color:C.muted,marginTop:4},date:{fontSize:10,color:C.muted,marginTop:7},empty:{alignItems:'center',padding:30,backgroundColor:C.white,borderRadius:16,marginTop:16},emptyTitle:{fontSize:15,fontWeight:'800',color:C.navy,marginTop:12},emptyText:{fontSize:12,color:C.muted,textAlign:'center',marginTop:6},error:{color:'#B42318',fontSize:12}});
