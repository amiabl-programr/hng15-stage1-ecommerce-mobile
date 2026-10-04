import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/use-theme';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { createOrder } from '../lib/api/endpoints';
import { formatPrice } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import type { PaymentMethod } from '../types/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deliveryFee = 0; // Standard free delivery promotional period
  const total = subtotal + deliveryFee;

  React.useEffect(() => {
    if (!user) {
      router.replace({
        pathname: '/login',
        params: { returnTo: '/checkout' },
      });
    }
  }, [user, router]);

  const handlePlaceOrder = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number');
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMsg('Please enter your delivery street address');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined,
          paymentMethod,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          customSpecs: i.customSpecs,
        })),
      };

      const res = await createOrder(orderPayload);
      if (res.success && res.order) {
        // Clear local & server cart
        await clearCart();

        // Navigate to Order Confirmation
        router.replace({
          pathname: '/order/[id]',
          params: { id: res.order.id },
        });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Checkout" showBack={true} showCart={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Section 1: Customer Contact */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Contact Information</Text>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Chief Adebayo Adeleke"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email Address *</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. adebayo@example.com"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number *</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="e.g. +234 803 123 4567"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          {/* Section 2: Delivery Details */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Delivery Destination</Text>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Street Address *</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Site / Construction Address"
              placeholderTextColor={theme.textMuted}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>City / Town *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Ikeja"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>State *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
                  ]}
                  value={state}
                  onChangeText={setState}
                  placeholder="e.g. Lagos"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Site Delivery Instructions</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              value={additionalInstructions}
              onChangeText={setAdditionalInstructions}
              placeholder="Gate code, site supervisor contact, landmark..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Section 3: Payment Method */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === 'transfer' ? theme.primary : theme.border,
                  backgroundColor: paymentMethod === 'transfer' ? '#eff6ff' : theme.backgroundElement,
                },
              ]}
              onPress={() => setPaymentMethod('transfer')}
            >
              <Ionicons
                name={paymentMethod === 'transfer' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'transfer' ? theme.primary : theme.textMuted}
              />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentTitle, { color: theme.text }]}>Bank Transfer</Text>
                <Text style={[styles.paymentDesc, { color: theme.textSecondary }]}>
                  Instant bank transfer with automated receipt verification
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === 'cash_on_delivery' ? theme.primary : theme.border,
                  backgroundColor: paymentMethod === 'cash_on_delivery' ? '#eff6ff' : theme.backgroundElement,
                },
              ]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <Ionicons
                name={paymentMethod === 'cash_on_delivery' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'cash_on_delivery' ? theme.primary : theme.textMuted}
              />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentTitle, { color: theme.text }]}>Pay on Site Delivery</Text>
                <Text style={[styles.paymentDesc, { color: theme.textSecondary }]}>
                  Inspect materials on truck before paying driver/operator
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section 4: Summary Breakdown */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>

            {items.map((it) => (
              <View key={it.id} style={styles.summaryItemRow}>
                <Text style={[styles.summaryItemName, { color: theme.text }]} numberOfLines={1}>
                  {it.quantity}x {it.productName}
                </Text>
                <Text style={[styles.summaryItemPrice, { color: theme.text }]}>
                  {formatPrice(it.lineTotal)}
                </Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryRowValue, { color: theme.text }]}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryRowLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.summaryRowValue, { color: theme.success }]}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total Due</Text>
              <Text style={[styles.totalPrice, { color: theme.primary }]}>{formatPrice(total)}</Text>
            </View>
          </View>

          <Button
            title={`Confirm & Place Order • ${formatPrice(total)}`}
            size="lg"
            loading={submitting}
            onPress={handlePlaceOrder}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  multilineInput: {
    height: 64,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  paymentDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryItemName: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryRowLabel: {
    fontSize: 13,
  },
  summaryRowValue: {
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
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
});
