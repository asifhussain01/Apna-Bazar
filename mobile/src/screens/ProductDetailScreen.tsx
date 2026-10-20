import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useLocalizationStore } from '../store/localizationStore';
import { useCartStore } from '../store/cartStore';
import { fetchProductById } from '../api/products';

type ScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId, productTitle } = route.params;
  const { currentLanguage, t } = useLocalizationStore();
  const { items, addItem, updateQuantity } = useCartStore();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [localQty, setLocalQty] = useState(1);

  useEffect(() => {
    fetchProductById(productId).then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, [productId]);

  const cartItem = items.find(it => it.productId === productId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>उत्पाद नहीं मिला (Product not found)</Text>
      </View>
    );
  }

  const name = currentLanguage === 'hi' ? product.name?.hi || product.name?.en : product.name?.en || product.name?.hi;
  const secondaryName = currentLanguage === 'hi' ? product.name?.en : product.name?.hi;
  const description = currentLanguage === 'hi' ? product.description?.hi || product.description?.en : product.description?.en || product.description?.hi;

  const price = product.salePrice ?? product.price;
  const mrp = product.price ?? product.salePrice;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.stockQuantity <= 0;

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  return (
    <View style={styles.container}>
      <Header
        title={productTitle || name}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Large Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />

          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {discountPercent}% {currentLanguage === 'hi' ? 'छूट' : 'OFF'}
              </Text>
            </View>
          )}

          {product.unit && (
            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>{product.unit}</Text>
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.title}>{name}</Text>
          {secondaryName && <Text style={styles.secondaryTitle}>{secondaryName}</Text>}

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {mrp > price && <Text style={styles.mrp}>₹{mrp}</Text>}
            {mrp > price && (
              <View style={styles.savingsPill}>
                <Text style={styles.savingsText}>बचत: ₹{mrp - price}</Text>
              </View>
            )}
          </View>

          {/* Stock Availability */}
          <View style={styles.stockRow}>
            {isOutOfStock ? (
              <View style={[styles.stockPill, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="close-circle" size={16} color={colors.error} />
                <Text style={[styles.stockText, { color: colors.error }]}>
                  {t('outOfStock')}
                </Text>
              </View>
            ) : isLowStock ? (
              <View style={[styles.stockPill, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.warning} />
                <Text style={[styles.stockText, { color: colors.warning }]}>
                  {t('lowStock')}
                </Text>
              </View>
            ) : (
              <View style={[styles.stockPill, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
                <Text style={[styles.stockText, { color: colors.secondary }]}>
                  {t('inStock')}
                </Text>
              </View>
            )}
          </View>

          {/* Trust Guarantees */}
          <View style={styles.trustBox}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
              <Text style={styles.trustText}>100% शुद्ध सामान</Text>
            </View>

            <View style={styles.trustItem}>
              <Ionicons name="cash" size={20} color={colors.primary} />
              <Text style={styles.trustText}>नकद भुगतान (COD)</Text>
            </View>

            <View style={styles.trustItem}>
              <Ionicons name="bicycle" size={20} color={colors.accent} />
              <Text style={styles.trustText}>गाँव में होम डिलीवरी</Text>
            </View>
          </View>

          {/* Description */}
          {description ? (
            <View style={styles.descSection}>
              <Text style={styles.descHeading}>सामान का विवरण (Details):</Text>
              <Text style={styles.descText}>{description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isOutOfStock ? (
          <Button
            title={t('outOfStock')}
            onPress={() => {}}
            disabled
            style={styles.fullWidthBtn}
          />
        ) : qtyInCart > 0 ? (
          <View style={styles.inCartActionRow}>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={() => updateQuantity(productId, -1)}
                style={styles.stepperButton}
              >
                <Ionicons name="remove" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{qtyInCart}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(productId, 1)}
                style={styles.stepperButton}
              >
                <Ionicons name="add" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Button
              title="थैला देखें (Go to Cart)"
              onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              variant="secondary"
              style={styles.goToCartBtn}
              icon={<Ionicons name="cart" size={20} color="#FFFFFF" />}
            />
          </View>
        ) : (
          <Button
            title={t('addToCart')}
            onPress={() => addItem(product, localQty)}
            variant="primary"
            style={styles.fullWidthBtn}
            icon={<Ionicons name="cart-outline" size={22} color="#FFFFFF" />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600'
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  image: {
    width: '85%',
    height: '85%'
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  unitBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  unitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  detailsCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 16,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 28
  },
  secondaryTitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.secondaryDark,
    marginRight: 10
  },
  mrp: {
    fontSize: 16,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 12
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  savingsText: {
    color: colors.secondaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  stockRow: {
    marginBottom: 16
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  stockText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  trustBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  trustText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 10
  },
  descSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14
  },
  descHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  descText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  fullWidthBtn: {
    width: '100%'
  },
  inCartActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    height: 52
  },
  stepperButton: {
    paddingHorizontal: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    paddingHorizontal: 8
  },
  goToCartBtn: {
    flex: 1,
    marginLeft: 12,
    height: 52
  }
});
