import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCartStore } from '../store/cartStore';
import { useLocalizationStore } from '../store/localizationStore';

type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CartTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: CartScreenNavigationProp;
}

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryFee,
    getTotalAmount,
    getAmountNeededForFreeDelivery
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const totalAmount = getTotalAmount();
  const neededForFree = getAmountNeededForFreeDelivery();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title={t('cart')} />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>{t('emptyCart')}</Text>
          <Text style={styles.emptySub}>{t('emptyCartSub')}</Text>

          <Button
            title={t('startShopping')}
            onPress={() => navigation.navigate('HomeTab')}
            variant="primary"
            style={styles.emptyButton}
            icon={<Ionicons name="bag-handle" size={20} color="#FFFFFF" />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={`${t('cart')} (${items.length})`} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Free Delivery Incentive Meter */}
        <View style={styles.deliveryMeterCard}>
          <View style={styles.deliveryMeterHeader}>
            <Ionicons
              name={neededForFree === 0 ? 'checkmark-circle' : 'bicycle'}
              size={20}
              color={neededForFree === 0 ? colors.secondary : colors.primary}
            />
            <Text style={styles.deliveryMeterText}>
              {neededForFree === 0
                ? 'मुफ़्त गाँव डिलीवरी अनलॉक हो गई!'
                : `मुफ़्त डिलीवरी के लिए ₹${neededForFree} का और सामान जोड़ें`}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.round((subtotal / 499) * 100))}%`,
                  backgroundColor: neededForFree === 0 ? colors.secondary : colors.primary
                }
              ]}
            />
          </View>
        </View>

        {/* Cart Item Cards */}
        <View style={styles.itemsList}>
          {items.map(item => {
            const title = currentLanguage === 'hi' ? item.name?.hi || item.name?.en : item.name?.en || item.name?.hi;
            const lineTotal = item.salePrice * item.quantity;

            return (
              <View key={item.productId} style={styles.itemCard}>
                <Image
                  source={{
                    uri: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'
                  }}
                  style={styles.itemImage}
                />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={styles.itemUnit}>{item.unit}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{item.salePrice}</Text>
                    <Text style={styles.itemLineTotal}>कुल: ₹{lineTotal}</Text>
                  </View>
                </View>

                {/* Right Quantity & Remove Controls */}
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => removeItem(item.productId)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, -1)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>

                    <Text style={styles.stepCount}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, 1)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bill Breakdown Summary Card */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>बिल का विवरण (Bill Summary)</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('subtotal')}</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('deliveryCharge')}</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeDeliveryText}>मुफ़्त (FREE)</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            )}
          </View>

          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('totalPayable')}</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>

          <View style={styles.codRow}>
            <Ionicons name="cash" size={18} color={colors.secondaryDark} />
            <Text style={styles.codText}>{t('codAvailable')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomTotalLabel}>{t('totalPayable')}</Text>
          <Text style={styles.bottomTotalPrice}>₹{totalAmount}</Text>
        </View>

        <Button
          title={t('proceedToCheckout')}
          onPress={() => navigation.navigate('Checkout')}
          variant="secondary"
          style={styles.checkoutBtn}
          icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },
  deliveryMeterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  deliveryMeterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  deliveryMeterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  itemsList: {
    marginBottom: 16
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  itemUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 10
  },
  itemLineTotal: {
    fontSize: 12,
    color: colors.secondaryDark,
    fontWeight: '700'
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 68
  },
  deleteButton: {
    padding: 4
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.primaryLight
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  stepCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 6
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  billLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  freeDeliveryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondaryDark
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
    paddingTop: 10
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.secondaryDark
  },
  codRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 12
  },
  codText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  bottomPriceCol: {
    flex: 1
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  bottomTotalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.secondaryDark
  },
  checkoutBtn: {
    flex: 1.5,
    marginLeft: 16
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    minWidth: 220
  }
});
