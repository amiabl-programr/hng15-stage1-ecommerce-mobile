import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { api, clearSessionToken, getSessionToken, setSessionToken } from '../lib/api/client';
import { getMe, logout as apiLogout } from '../lib/api/endpoints';
import { config } from '../config/env';
import type { Profile } from '../types/api';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  restoreSession: () => Promise<Profile | null>;
  loginWithGoogle: () => Promise<Profile | null>;
  logout: () => Promise<void>;
  setUser: (user: Profile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  restoreSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await getSessionToken();
      if (!token) {
        set({ user: null, isLoading: false, isInitialized: true });
        return null;
      }

      const res = await getMe();
      if (res && res.user) {
        set({ user: res.user, isLoading: false, isInitialized: true });
        return res.user;
      }

      await clearSessionToken();
      set({ user: null, isLoading: false, isInitialized: true });
      return null;
    } catch {
      await clearSessionToken();
      set({ user: null, isLoading: false, isInitialized: true });
      return null;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectUri = Linking.createURL('auth-callback');
      const baseUrl = config.apiBaseUrl.replace(/\/+$/, '');
      const authUrl = `${baseUrl}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}&next=${encodeURIComponent('/account')}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const error = parsed.queryParams?.error as string | undefined;
        if (error) {
          throw new Error(error);
        }
        const token = parsed.queryParams?.token as string | undefined;
        if (token) {
          await setSessionToken(token);
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        set({ isLoading: false });
        return null;
      }

      // Validate session with server
      try {
        const meRes = await getMe();
        if (meRes?.user) {
          set({ user: meRes.user, isLoading: false, isInitialized: true });
          return meRes.user;
        }
      } catch {
        // Continue to check stored token below
      }

      const savedToken = await getSessionToken();
      if (savedToken) {
        const fallbackProfile: Profile = {
          id: 'user-session',
          googleId: null,
          email: '',
          fullName: 'Customer',
          avatarUrl: null,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        set({ user: fallbackProfile, isLoading: false, isInitialized: true });
        return fallbackProfile;
      }

      set({ isLoading: false, isInitialized: true });
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      await clearSessionToken();
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user, isInitialized: true }),
}));

export function useAuth() {
  const { user, isLoading, isInitialized, error, restoreSession, loginWithGoogle, logout } =
    useAuthStore();

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    error,
    restoreSession,
    loginWithGoogle,
    logout,
  };
}
