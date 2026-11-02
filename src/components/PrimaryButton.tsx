import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/globalStyles';
import type { IconName } from '../types';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
};

export default function PrimaryButton({ title, onPress, disabled = false, icon }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled && { opacity: 0.45 }]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
      {icon ? <Ionicons name={icon} size={19} color="#fff" /> : null}
    </TouchableOpacity>
  );
}
