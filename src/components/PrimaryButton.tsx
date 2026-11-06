import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/globalStyles';
import type { IconName } from '../types';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={[
        styles.primaryButton,
        isDisabled && { opacity: 0.65 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Text style={styles.primaryButtonText}>{title}</Text>

          {icon ? (
            <Ionicons name={icon} size={19} color="#FFFFFF" />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}