import * as SecureStore from 'expo-secure-store';

import { config } from '../../config/env';
import type { ErrorCode, ErrorEnvelope, FieldIssue } from '../../types/api';

// ── Error class ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  public readonly fields: FieldIssue[];

  constructor(
    status: number,
    message: string,
    code: ErrorCode | 'NETWORK_ERROR' | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR',
    fields: FieldIssue[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// ── Session token management ───────────────────────────────────────────────────

const SESSION_TOKEN_KEY = 'session_token';

export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

// ── Request wrapper ────────────────────────────────────────────────────────────

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers || {});

  // Attach session cookie from secure store
  const sessionToken = await getSessionToken();
  if (sessionToken) {
    headers.set('Cookie', `${config.sessionCookieName}=${sessionToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Extract and persist session cookie from Set-Cookie header if present
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(
        new RegExp(`${config.sessionCookieName}=([^;]+)`),
      );
      if (match?.[1]) {
        await setSessionToken(match[1]);
      }
    }

    if (!response.ok) {
      let errorBody: ErrorEnvelope | null = null;
      try {
        errorBody = await response.json();
      } catch {
        // Fallback for non-JSON error responses
      }

      if (errorBody?.error) {
        throw new ApiError(
          response.status,
          errorBody.error.message || `Request failed with status ${response.status}`,
          errorBody.error.code,
          errorBody.error.fields || [],
        );
      }

      throw new ApiError(
        response.status,
        `Request failed with status ${response.status}`,
        'UNKNOWN_ERROR',
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      0,
      err instanceof Error ? err.message : 'Network error occurred',
      'NETWORK_ERROR',
    );
  }
}

// ── Convenience methods ────────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  patch: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  put: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};
