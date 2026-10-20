import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useLocalizationStore } from '../store/localizationStore';
import { fetchOrderDetails, cancelOrderApi } from '../api/orders';
import { mobileSocket } from '../api/socket';

type ScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const OrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { currentLanguage, t } = useLocalizationStore();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const shopPhone = '+919876543210';

  const loadData = async () => {
    const data = await fetchOrderDetails(orderId);
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Join real-time socket room for this order
    mobileSocket.connect();
    mobileSocket.joinOrderRoom(orderId);

    const unsubscribe = mobileSocket.onOrderStatusUpdated(data => {
      if (data.orderId === orderId) {
        console.log('[Socket] Live order status update received:', data.newStatus);
        loadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const isAccepted = order && ['CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus);
  const actualShopkeeperName = order?.shopkeeperName || order?.assignedShopkeeper?.name || null;
  const isGrabbed = Boolean(actualShopkeeperName);
  const shopkeeperPhoneToCall = order?.shopkeeperPhone || order?.assignedShopkeeper?.phoneNumber || shopPhone;

  const handleCallShopkeeper = () => {
    setShowCallModal(false);
    Linking.openURL(`tel:${shopkeeperPhoneToCall}`);
  };

  const handleCancelOrder = async () => {
    try {
      setShowCancelModal(false);
      setCancelling(true);
      const res = await cancelOrderApi(orderId, 'ग्राहक द्वारा रद्द किया गया (Cancelled by customer)');
      if (res.success) {
        Alert.alert('सफल', 'ऑर्डर रद्द कर दिया गया है');
        loadData();
      } else {
        Alert.alert('त्रुटि', res.message || 'ऑर्डर रद्द नहीं किया जा सका');
      }
    } catch (err) {
      Alert.alert('त्रुटि', 'कृपया पुनः प्रयास करें');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>ऑर्डर नहीं मिला (Order not found)</Text>
      </View>
    );
  }

  const canCancel = ['PLACED', 'CONFIRMED'].includes(order.orderStatus);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title={`ऑर्डर #${order.orderNumber}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Real-time Order Tracking Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="navigate-circle" size={22} color={colors.primary} />
              <Text style={styles.cardTitle}>{t('orderTimeline')}</Text>
            </View>
          </View>

          <OrderStatusTimeline
            currentStatus={order.orderStatus}
            statusHistory={order.statusHistory}
            shopkeeperName={actualShopkeeperName || undefined}
          />
        </View>

        {/* Shopkeeper Status & Contact Card */}
        <View style={[styles.shopContactCard, isGrabbed && styles.shopAcceptedCard]}>
          <View style={styles.shopContactLeft}>
            <View style={[styles.shopIconBg, isGrabbed && styles.shopIconBgAccepted]}>
              <Ionicons name="storefront" size={24} color={isGrabbed ? '#FFFFFF' : colors.primary} />
            </View>
            <View style={styles.shopContactTextCol}>
              <View style={styles.shopNameRow}>
                <Text style={styles.shopContactTitle}>
                  {isGrabbed ? `दुकानदार: ${actualShopkeeperName}` : 'दुकानदार: अभी स्वीकार नहीं किया'}
                </Text>
                {isGrabbed ? (
                  <View style={styles.acceptedPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                    <Text style={styles.acceptedPillText}>स्वीकार किया (Accepted)</Text>
                  </View>
                ) : (
                  <View style={styles.pendingPill}>
                    <Ionicons name="time-outline" size={12} color="#B45309" />
                    <Text style={styles.pendingPillText}>प्रतीक्षा में (Pending)</Text>
                  </View>
                )}
              </View>
              <Text style={styles.shopContactSub}>
                {isGrabbed
                  ? `✅ ${actualShopkeeperName} ने आपका ऑर्डर ले लिया है`
                  : '⏳ ऑर्डर पेंडिंग - दुकानदार की पुष्टि की प्रतीक्षा है...'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callPill}
            onPress={() => setShowCallModal(true)}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callPillText}>कॉल करें</Text>
          </TouchableOpacity>
        </View>

        {/* Village Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('address')}</Text>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addrName}>{order.deliveryAddress?.fullName}</Text>
            <Text style={styles.addrPhone}>मोबाइल: {order.deliveryAddress?.phoneNumber}</Text>
            <Text style={styles.addrVillage}>
              गाँव: {order.deliveryAddress?.village}, जिला: {order.deliveryAddress?.district}
            </Text>
            <View style={styles.landmarkRow}>
              <Ionicons name="compass" size={14} color={colors.primary} />
              <Text style={styles.landmarkText}>
                पहचान: {order.deliveryAddress?.landmark}
              </Text>
            </View>
            {order.deliveryAddress?.deliveryInstructions ? (
              <Text style={styles.instructionText}>
                निर्देश: {order.deliveryAddress.deliveryInstructions}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Ordered Items List */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="basket" size={20} color={colors.textPrimary} />
            <Text style={styles.cardTitle}>सामान ({order.items?.length})</Text>
          </View>

          {order.items?.map((it: any, index: number) => {
            const title = currentLanguage === 'hi' ? it.name?.hi || it.name?.en : it.name?.en || it.name?.hi;
            return (
              <View key={index} style={styles.itemRow}>
                <Image
                  source={{
                    uri: it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'
                  }}
                  style={styles.itemThumb}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{title}</Text>
                  <Text style={styles.itemUnit}>
                    {it.unit} × {it.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>₹{it.itemTotal}</Text>
              </View>
            );
          })}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>भुगतान का विवरण</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('subtotal')}</Text>
            <Text style={styles.billVal}>₹{order.subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('deliveryCharge')}</Text>
            <Text style={styles.billVal}>
              {order.deliveryCharge === 0 ? 'मुफ़्त (FREE)' : `₹${order.deliveryCharge}`}
            </Text>
          </View>

          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('totalPayable')}</Text>
            <Text style={styles.totalVal}>₹{order.totalAmount}</Text>
          </View>

          <View style={styles.paymentStatusRow}>
            <Text style={styles.payStatusLabel}>भुगतान स्थिति (COD):</Text>
            <View
              style={[
                styles.payStatusPill,
                {
                  backgroundColor:
                    order.paymentStatus === 'COLLECTED' ? '#DCFCE7' : '#FEF3C7'
                }
              ]}
            >
              <Text
                style={[
                  styles.payStatusText,
                  {
                    color:
                      order.paymentStatus === 'COLLECTED' ? '#166534' : '#92400E'
                  }
                ]}
              >
                {order.paymentStatus === 'COLLECTED'
                  ? 'नकद प्राप्त हुआ (Collected)'
                  : 'डिलीवरी पर नकद देय (Pending)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Order Option if allowed */}
        {canCancel && (
          <Button
            title={cancelling ? 'रद्द हो रहा है...' : t('cancelOrder')}
            onPress={() => setShowCancelModal(true)}
            variant="danger"
            loading={cancelling}
            disabled={cancelling}
            style={styles.cancelBtn}
            icon={<Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />}
          />
        )}
      </ScrollView>

      {/* Call Shopkeeper Modal */}
      <ConfirmationModal
        visible={showCallModal}
        title="दुकानदार को कॉल करें"
        message={
          isGrabbed
            ? `क्या आप दुकानदार ${actualShopkeeperName} (${shopkeeperPhoneToCall}) को कॉल करना चाहते हैं?`
            : `दुकानदार ने अभी ऑर्डर स्वीकार नहीं किया है। क्या आप दुकान सहायता केंद्र (${shopPhone}) को कॉल करना चाहते हैं?`
        }
        confirmLabel="हाँ, कॉल करें (Call)"
        onConfirm={handleCallShopkeeper}
        onCancel={() => setShowCallModal(false)}
      />

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="ऑर्डर रद्द करें"
        message="क्या आप वाकई अपना यह ऑर्डर रद्द करना चाहते हैं?"
        confirmLabel="हाँ, रद्द करें (Confirm Cancel)"
        isDestructive
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scroll: {
    padding: 16,
    paddingBottom: 30
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
    fontWeight: '700'
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 8
  },
  shopContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA'
  },
  shopAcceptedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC'
  },
  shopContactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  shopIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shopIconBgAccepted: {
    backgroundColor: '#16A34A'
  },
  shopContactTextCol: {
    marginLeft: 10,
    flex: 1
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6
  },
  shopContactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  acceptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  acceptedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 3
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 3
  },
  shopContactSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  callPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4
  },
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12
  },
  addrName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  addrPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 2
  },
  addrVillage: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 4
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  landmarkText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4
  },
  instructionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  itemUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5
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
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  payStatusLabel: {
    fontSize: 13,
    color: colors.textSecondary
  },
  payStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  payStatusText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cancelBtn: {
    marginTop: 10,
    marginBottom: 20
  }
});
