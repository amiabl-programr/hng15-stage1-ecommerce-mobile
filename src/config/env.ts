import Constants from 'expo-constants';

/**
 * App-wide configuration resolved from Expo Constants / environment.
 */

const extra = Constants.expirationDate ? {} : (Constants.expoConfig?.extra ?? {});

export const config = {
  /**
   * Base URL for the ecommerce backend API.
   */
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (extra as Record<string, string>).apiBaseUrl ||
    'https://hng15-stage1-ecommerce-be-2.onrender.com',

  /** Session cookie name — must match the backend */
  sessionCookieName: 'roofing_session',

  /** Session TTL in days — matches backend config */
  sessionTtlDays: 7,
} as const;
