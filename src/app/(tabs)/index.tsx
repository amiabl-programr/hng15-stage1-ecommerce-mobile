import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
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
import { getCategories, getFeaturedProducts } from '../../lib/api/endpoints';
import { ProductCard } from '../../components/ui/ProductCard';
import { Header } from '../../components/ui/Header';
import type { Category, Product } from '../../types/api';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [catsRes, featRes] = await Promise.all([
        getCategories().catch(() => ({ success: true, items: [] })),
        getFeaturedProducts().catch(() => ({ success: true, items: [] })),
      ]);

      if (catsRes && Array.isArray(catsRes.items)) {
        setCategories(catsRes.items);
      }
      if (featRes && Array.isArray(featRes.items)) {
        setFeatured(featRes.items);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Roofing Shop" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: '#0f172a' }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>PREMIUM INDUSTRIAL QUALITY</Text>
            </View>
            <Text style={styles.heroTitle}>Roofing & Sheet Metal Fabrication</Text>
            <Text style={styles.heroSubtitle}>
              Architectural longspan, metcopo tiles, accessories, and precision fabrication services.
            </Text>
            <TouchableOpacity
              style={[styles.heroButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/(tabs)/products')}
            >
              <Text style={styles.heroButtonText}>Explore Catalogue</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
                onPress={() => router.push({ pathname: '/(tabs)/products', params: { category: cat.slug } })}
              >
                <Ionicons name="layers-outline" size={16} color={theme.primary} />
                <Text style={[styles.categoryChipText, { color: theme.text }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Materials</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={theme.primary} />
          ) : featured.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="construct-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No featured products currently available.
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>

        {/* Guarantee Banner */}
        <View style={[styles.featureBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark" size={32} color={theme.success} />
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Certified Quality & Guarantee</Text>
            <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
              Direct manufacturer pricing with mill test certification on aluminium and aluzinc sheets.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesList: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  productsGrid: {
    gap: 4,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
