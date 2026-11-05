
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../constants/theme';
import { styles } from '../styles/globalStyles';

type Props = {
  onPress?: () => void;
};

export default function Brand({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="Voltar para a tela inicial do LavaJá"
    >
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <Ionicons name="water" size={23} color="#fff" />
        </View>

        <Text style={styles.brandText}>
          lava<Text style={{ color: C.blue }}>já</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}
