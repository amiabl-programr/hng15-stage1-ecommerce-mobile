import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#2563eb', // Blue 600
    primaryDark: '#1d4ed8',
    accent: '#f59e0b', // Amber 500
    text: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500
    textMuted: '#94a3b8',
    background: '#ffffff',
    backgroundElement: '#f8fafc', // Slate 50
    backgroundSelected: '#e2e8f0', // Slate 200
    border: '#e2e8f0',
    card: '#ffffff',
    success: '#10b981',
    danger: '#ef4444',
  },
  dark: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    accent: '#f59e0b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: '#090d16',
    backgroundElement: '#131c2e',
    backgroundSelected: '#1e293b',
    border: '#1e293b',
    card: '#0f172a',
    success: '#10b981',
    danger: '#ef4444',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Typography = {
  titleLarge: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  titleMedium: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  titleSmall: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 600;
