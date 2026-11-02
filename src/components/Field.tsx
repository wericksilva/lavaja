import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { styles } from '../styles/globalStyles';
import type { IconName } from '../types';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  icon?: IconName;
};

export default function Field({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, icon,
}: Props) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        {icon ? <Ionicons name={icon} size={19} color={C.muted} style={{ marginRight: 10 }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A6B3C1"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          style={styles.input}
        />
      </View>
    </View>
  );
}
