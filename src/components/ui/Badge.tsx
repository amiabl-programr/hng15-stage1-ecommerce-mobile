import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/use-theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'secondary';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const theme = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'accent':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'success':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'secondary':
        return { bg: theme.backgroundElement, text: theme.textSecondary };
      case 'primary':
      default:
        return { bg: '#eff6ff', text: '#2563eb' };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
