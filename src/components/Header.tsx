import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { styles } from '../styles/globalStyles';

type Props = { title: string; onBack: () => void };

export default function Header({ title, onBack }: Props) {
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
