import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useLocalizationStore } from '../store/localizationStore';
import { fetchProducts } from '../api/products';

type ScreenRouteProp = RouteProp<RootStackParamList, 'ProductList'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const ProductListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId, categoryTitle, searchQuery } = route.params;
  const { currentLanguage, t } = useLocalizationStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_low' | 'price_high'>('default');

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: categoryId,
      search: searchQuery
    })
      .then(res => {
        setProducts(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId, searchQuery]);

  // Client-side filtering & sorting
  let filtered = inStockOnly ? products.filter(p => p.stockQuantity > 0) : products;

  if (sortBy === 'price_low') {
    filtered = [...filtered].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sortBy === 'price_high') {
    filtered = [...filtered].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  }

  const screenTitle = categoryTitle || (searchQuery ? `खोज: "${searchQuery}"` : t('categories'));

  return (
    <View style={styles.container}>
      <Header
        title={screenTitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter and Sort Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, inStockOnly && styles.filterPillActive]}
          onPress={() => setInStockOnly(!inStockOnly)}
        >
          <Ionicons
            name={inStockOnly ? 'checkbox' : 'square-outline'}
            size={16}
            color={inStockOnly ? '#FFFFFF' : colors.textPrimary}
          />
          <Text style={[styles.filterText, inStockOnly && styles.filterTextActive]}>
            {t('inStock')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, sortBy === 'price_low' && styles.filterPillActive]}
          onPress={() => setSortBy(sortBy === 'price_low' ? 'default' : 'price_low')}
        >
          <Text style={[styles.filterText, sortBy === 'price_low' && styles.filterTextActive]}>
            कम कीमत (Low ₹)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, sortBy === 'price_high' && styles.filterPillActive]}
          onPress={() => setSortBy(sortBy === 'price_high' ? 'default' : 'price_high')}
        >
          <Text style={[styles.filterText, sortBy === 'price_high' && styles.filterTextActive]}>
            ज़्यादा कीमत (High ₹)
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>सामान लोड हो रहा है...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>कोई सामान नहीं मिला</Text>
          <Text style={styles.emptySub}>कृपया कोई दूसरा सामान खोजें या फ़िल्टर बदलें</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.map(product => (
            <View key={product._id} style={styles.gridCol}>
              <ProductCard
                product={product}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    productId: product._id,
                    productTitle: currentLanguage === 'hi' ? product.name?.hi : product.name?.en
                  })
                }
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 4
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16
  },
  gridCol: {
    width: '48%'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6
  }
});
