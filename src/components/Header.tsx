
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../constants/theme';
import { styles } from '../styles/globalStyles';
import Brand from './Brand';

type Props = {
  title: string;
  onBack: () => void;
  onHome?: () => void;
};

export default function Header({
  title,
  onBack,
  onHome,
}: Props) {
  return (
    <View style={styles.pageHeader}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons name="arrow-back" size={21} color={C.navy} />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>{title}</Text>

      <View style={{ minWidth: 42, alignItems: 'flex-end' }}>
        {onHome ? (
          <Brand onPress={onHome} />
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>
    </View>
  );
}
