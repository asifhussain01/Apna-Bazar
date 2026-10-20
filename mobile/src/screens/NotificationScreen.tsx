import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { useLocalizationStore } from '../store/localizationStore';
import { apiClient } from '../api/client';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

interface Props {
  navigation: NavigationProp;
}

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await apiClient<any[]>('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await apiClient('/notifications/read-all', { method: 'PUT' });
    loadNotifications();
  };

  const handleNotificationPress = async (notif: any) => {
    if (!notif.isRead) {
      await apiClient(`/notifications/${notif._id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
    }

    if (notif.orderId) {
      navigation.navigate('OrderDetail', { orderId: notif.orderId });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title={t('notifications')}
        showBack
        onBack={() => navigation.goBack()}
      />

      {notifications.length > 0 && (
        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
            <Text style={styles.emptySub}>
              जब आप कोई ऑर्डर करेंगे या दुकान पर कोई नया ऑफर आएगा, तो आपको यहाँ सूचना मिलेगी।
            </Text>
          </View>
        ) : (
          notifications.map(notif => {
            const title = currentLanguage === 'hi' ? notif.title?.hi || notif.title?.en : notif.title?.en || notif.title?.hi;
            const body = currentLanguage === 'hi' ? notif.body?.hi || notif.body?.en : notif.body?.en || notif.body?.hi;
            const timeStr = new Date(notif.createdAt).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <TouchableOpacity
                key={notif._id}
                style={[
                  styles.card,
                  !notif.isRead && styles.unreadCard
                ]}
                onPress={() => handleNotificationPress(notif)}
              >
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={notif.type === 'ORDER_PLACED' ? 'cart' : 'cube'}
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.contentCol}>
                  <Text style={[styles.title, !notif.isRead && styles.unreadTitle]}>
                    {title}
                  </Text>
                  <Text style={styles.body}>{body}</Text>
                  <Text style={styles.time}>{timeStr}</Text>
                </View>

                {!notif.isRead && <View style={styles.dot} />}
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
  topActions: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  scroll: {
    padding: 16
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  unreadCard: {
    backgroundColor: colors.primaryLight,
    borderColor: '#FED7AA'
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  contentCol: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  unreadTitle: {
    fontWeight: '800',
    color: colors.primaryDark
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    lineHeight: 20
  }
});
