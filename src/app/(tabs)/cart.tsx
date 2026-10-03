import React, { useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { formatPrice } from '../../lib/format';
import { CartItemRow } from '../../components/ui/CartItemRow';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, syncFromServer, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        params: { returnTo: '/checkout' },
      });
    } else {
      router.push('/checkout');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title="Shopping Cart"
        showBack={false}
        showCart={false}
        rightAction={
          items.length > 0 ? (
            <TouchableOpacity onPress={clearCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.clearText, { color: theme.danger }]}>Clear</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="cart-outline" size={48} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Explore our industrial roofing materials and add items to your cart.
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.push('/(tabs)/products')}
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Sync status pill */}
          <View style={[styles.syncStatus, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Ionicons name="cloud-done" size={14} color="#16a34a" />
            <Text style={styles.syncText}>
              Cart synchronised in real-time with web shop
            </Text>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CartItemRow
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />

          {/* Bottom Checkout Summary Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
                shadowColor: '#000',
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Items ({itemCount})
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                Calculated at checkout
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            <Button
              title="Proceed to Checkout"
              size="lg"
              onPress={handleProceedToCheckout}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
