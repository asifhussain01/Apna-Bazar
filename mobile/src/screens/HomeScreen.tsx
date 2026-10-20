import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { OfflineNotice } from '../components/OfflineNotice';
import { LanguageSwitcherModal } from '../components/LanguageSwitcherModal';
import { useLocalizationStore } from '../store/localizationStore';
import { fetchCategories, fetchProducts } from '../api/products';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = async () => {
    try {
      const [cats, feat, pop] = await Promise.all([
        fetchCategories(),
        fetchProducts({ featured: true }),
        fetchProducts({})
      ]);

      setCategories(cats);
      setFeaturedProducts(feat);
      setPopularProducts(pop);
      setIsOffline(false);
    } catch (e) {
      setIsOffline(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ProductList', {
        searchQuery: searchQuery.trim(),
        categoryTitle: `खोज: "${searchQuery.trim()}"`
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header with Language Pill & Notifications */}
      <Header
        onOpenLanguage={() => setShowLangModal(true)}
        onOpenNotifications={() => navigation.navigate('Notifications')}
      />

      <OfflineNotice isOffline={isOffline} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Search Bar with Large Input Target */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Free Delivery Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerTag}>
              <Ionicons name="bicycle" size={16} color="#FFFFFF" />
              <Text style={styles.bannerTagText}>
                {currentLanguage === 'hi' ? 'गाँव में तेज़ डिलीवरी' : 'Fast Village Delivery'}
              </Text>
            </View>
            <Text style={styles.bannerTitle}>
              {currentLanguage === 'hi'
                ? '2 से 4 घंटे में आपके घर!'
                : 'At your doorstep in 2-4 hrs!'}
            </Text>
            <Text style={styles.bannerSub}>
              {t('freeDeliveryNotice')}
            </Text>
          </View>

          <View style={styles.codPill}>
            <Ionicons name="cash-outline" size={16} color={colors.secondaryDark} />
            <Text style={styles.codPillText}>नकद भुगतान (COD)</Text>
          </View>
        </View>

        {/* Category Icons Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('categories')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}>
            <Text style={styles.seeAllText}>{t('viewAll')} ➔</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => {
            const catName = currentLanguage === 'hi' ? cat.name?.hi || cat.name?.en : cat.name?.en || cat.name?.hi;
            return (
              <TouchableOpacity
                key={cat._id || cat.slug}
                style={styles.catItem}
                onPress={() =>
                  navigation.navigate('ProductList', {
                    categoryId: cat._id,
                    categoryTitle: catName
                  })
                }
              >
                <View style={styles.catCircle}>
                  <Ionicons name={(cat.iconName || 'basket') as any} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel} numberOfLines={2}>
                  {catName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's Special Deals */}
        {featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="flame" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>{t('todaysDeals')}</Text>
              </View>
            </View>

            <View style={styles.productGrid}>
              {featuredProducts.map(product => (
                <View key={product._id} style={styles.gridItem}>
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
            </View>
          </View>
        )}

        {/* Popular Essentials in Village */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="star" size={20} color={colors.accent} />
              <Text style={styles.sectionTitle}>{t('popularItems')}</Text>
            </View>
          </View>

          <View style={styles.productGrid}>
            {popularProducts.map(product => (
              <View key={product._id} style={styles.gridItem}>
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
          </View>
        </View>

        {/* Help Banner at Bottom */}
        <TouchableOpacity
          style={styles.helpBanner}
          onPress={() => navigation.navigate('HelpContact')}
        >
          <Ionicons name="call" size={24} color={colors.primary} />
          <View style={styles.helpTextCol}>
            <Text style={styles.helpTitle}>ऑर्डर करने में कोई परेशानी?</Text>
            <Text style={styles.helpSub}>सीधे दुकानदार भाई से फोन पर बात करें</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <LanguageSwitcherModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  clearIcon: {
    padding: 4
  },
  bannerCard: {
    margin: 16,
    backgroundColor: '#EA580C',
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  bannerLeft: {
    marginBottom: 10
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26
  },
  bannerSub: {
    color: '#FEF08A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4
  },
  codPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  codPillText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6
  },
  sectionContainer: {
    marginTop: 8,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 6
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  categoryScroll: {
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  catItem: {
    alignItems: 'center',
    width: 82,
    marginHorizontal: 6
  },
  catCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48%'
  },
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  helpTextCol: {
    flex: 1,
    marginLeft: 12
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  helpSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});
