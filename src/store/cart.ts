import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from '../lib/api/endpoints';
import { getSessionToken } from '../lib/api/client';
import type { CustomSpecs, Product, ProductType, ProductVariant, ServerCartItem, UnitType } from '../types/api';

export interface MobileCartItem {
  id: string; // server ID or composite key
  serverId?: string;
  productId: string;
  productName: string;
  slug: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  productType: ProductType;
  unitType: UnitType;
  quantity: number;
  customSpecs?: CustomSpecs;
  imageUrl?: string;
  lineTotal: number;
}

export function generateCartItemId(
  productId: string,
  variantId?: string,
  customSpecs?: CustomSpecs
): string {
  const specsKey = customSpecs
    ? `${customSpecs.lengthMetres || ''}-${customSpecs.colour || ''}-${customSpecs.finish || ''}-${customSpecs.notes || ''}`
    : '';
  return `${productId}:${variantId || ''}:${specsKey}`;
}

export function calculateLineTotal(
  unitPrice: number,
  productType: ProductType,
  quantity: number,
  customSpecs?: CustomSpecs
): number {
  if (productType === 'dimensioned' && customSpecs?.lengthMetres && customSpecs.lengthMetres > 0) {
    return Math.round(unitPrice * customSpecs.lengthMetres * quantity);
  }
  return Math.round(unitPrice * quantity);
}

function mapServerItem(si: ServerCartItem): MobileCartItem {
  return {
    id: si.id,
    serverId: si.id,
    productId: si.productId,
    productName: si.productName,
    slug: si.productSlug || si.slug || '',
    variantId: si.variantId ?? undefined,
    unitPrice: si.unitPrice,
    productType: si.productType || 'standard',
    unitType: si.unitType || 'piece',
    quantity: si.quantity,
    customSpecs: si.customSpecs ?? undefined,
    imageUrl: si.mediaUrl || si.imageUrl || undefined,
    lineTotal: si.lineTotal,
  };
}

interface CartStoreState {
  items: MobileCartItem[];
  isHydrated: boolean;
  isLoading: boolean;

  setHydrated: (state: boolean) => void;
  syncFromServer: () => Promise<void>;
  addItem: (input: {
    product: Product;
    variant?: ProductVariant | null;
    quantity: number;
    customSpecs?: CustomSpecs;
  }) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      isLoading: false,

      setHydrated: (state: boolean) => set({ isHydrated: state }),

      syncFromServer: async () => {
        try {
          const token = await getSessionToken();
          if (!token) return;

          set({ isLoading: true });

          // If the local cart has items that haven't been synced to server yet,
          // push each unsynced guest item to the server
          const currentItems = get().items;
          const unsyncedItems = currentItems.filter(
            (item) => !item.serverId && !item.productId.startsWith('b0000000-0000-4000-8000')
          );
          for (const item of unsyncedItems) {
            try {
              await apiAddToCart({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                customSpecs: item.customSpecs,
              });
            } catch {
              // Ignore failed items to avoid blocking sync
            }
          }

          const res = await apiGetCart();
          if (res && Array.isArray(res.items)) {
            if (res.items.length > 0) {
              set({ items: res.items.map(mapServerItem), isLoading: false });
            } else if (unsyncedItems.length === 0) {
              set({ items: [], isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async ({ product, variant, quantity, customSpecs }) => {
        if (quantity <= 0) return;
        if (product.id.startsWith('b0000000-0000-4000-8000')) return;

        const effectivePrice = variant?.priceOverride != null ? variant.priceOverride : product.basePrice;
        const itemId = generateCartItemId(product.id, variant?.id, customSpecs);
        const primaryMedia = product.media.find((m) => m.isPrimary) || product.media[0];

        // Optimistic local update
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === itemId || item.serverId === itemId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQty = existing.quantity + quantity;
            const newLineTotal = calculateLineTotal(
              existing.unitPrice,
              existing.productType,
              newQty,
              existing.customSpecs
            );

            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
              lineTotal: newLineTotal,
            };

            return { items: updatedItems };
          }

          const newLineTotal = calculateLineTotal(
            effectivePrice,
            product.productType,
            quantity,
            customSpecs
          );

          const newItem: MobileCartItem = {
            id: itemId,
            productId: product.id,
            productName: product.name,
            slug: product.slug,
            variantId: variant?.id,
            variantName: variant?.name,
            unitPrice: effectivePrice,
            productType: product.productType,
            unitType: product.unitType,
            quantity,
            customSpecs,
            imageUrl: primaryMedia?.url,
            lineTotal: newLineTotal,
          };

          return { items: [...state.items, newItem] };
        });

        // Server sync
        try {
          const token = await getSessionToken();
          if (token) {
            const res = await apiAddToCart({
              productId: product.id,
              variantId: variant?.id,
              quantity,
              customSpecs,
            });
            if (res && Array.isArray(res.items)) {
              set({ items: res.items.map(mapServerItem) });
            }
          }
        } catch {
          // Keep optimistic state
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        const currentItem = get().items.find((item) => item.id === id || item.serverId === id);

        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id && item.serverId !== id) };
          }

          return {
            items: state.items.map((item) => {
              if (item.id === id || item.serverId === id) {
                return {
                  ...item,
                  quantity,
                  lineTotal: calculateLineTotal(
                    item.unitPrice,
                    item.productType,
                    quantity,
                    item.customSpecs
                  ),
                };
              }
              return item;
            }),
          };
        });

        const targetId = currentItem?.serverId || id;
        try {
          const token = await getSessionToken();
          if (token && targetId) {
            const res = await apiUpdateCartItem(targetId, { quantity });
            if (res && Array.isArray(res.items)) {
              set({ items: res.items.map(mapServerItem) });
            }
          }
        } catch {
          // Keep optimistic state
        }
      },

      removeItem: async (id: string) => {
        const currentItem = get().items.find((item) => item.id === id || item.serverId === id);
        const targetId = currentItem?.serverId || id;

        set((state) => ({
          items: state.items.filter((item) => item.id !== id && item.serverId !== id),
        }));

        try {
          const token = await getSessionToken();
          if (token && targetId) {
            const res = await apiRemoveCartItem(targetId);
            if (res && Array.isArray(res.items)) {
              set({ items: res.items.map(mapServerItem) });
            }
          }
        } catch {
          // Keep optimistic state
        }
      },

      clearCart: async () => {
        set({ items: [] });
        try {
          const token = await getSessionToken();
          if (token) {
            await apiClearCart();
          }
        } catch {
          // Ignore
        }
      },
    }),
    {
      name: 'roofing_mobile_cart',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          const sanitized = state.items.filter(
            (item) => !item.productId.startsWith('b0000000-0000-4000-8000')
          );
          if (sanitized.length !== state.items.length) {
            useCartStore.setState({ items: sanitized });
          }
        }
        state?.setHydrated(true);
        state?.syncFromServer();
      },
    }
  )
);

// Listen to AppState to re-sync cart when app comes to foreground
AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    useCartStore.getState().syncFromServer();
  }
});

export function useCart() {
  const store = useCartStore();
  const subtotal = store.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: store.items,
    itemCount: store.isHydrated ? itemCount : 0,
    subtotal: store.isHydrated ? subtotal : 0,
    isHydrated: store.isHydrated,
    isLoading: store.isLoading,
    syncFromServer: store.syncFromServer,
    addItem: store.addItem,
    updateQuantity: store.updateQuantity,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
  };
}
