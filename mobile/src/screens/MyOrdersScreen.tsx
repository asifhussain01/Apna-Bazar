import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useLocalizationStore } from '../store/localizationStore';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { mobileSocket } from '../api/socket';

type OrdersScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'OrdersTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: OrdersScreenNavigationProp;
}

export const MyOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const { user, activeAddress } = useAuthStore();
  const { orders, loading, loadOrders } = useOrdersStore();

  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    const phone = user?.phoneNumber || activeAddress?.phoneNumber;
    await loadOrders(phone);
  };

  useEffect(() => {
    fetchOrders();
  }, [user, activeAddress]);

  useEffect(() => {
    const unsub = mobileSocket.onOrderStatusUpdated(() => {
      fetchOrders();
    });
    return () => {
      unsub();
    };
  }, [user, activeAddress]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Filter into active and past
  const activeOrders = orders.filter(
    o => o && !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
  );
  const pastOrders = orders.filter(
    o => o && ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
  );
  const currentList = activeTab === 'active' ? activeOrders : pastOrders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return { label: t('placed'), bg: '#FEF3C7', text: '#92400E' };
      case 'CONFIRMED':
        return { label: t('confirmed'), bg: '#E0E7FF', text: '#3730A3' };
      case 'PREPARING':
        return { label: t('preparing'), bg: '#DBEAFE', text: '#1E40AF' };
      case 'SHIPPED':
        return { label: t('shipped'), bg: '#E0F2FE', text: '#0369A1' };
      case 'OUT_FOR_DELIVERY':
        return { label: t('outForDelivery'), bg: '#FEF08A', text: '#854D0E' };
      case 'DELIVERED':
        return { label: t('delivered'), bg: '#DCFCE7', text: '#166534' };
      case 'CANCELLED':
        return { label: t('cancelled'), bg: colors.errorLight, text: colors.error };
      case 'REJECTED':
        return { label: t('rejected'), bg: colors.errorLight, text: colors.error };
      default:
        return { label: status, bg: '#F1F5F9', text: colors.textPrimary };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={t('orders')} />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            {t('activeOrders')} ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            {t('pastOrders')} ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {currentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'कोई चालू ऑर्डर नहीं है' : 'कोई पुराना ऑर्डर नहीं है'}
            </Text>
            <Text style={styles.emptySub}>
              अपनी पसंद का किराना सामान चुनें और घर बैठे मँगवाएं
            </Text>
            <Button
              title="सामान देखें (Shop Now)"
              onPress={() => navigation.navigate('HomeTab')}
              variant="primary"
              style={styles.shopNowBtn}
            />
          </View>
        ) : (
          currentList.map(order => {
            const badge = getStatusBadge(order.orderStatus);
            const dateStr = new Date(order.createdAt).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <TouchableOpacity
                key={order._id}
                activeOpacity={0.8}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{dateStr}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Items Preview */}
                <View style={styles.itemsSummary}>
                  <Text style={styles.itemsSummaryText} numberOfLines={2}>
                    {order.items
                      ?.map((it: any) => `${it.name?.hi || it.name?.en} (${it.quantity})`)
                      .join(' • ')}
                  </Text>
                </View>

                {/* Shopkeeper Tag if grabbed / confirmed */}
                {(() => {
                  const shopkeeperName = order.shopkeeperName || order.assignedShopkeeper?.name;
                  const isAccepted = ['CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus);

                  if (shopkeeperName) {
                    return (
                      <View style={styles.shopkeeperTag}>
                        <Ionicons name="storefront" size={13} color="#15803D" />
                        <Text style={styles.shopkeeperTagText}>
                          दुकानदार: {shopkeeperName} {isAccepted ? '(स्वीकार किया)' : ''}
                        </Text>
                      </View>
                    );
                  }

                  if (order.orderStatus === 'PLACED') {
                    return (
                      <View style={styles.shopkeeperPendingTag}>
                        <Ionicons name="time-outline" size={13} color="#B45309" />
                        <Text style={styles.shopkeeperPendingTagText}>
                          ⏳ दुकानदार द्वारा स्वीकार होने की प्रतीक्षा है...
                        </Text>
                      </View>
                    );
                  }

                  return null;
                })()}

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.footerLabel}>कुल राशि (COD):</Text>
                    <Text style={styles.footerTotal}>₹{order.totalAmount}</Text>
                  </View>

                  <View style={styles.trackPill}>
                    <Text style={styles.trackText}>ट्रैक करें (Track) ➔</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary
  },
  tabTextActive: {
    color: colors.primary
  },
  scroll: {
    padding: 16,
    paddingBottom: 24
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800'
  },
  itemsSummary: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginVertical: 4
  },
  itemsSummaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  shopkeeperTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  shopkeeperTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4
  },
  shopkeeperPendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  shopkeeperPendingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  footerLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.secondaryDark
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  trackText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 16
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24
  },
  shopNowBtn: {
    minWidth: 200
  }
});
