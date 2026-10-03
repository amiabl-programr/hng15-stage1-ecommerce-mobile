import Constants from 'expo-constants';

/**
 * App-wide configuration resolved from Expo Constants / environment.
 */

const extra = Constants.expirationDate ? {} : (Constants.expoConfig?.extra ?? {});

export const config = {
  /**
   * Base URL for the ecommerce backend API.
   * In dev: http://<your-local-ip>:4000
   * In prod: your deployed backend URL
   */
  apiBaseUrl: (extra as Record<string, string>).apiBaseUrl ?? 'http://localhost:4000',

  /** Session cookie name — must match the backend */
  sessionCookieName: 'roofing_session',

  /** Session TTL in days — matches backend config */
  sessionTtlDays: 7,
} as const;
