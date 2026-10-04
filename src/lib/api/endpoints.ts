import { config } from '../../config/env';
import { api } from './client';
import {
  getSeedCategoriesResponse,
  getSeedFeaturedResponse,
  getSeedProductBySlug,
  getSeedProductsResponse,
} from './seedData';
import type {
  AccountOverviewResponse,
  AddToCartRequest,
  CartResponse,
  CategoryListResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  FeaturedListResponse,
  MeResponse,
  Order,
  OrderListResponse,
  ProductBySlugResponse,
  ProductListQuery,
  ProductListResponse,
  ServerCartItem,
  SessionListResponse,
  UpdateCartItemRequest,
} from '../../types/api';

// ── Catalog ───────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryListResponse> {
  try {
    const res = await api.get<CategoryListResponse>('/api/categories');
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return res;
    }
    return getSeedCategoriesResponse();
  } catch {
    return getSeedCategoriesResponse();
  }
}

export async function getProducts(
  query: ProductListQuery = {},
): Promise<ProductListResponse> {
  try {
    const params = new URLSearchParams();
    if (query.category) params.set('category', query.category);
    if (query.cursor) params.set('cursor', query.cursor);
    if (query.limit) params.set('limit', String(query.limit));

    const qs = params.toString();
    const res = await api.get<ProductListResponse>(`/api/products${qs ? `?${qs}` : ''}`);
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return res;
    }
    return getSeedProductsResponse(query.category);
  } catch {
    return getSeedProductsResponse(query.category);
  }
}

export async function getFeaturedProducts(): Promise<FeaturedListResponse> {
  try {
    const res = await api.get<FeaturedListResponse>('/api/products/featured');
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return res;
    }
    return getSeedFeaturedResponse();
  } catch {
    return getSeedFeaturedResponse();
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductBySlugResponse> {
  try {
    const res = await api.get<ProductBySlugResponse>(`/api/products/${slug}`);
    if (res && res.product) {
      return res;
    }
    return getSeedProductBySlug(slug);
  } catch {
    return getSeedProductBySlug(slug);
  }
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartResponse> {
  return api.get<CartResponse>('/api/cart');
}

export async function addToCart(
  data: AddToCartRequest,
): Promise<CartResponse> {
  return api.post<CartResponse>('/api/cart', data);
}

export async function updateCartItem(
  itemId: string,
  data: UpdateCartItemRequest,
): Promise<CartResponse> {
  return api.patch<CartResponse>(`/api/cart/${itemId}`, data);
}

export async function removeCartItem(
  itemId: string,
): Promise<CartResponse> {
  return api.delete<CartResponse>(`/api/cart/${itemId}`);
}

export async function clearCart(): Promise<{ success: true }> {
  return api.delete<{ success: true }>('/api/cart');
}

// ── Checkout & Orders ──────────────────────────────────────────────────────────

export async function createOrder(
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/api/orders', data);
}

export async function getMyOrders(params?: {
  cursor?: string;
  limit?: number;
}): Promise<OrderListResponse> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return api.get<OrderListResponse>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export async function getOrderById(
  id: string,
): Promise<{ success: true; order: Order }> {
  return api.get<{ success: true; order: Order }>(`/api/orders/${id}`);
}

// ── Auth & Account ─────────────────────────────────────────────────────────────

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me');
}

export async function logout(): Promise<{ success: true }> {
  return api.post<{ success: true }>('/api/auth/logout');
}

export function getGoogleAuthUrl(next = '/account'): string {
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, '');
  return `${baseUrl}/api/auth/google?next=${encodeURIComponent(next)}`;
}

export async function getAccountOverview(): Promise<AccountOverviewResponse> {
  return api.get<AccountOverviewResponse>('/api/account/overview');
}

export async function getSessions(): Promise<SessionListResponse> {
  return api.get<SessionListResponse>('/api/account/sessions');
}

export async function revokeSession(
  id: string,
): Promise<{ success: true }> {
  return api.delete<{ success: true }>(`/api/account/sessions/${id}`);
}
