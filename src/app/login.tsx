import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/use-theme';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const theme = useTheme();
  const { loginWithGoogle, isLoading } = useAuth();
  const { syncFromServer } = useCart();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSuccess = async () => {
    // Immediately sync cart with backend for the newly signed in user
    await syncFromServer();

    if (params.returnTo) {
      router.replace(params.returnTo as any);
    } else {
      router.back();
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        await handleSuccess();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
              <Ionicons name="construct" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Welcome</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in with your Google account to sync your cart with the web store and track your orders.
            </Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Google OAuth Button */}
          <Button
            title="Continue with Google"
            variant="primary"
            size="lg"
            loading={submitting || isLoading}
            onPress={handleGoogleSubmit}
            icon={<Ionicons name="logo-google" size={22} color="#ffffff" />}
          />

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.success} />
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Same account logs in to website & mobile app
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
  },
});
