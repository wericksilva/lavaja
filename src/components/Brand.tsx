import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { styles } from '../styles/globalStyles';

export default function Brand() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandIcon}>
        <Ionicons name="water" size={23} color="#fff" />
      </View>
      <Text style={styles.brandText}>lava<Text style={{ color: C.blue }}>já</Text></Text>
    </View>
  );
}
