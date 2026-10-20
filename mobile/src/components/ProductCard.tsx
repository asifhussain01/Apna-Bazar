import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: any;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const { items, addItem, updateQuantity } = useCartStore();

  const id = product._id || product.id;
  const cartItem = items.find(it => it.productId === id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const title = currentLanguage === 'hi' ? product.name?.hi || product.name?.en : product.name?.en || product.name?.hi;
  const secondaryTitle = currentLanguage === 'hi' ? product.name?.en : product.name?.hi;

  const price = product.salePrice ?? product.price;
  const mrp = product.price ?? product.salePrice;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 5);
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
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

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {secondaryTitle && (
          <Text style={styles.secondaryTitle} numberOfLines={1}>
            {secondaryTitle}
          </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {mrp > price && <Text style={styles.mrp}>₹{mrp}</Text>}
        </View>

        {isOutOfStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>{t('outOfStock')}</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            {isLowStock && (
              <Text style={styles.lowStockText}>
                {t('lowStock')}
              </Text>
            )}

            {quantityInCart === 0 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => addItem(product)}
                style={styles.addButton}
              >
                <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>{t('addToCart')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() => updateQuantity(id, -1)}
                  style={styles.stepperButton}
                >
                  <Ionicons name="remove" size={16} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantityInCart}</Text>

                <TouchableOpacity
                  onPress={() => updateQuantity(id, 1)}
                  style={styles.stepperButton}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  unitBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  unitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  },
  content: {
    padding: 12
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    minHeight: 40
  },
  secondaryTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondaryDark,
    marginRight: 6
  },
  mrp: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  lowStockText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
    flex: 1
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 8
  },
  outOfStockBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center'
  },
  outOfStockText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold'
  }
});
