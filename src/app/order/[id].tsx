import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { getOrderById } from '../../lib/api/endpoints';
import { formatDate, formatPrice } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import type { Order } from '../../types/api';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await getOrderById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch {
        // Handled in UI
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Order Confirmation" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Order Not Found" showBack={true} />
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to load order details</Text>
          <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Order Status" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon & Banner */}
        <View style={styles.successBanner}>
          <View style={[styles.successIconCircle, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
          </View>
          <Text style={[styles.orderTitle, { color: theme.text }]}>Order Placed Successfully!</Text>
          <Text style={[styles.orderSubtitle, { color: theme.textSecondary }]}>
            Confirmation #{order.orderNumber}
          </Text>
          <Badge
            label={order.status.replace(/_/g, ' ')}
            variant={order.status === 'completed' || order.status === 'paid' ? 'success' : 'primary'}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Order Details Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Customer & Delivery</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Customer Name:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email Address:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.customerEmail}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone Number:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.customerPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Delivery Address:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city},{' '}
              {order.deliveryAddress.state}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Order Date:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        {/* Items Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Materials Ordered</Text>

          {order.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemName, { color: theme.text }]}>{it.productName}</Text>
                <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                  Quantity: {it.quantity} • {formatPrice(it.unitPrice)} each
                </Text>
                {Boolean(it.customSpecs?.lengthMetres) && (
                  <Text style={[styles.itemSpecs, { color: theme.primary }]}>
                    Length: {it.customSpecs?.lengthMetres}m
                    {Boolean(it.customSpecs?.colour) ? ` • ${it.customSpecs?.colour}` : ''}
                  </Text>
                )}
              </View>
              <Text style={[styles.itemTotal, { color: theme.text }]}>{formatPrice(it.lineTotal)}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>{formatPrice(order.subtotal)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.breakdownValue, { color: theme.success }]}>
              {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        <Button
          title="Continue Shopping"
          size="lg"
          onPress={() => router.replace('/(tabs)/products')}
          style={{ marginTop: 12, marginBottom: 32 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  successBanner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemMain: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemSpecs: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
