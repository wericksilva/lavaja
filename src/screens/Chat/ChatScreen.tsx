import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/theme';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';

type Message = { id: string; sender_id: string; message: string; created_at: string };
type Props = { orderId: string; userId: string; onBack: () => void };
export default function ChatScreen({ orderId, userId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const loadMessages = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('order_messages').select('id,sender_id,message,created_at').eq('order_id', orderId).order('created_at', { ascending: true });
    if (queryError) setError(queryError.message);
    else { setMessages((data ?? []) as Message[]); setError(''); }
    setLoading(false);
  }, [orderId]);
  useEffect(() => {
    void loadMessages();
    const channel = supabase.channel(`order-chat-${orderId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` }, () => { void loadMessages(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [orderId, loadMessages]);
  const send = async () => {
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    const { error: insertError } = await supabase.from('order_messages').insert({ order_id: orderId, sender_id: userId, message });
    if (insertError) setError(insertError.message);
    else { setDraft(''); await loadMessages(); }
    setSending(false);
  };
  return <SafeAreaView style={styles.safe}><StatusBar style="dark"/><Header title="Chat do pedido" onBack={onBack}/>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.orderTag}><Ionicons name="chatbubbles-outline" size={18} color={C.blue}/><Text style={styles.orderTagText}>Conversa privada deste pedido</Text></View>
      {loading ? <ActivityIndicator color={C.blue} style={{ marginTop: 30 }}/> : <ScrollView contentContainerStyle={styles.list}>
        {messages.length === 0 && <Text style={styles.empty}>Ainda não há mensagens. Envie uma mensagem para iniciar a conversa com a lavanderia.</Text>}
        {messages.map((item) => { const mine = item.sender_id === userId; return <View key={item.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}><Text style={[styles.message, mine && styles.mineText]}>{item.message}</Text><Text style={[styles.time, mine && styles.mineTime]}>{new Date(item.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text></View>; })}
      </ScrollView>}
      {!!error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} placeholder="Digite sua mensagem..." placeholderTextColor={C.muted} style={styles.input} multiline maxLength={2000}/><TouchableOpacity onPress={send} disabled={sending || !draft.trim()} style={[styles.send, (sending || !draft.trim()) && styles.disabled]}><Ionicons name="send" size={19} color={C.white}/></TouchableOpacity></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:C.bg}, flex:{flex:1}, orderTag:{flexDirection:'row',alignItems:'center',gap:8,padding:13,backgroundColor:C.white,borderBottomWidth:1,borderColor:C.line},orderTagText:{color:C.muted,fontSize:12,fontWeight:'600'},list:{padding:16,gap:10,flexGrow:1},empty:{color:C.muted,textAlign:'center',marginTop:40,lineHeight:21},bubble:{maxWidth:'85%',padding:12,borderRadius:15},mine:{alignSelf:'flex-end',backgroundColor:C.blue,borderBottomRightRadius:4},theirs:{alignSelf:'flex-start',backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderBottomLeftRadius:4},message:{color:C.navy,fontSize:14,lineHeight:20},mineText:{color:C.white},time:{fontSize:9,color:C.muted,marginTop:6,textAlign:'right'},mineTime:{color:'#DDEBFF'},composer:{flexDirection:'row',alignItems:'flex-end',gap:8,padding:12,backgroundColor:C.white,borderTopWidth:1,borderColor:C.line},input:{flex:1,minHeight:44,maxHeight:110,borderWidth:1,borderColor:C.line,borderRadius:14,paddingHorizontal:13,paddingVertical:10,color:C.navy},send:{width:44,height:44,borderRadius:14,backgroundColor:C.blue,alignItems:'center',justifyContent:'center'},disabled:{opacity:0.45},error:{color:'#B42318',fontSize:11,paddingHorizontal:14,paddingBottom:8}});
