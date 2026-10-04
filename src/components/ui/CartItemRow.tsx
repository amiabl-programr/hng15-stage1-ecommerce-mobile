import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { formatPrice } from '../../lib/format';
import { QuantityStepper } from './QuantityStepper';
import type { MobileCartItem } from '../../store/cart';

export interface CartItemRowProps {
  item: MobileCartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const theme = useTheme();

  const effectiveImage =
    item.imageUrl ||
    'https://images.unsplash.com/photo-1602193289141-9605ad75d0a5?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
        <Image source={{ uri: effectiveImage }} style={styles.image} contentFit="cover" />
      </View>

      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {item.productName}
          </Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {Boolean(item.variantName) && (
          <Text style={[styles.variant, { color: theme.textSecondary }]}>
            Option: {item.variantName}
          </Text>
        )}

        {Boolean(item.customSpecs?.lengthMetres) && (
          <Text style={[styles.specs, { color: theme.textSecondary }]}>
            Length: {item.customSpecs?.lengthMetres}m
            {Boolean(item.customSpecs?.colour) ? ` • ${item.customSpecs?.colour}` : ''}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.primary }]}>
            {formatPrice(item.lineTotal)}
          </Text>

          <QuantityStepper
            quantity={item.quantity}
            onIncrement={() => onUpdateQuantity(item.quantity + 1)}
            onDecrement={() => onUpdateQuantity(item.quantity - 1)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  variant: {
    fontSize: 12,
    marginTop: 2,
  },
  specs: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
});
