import { config } from '../../config/env';
import { api } from './client';
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
  return api.get<CategoryListResponse>('/api/categories');
}

export async function getProducts(
  query: ProductListQuery = {},
): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit) params.set('limit', String(query.limit));

  const qs = params.toString();
  return api.get<ProductListResponse>(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function getFeaturedProducts(): Promise<FeaturedListResponse> {
  return api.get<FeaturedListResponse>('/api/products/featured');
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductBySlugResponse> {
  return api.get<ProductBySlugResponse>(`/api/products/${slug}`);
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
