import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { useAuth } from '../../store/auth';
import { getAccountOverview, getMyOrders } from '../../lib/api/endpoints';
import { formatPrice, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import type { AccountOverviewResponse, Order } from '../../types/api';

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();

  const [overview, setOverview] = useState<AccountOverviewResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [overRes, ordersRes] = await Promise.all([
        getAccountOverview().catch(() => null),
        getMyOrders({ limit: 10 }).catch(() => null),
      ]);

      if (overRes && overRes.success) {
        setOverview(overRes);
      }
      if (ordersRes && ordersRes.success && Array.isArray(ordersRes.items)) {
        setOrders(ordersRes.items);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, loadUserData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title="My Account"
        showBack={false}
        showCart={true}
        rightAction={
          isAuthenticated ? (
            <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="log-out-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {!isAuthenticated ? (
          <View style={[styles.loginPrompt, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="person-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.promptTitle, { color: theme.text }]}>Sign In to Your Account</Text>
            <Text style={[styles.promptDesc, { color: theme.textSecondary }]}>
              Track previous orders, manage delivery addresses, and sync your shopping cart across all your devices.
            </Text>
            <Button
              title="Sign In with Google / Email"
              size="lg"
              onPress={() => router.push('/login')}
              style={{ width: '100%', marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            {/* User Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {user?.fullName || 'Roofing Customer'}
                </Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
                <Badge
                  label={user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
                  variant={user?.role === 'admin' ? 'accent' : 'primary'}
                  style={{ marginTop: 6 }}
                />
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {overview?.orderCount ?? orders.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Orders</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {formatPrice(overview?.totalSpent ?? 0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Spent</Text>
              </View>
            </View>

            {/* Order History */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Order History</Text>

              {loading ? (
                <ActivityIndicator style={{ marginVertical: 24 }} color={theme.primary} />
              ) : orders.length === 0 ? (
                <View style={[styles.emptyOrders, { backgroundColor: theme.backgroundElement }]}>
                  <Ionicons name="receipt-outline" size={36} color={theme.textMuted} />
                  <Text style={[styles.emptyOrdersText, { color: theme.textSecondary }]}>
                    You have not placed any orders yet.
                  </Text>
                </View>
              ) : (
                <View style={styles.ordersList}>
                  {orders.map((order) => (
                    <TouchableOpacity
                      key={order.id}
                      style={[
                        styles.orderCard,
                        { backgroundColor: theme.card, borderColor: theme.border },
                      ]}
                      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
                    >
                      <View style={styles.orderHeader}>
                        <View>
                          <Text style={[styles.orderNumber, { color: theme.text }]}>
                            #{order.orderNumber}
                          </Text>
                          <Text style={[styles.orderDate, { color: theme.textMuted }]}>
                            {formatDate(order.createdAt)}
                          </Text>
                        </View>
                        <Badge
                          label={order.status.replace(/_/g, ' ')}
                          variant={order.status === 'completed' || order.status === 'paid' ? 'success' : 'primary'}
                        />
                      </View>

                      <View style={[styles.orderDivider, { backgroundColor: theme.border }]} />

                      <View style={styles.orderFooter}>
                        <Text style={[styles.orderItemsCount, { color: theme.textSecondary }]}>
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </Text>
                        <Text style={[styles.orderTotal, { color: theme.primary }]}>
                          {formatPrice(order.total)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Logout button */}
            <View style={styles.logoutContainer}>
              <Button
                title="Sign Out"
                variant="danger"
                onPress={handleLogout}
                icon={<Ionicons name="log-out-outline" size={18} color="#ffffff" />}
              />
            </View>
          </>
        )}
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
    paddingBottom: 32,
  },
  loginPrompt: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  promptDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyOrders: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyOrdersText: {
    fontSize: 13,
  },
  ordersList: {
    gap: 10,
  },
  orderCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 11,
    marginTop: 2,
  },
  orderDivider: {
    height: 1,
    marginVertical: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemsCount: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutContainer: {
    marginTop: 8,
  },
});
