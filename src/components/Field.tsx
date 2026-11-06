import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

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
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  icon,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = Boolean(secureTextEntry);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputShell}>
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={C.muted}
            style={{ marginRight: 10 }}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A6B3C1"
          secureTextEntry={isPasswordField && !showPassword}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={
            keyboardType === 'email-address' ? 'none' : 'sentences'
          }
          style={[styles.input, { flex: 1 }]}
        />

        {isPasswordField ? (
          <TouchableOpacity
            onPress={() => setShowPassword((previous) => !previous)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Ocultar senha' : 'Mostrar senha'
            }
            style={{ padding: 5, marginLeft: 5 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color={C.muted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}