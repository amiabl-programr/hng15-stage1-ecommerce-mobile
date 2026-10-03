import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 999,
}: QuantityStepperProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onDecrement}
        disabled={quantity <= min}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name="remove"
          size={16}
          color={quantity <= min ? theme.textMuted : theme.text}
        />
      </TouchableOpacity>

      <Text style={[styles.text, { color: theme.text }]}>{quantity}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onIncrement}
        disabled={quantity >= max}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name="add"
          size={16}
          color={quantity >= max ? theme.textMuted : theme.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    paddingHorizontal: 4,
  },
  button: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    minWidth: 28,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
});
