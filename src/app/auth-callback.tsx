import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../hooks/use-theme';
import { setSessionToken } from '../lib/api/client';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';

/**
 * Handles incoming deep link callbacks (roofingshop://auth-callback?token=...)
 * from OAuth redirects to prevent Expo Router from rendering an "Unmatched Route" screen.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ token?: string; error?: string; returnTo?: string }>();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      if (params.token) {
        await setSessionToken(params.token);
        await Promise.all([
          useAuthStore.getState().restoreSession().catch(() => null),
          useCartStore.getState().syncFromServer().catch(() => null),
        ]);
      }

      if (!isMounted) return;

      const destination = params.returnTo || '/checkout';
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(destination as any);
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [params.token, params.returnTo, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
