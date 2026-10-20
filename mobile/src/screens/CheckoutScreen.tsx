import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useLocalizationStore } from '../store/localizationStore';
import { useOrdersStore } from '../store/ordersStore';
import { submitOrder } from '../api/orders';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

interface Props {
  navigation: NavigationProp;
}

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const { items, getSubtotal, getDeliveryFee, getTotalAmount, clearCart } = useCartStore();
  const { activeAddress } = useAuthStore();

  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const totalAmount = getTotalAmount();

  const handlePlaceOrder = async () => {
    if (!activeAddress) {
      Alert.alert(
        'डिलीवरी का पता आवश्यक है',
        'कृपया पहले अपने गाँव का डिलीवरी पता भरें',
        [
          {
            text: 'पता भरें (Add Address)',
            onPress: () => navigation.navigate('AddressManage', { returnToCheckout: true })
          }
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert('खाली कार्ट', 'आपका थैला खाली है');
      return;
    }

    try {
      setPlacingOrder(true);

      const orderPayload = {
        items: items.map(it => ({
          productId: it.productId,
          quantity: it.quantity
        })),
        deliveryAddress: {
          fullName: activeAddress.fullName,
          phoneNumber: activeAddress.phoneNumber,
          alternatePhone: activeAddress.alternatePhone,
          state: activeAddress.state,
          district: activeAddress.district,
          village: activeAddress.village,
          pincode: activeAddress.pincode,
          landmark: activeAddress.landmark,
          deliveryInstructions: activeAddress.deliveryInstructions
        },
        guestName: activeAddress.fullName,
        guestPhone: activeAddress.phoneNumber
      };

      const res = await submitOrder(orderPayload);

      if (res.success && res.data) {
        clearCart();
        // Immediately persist to local orders store so history is always populated
        await useOrdersStore.getState().addOrder(res.data);

        navigation.replace('OrderConfirmation', {
          orderId: res.data._id,
          orderNumber: res.data.orderNumber,
          totalAmount: res.data.totalAmount,
          village: activeAddress.village
        });
      } else {
        Alert.alert('ऑर्डर दर्ज नहीं हो सका', res.message || 'कृपया दोबारा प्रयास करें');
      }
    } catch (error) {
      Alert.alert('नेटवर्क समस्या', 'इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="ऑर्डर पूरा करें (Checkout)"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Delivery Village Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>{t('address')}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('AddressManage', { returnToCheckout: true })}
            >
              <Text style={styles.changeBtnText}>
                {activeAddress ? 'बदलें (Change)' : '+ जोड़ें (Add)'}
              </Text>
            </TouchableOpacity>
          </View>

          {activeAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.recipientName}>{activeAddress.fullName}</Text>
              <Text style={styles.recipientPhone}>मोबाइल: {activeAddress.phoneNumber}</Text>
              <Text style={styles.addressLine}>
                गाँव: {activeAddress.village}, {activeAddress.district} ({activeAddress.pincode})
              </Text>
              <View style={styles.landmarkPill}>
                <Ionicons name="compass-outline" size={14} color={colors.primary} />
                <Text style={styles.landmarkText}>पहचान: {activeAddress.landmark}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noAddressBox}
              onPress={() => navigation.navigate('AddressManage', { returnToCheckout: true })}
            >
              <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
              <Text style={styles.noAddressText}>गाँव का डिलीवरी पता भरें</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method Card - COD Default */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="wallet" size={20} color={colors.secondary} />
            <Text style={styles.cardTitle}>भुगतान का तरीका (Payment Method)</Text>
          </View>

          <View style={styles.codCardSelected}>
            <View style={styles.codLeft}>
              <Ionicons name="cash" size={26} color={colors.secondaryDark} />
              <View style={styles.codTextCol}>
                <Text style={styles.codTitle}>कैश ऑन डिलीवरी (Cash on Delivery)</Text>
                <Text style={styles.codSub}>सामान मिलने पर नकद भुगतान करें</Text>
              </View>
            </View>

            <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
          </View>
        </View>

        {/* Order Items Snapshot Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="list" size={20} color={colors.textPrimary} />
            <Text style={styles.cardTitle}>सामान की सूची ({items.length} आइटम)</Text>
          </View>

          {items.map(item => {
            const title = currentLanguage === 'hi' ? item.name?.hi || item.name?.en : item.name?.en || item.name?.hi;
            return (
              <View key={item.productId} style={styles.itemRow}>
                <View style={styles.itemTitleCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.unit} × {item.quantity}
                  </Text>
                </View>

                <Text style={styles.itemTotal}>₹{item.salePrice * item.quantity}</Text>
              </View>
            );
          })}
        </View>

        {/* Final Price Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>मूल्य विवरण (Payment Summary)</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('subtotal')}</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('deliveryCharge')}</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeText}>मुफ़्त (FREE)</Text>
            ) : (
              <Text style={styles.billVal}>₹{deliveryFee}</Text>
            )}
          </View>

          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('totalPayable')}</Text>
            <Text style={styles.totalVal}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPayableLabel}>{t('totalPayable')}</Text>
          <Text style={styles.bottomPayableVal}>₹{totalAmount}</Text>
        </View>

        <Button
          title={placingOrder ? t('placingOrder') : t('confirmOrder')}
          onPress={handlePlaceOrder}
          variant="secondary"
          loading={placingOrder}
          disabled={placingOrder}
          style={styles.placeOrderBtn}
          icon={<Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />}
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
  scroll: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 8
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  recipientPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 2
  },
  addressLine: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4
  },
  landmarkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  landmarkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4
  },
  noAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.primaryLight
  },
  noAddressText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8
  },
  codCardSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: colors.secondary,
    padding: 12,
    borderRadius: 12
  },
  codLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  codTextCol: {
    marginLeft: 10
  },
  codTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  codSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  itemTitleCol: {
    flex: 1,
    marginRight: 10
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
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
  billVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  freeText: {
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
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.secondaryDark
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
  bottomPayableLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  bottomPayableVal: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.secondaryDark
  },
  placeOrderBtn: {
    flex: 1.6,
    marginLeft: 14
  }
});
