import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { getProductBySlug } from '../../lib/api/endpoints';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../store/cart';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { Header } from '../../components/ui/Header';
import type { CustomSpecs, Product, ProductVariant } from '../../types/api';

const STANDARD_COLOURS = ['Traffic Blue', 'Wine Red', 'Forest Green', 'Slate Grey', 'Plain Aluminium'];
const STANDARD_FINISHES = ['High-Gloss', 'Matte Textured', 'Stone-Coated'];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lengthMetres, setLengthMetres] = useState<string>('3');
  const [selectedColour, setSelectedColour] = useState<string>(STANDARD_COLOURS[0]);
  const [selectedFinish, setSelectedFinish] = useState<string>(STANDARD_FINISHES[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const res = await getProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
        }
      } catch {
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const effectiveUnitPrice = useMemo(() => {
    if (!product) return 0;
    return selectedVariant?.priceOverride != null ? selectedVariant.priceOverride : product.basePrice;
  }, [product, selectedVariant]);

  const customSpecs: CustomSpecs | undefined = useMemo(() => {
    if (!product) return undefined;
    if (product.productType === 'dimensioned') {
      const parsedLength = parseFloat(lengthMetres) || 1;
      return {
        lengthMetres: parsedLength,
        colour: selectedColour,
        finish: selectedFinish,
        notes: notes.trim() || undefined,
      };
    }
    return undefined;
  }, [product, lengthMetres, selectedColour, selectedFinish, notes]);

  const computedTotal = useMemo(() => {
    if (!product) return 0;
    if (product.productType === 'dimensioned') {
      const len = parseFloat(lengthMetres) || 1;
      return Math.round(effectiveUnitPrice * len * quantity);
    }
    return Math.round(effectiveUnitPrice * quantity);
  }, [product, effectiveUnitPrice, lengthMetres, quantity]);

  const handleAddToCart = async () => {
    if (!product) return;

    await addItem({
      product,
      variant: selectedVariant,
      quantity,
      customSpecs,
    });

    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 2500);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Product Details" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="Product Details" showBack={true} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Product Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mediaList = product.media || [];
  const currentImage = mediaList[selectedImageIndex] || mediaList[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title={product.name} showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={[styles.mainImageContainer, { backgroundColor: theme.backgroundElement }]}>
          {currentImage?.url ? (
            <Image
              source={{ uri: currentImage.url }}
              placeholder={currentImage.blurhash}
              style={styles.mainImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={64} color={theme.textMuted} />
            </View>
          )}
        </View>

        {/* Thumbnail Gallery */}
        {mediaList.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {mediaList.map((m, idx) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailWrapper,
                  {
                    borderColor: selectedImageIndex === idx ? theme.primary : theme.border,
                    borderWidth: selectedImageIndex === idx ? 2 : 1,
                  },
                ]}
              >
                <Image source={{ uri: m.url }} style={styles.thumbnail} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.infoContainer}>
          {/* Category & Kind Badges */}
          <View style={styles.badgeRow}>
            {product.category && <Badge label={product.category.name} variant="primary" />}
            <Badge label={`Unit: ${product.unitType}`} variant="secondary" />
            <Badge label={product.profileKind} variant="accent" />
          </View>

          <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.unitPrice, { color: theme.primary }]}>
              {formatPrice(effectiveUnitPrice)}
            </Text>
            <Text style={[styles.unitSuffix, { color: theme.textSecondary }]}>
              / {product.unitType}
            </Text>
          </View>

          {/* Description */}
          {Boolean(product.description) && (
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {product.description}
            </Text>
          )}

          {/* Variant Selector (if any) */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Thickness / Option</Text>
              <View style={styles.chipRow}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.chip,
                        isSelected
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      ]}
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : theme.text }]}>
                        {v.name}
                      </Text>
                      {v.priceOverride != null && (
                        <Text
                          style={[
                            styles.chipSubtext,
                            { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary },
                          ]}
                        >
                          {formatPrice(v.priceOverride)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Dimensioned Specs (Custom Length, Colour, Finish) */}
          {product.productType === 'dimensioned' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Dimensions & Finish</Text>

              {/* Length Metres */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Sheet Length (Metres):</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
                  ]}
                  keyboardType="numeric"
                  value={lengthMetres}
                  onChangeText={setLengthMetres}
                  placeholder="e.g. 3.5"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* Colour Picker */}
              <Text style={[styles.inputLabel, { color: theme.text, marginTop: 10 }]}>Architectural Colour:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {STANDARD_COLOURS.map((col) => {
                  const isSel = selectedColour === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.chip,
                        isSel
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      ]}
                      onPress={() => setSelectedColour(col)}
                    >
                      <Text style={[styles.chipText, { color: isSel ? '#ffffff' : theme.text }]}>{col}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Quantity Stepper */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quantity</Text>
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
              min={1}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            shadowColor: '#000',
          },
        ]}
      >
        <View style={styles.bottomTotal}>
          <Text style={[styles.bottomTotalLabel, { color: theme.textSecondary }]}>Total Price</Text>
          <Text style={[styles.bottomTotalPrice, { color: theme.primary }]}>
            {formatPrice(computedTotal)}
          </Text>
        </View>

        <Button
          title={addedNotice ? '✓ Added to Cart!' : 'Add to Cart'}
          variant={addedNotice ? 'secondary' : 'primary'}
          size="lg"
          onPress={handleAddToCart}
          style={{ flex: 1 }}
          icon={
            addedNotice ? (
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            ) : (
              <Ionicons name="cart" size={20} color="#ffffff" />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  mainImageContainer: {
    width: '100%',
    height: 280,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRow: {
    padding: 12,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  unitPrice: {
    fontSize: 24,
    fontWeight: '800',
  },
  unitSuffix: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    width: 100,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 16,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomTotal: {
    minWidth: 100,
  },
  bottomTotalLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomTotalPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
});
