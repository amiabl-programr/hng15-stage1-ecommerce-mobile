import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/use-theme';
import { getCategories, getProducts } from '../../lib/api/endpoints';
import { ProductCard } from '../../components/ui/ProductCard';
import { Header } from '../../components/ui/Header';
import type { Category, Product } from '../../types/api';

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const theme = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      if (res && Array.isArray(res.items)) {
        setCategories(res.items);
      }
    } catch {
      // Ignore
    }
  }, []);

  const loadProducts = useCallback(async (catSlug?: string | null) => {
    setLoading(true);
    try {
      const query = catSlug ? { category: catSlug } : {};
      const res = await getProducts(query);
      if (res && Array.isArray(res.items)) {
        setProducts(res.items);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory, loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts(selectedCategory);
  };

  const filteredProducts = products.filter((p) =>
    searchQuery.trim() === ''
      ? true
      : p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Catalogue" showBack={false} />

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search roofing materials..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter Bar */}
      <View style={[styles.categoryBar, { borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedCategory === null
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedCategory === null ? '#ffffff' : theme.text },
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterPill,
                  isSelected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : cat.slug)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#ffffff' : theme.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No products found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery
                  ? `No items matching "${searchQuery}". Try different keywords.`
                  : 'No items in this category.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  categoryBar: {
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
