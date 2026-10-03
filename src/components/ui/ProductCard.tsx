import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../store/cart';
import type { Product } from '../../types/api';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const { addItem } = useCart();

  const primaryMedia = product.media.find((m) => m.isPrimary) || product.media[0];
  const imageUrl = primaryMedia?.url;

  const handlePress = () => {
    router.push({
      pathname: '/product/[slug]',
      params: { slug: product.slug },
    });
  };

  const handleQuickAdd = (e: any) => {
    e.stopPropagation();
    addItem({
      product,
      quantity: 1,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            placeholder={primaryMedia?.blurhash}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={40} color={theme.textMuted} />
          </View>
        )}
        {product.category && (
          <View style={[styles.categoryBadge, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}>
            <Text style={styles.categoryText}>{product.category.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>From</Text>
            <Text style={[styles.price, { color: theme.primary }]}>
              {formatPrice(product.basePrice)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleQuickAdd}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 170,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
