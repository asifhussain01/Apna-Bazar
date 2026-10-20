import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useLocalizationStore } from './src/store/localizationStore';
import { useAuthStore } from './src/store/authStore';
import { useCartStore } from './src/store/cartStore';
import { mobileSocket } from './src/api/socket';
import { mobileSoundService } from './src/utils/mobileSound';

export default function App() {
  const { loadSavedLanguage } = useLocalizationStore();
  const { user, loadAuth } = useAuthStore();
  const { loadCart } = useCartStore();

  useEffect(() => {
    loadSavedLanguage();
    loadAuth();
    loadCart();
  }, []);

  // Connect socket and register live new order listener for storekeeper / admin
  useEffect(() => {
    const socket = mobileSocket.connect(user?.id, user?.role);

    const unsubNewOrder = mobileSocket.onNewOrderReceived((data: any) => {
      // Only notify storekeeper / admin
      if (user?.role === 'admin') {
        // 1. Play chime sound and vibrate phone
        mobileSoundService.playNewOrderSound();

        // 2. Display prominent order popup alert
        Alert.alert(
          '🔔 नया ऑर्डर प्राप्त हुआ!',
          `ऑर्डर: #${data.orderNumber || ''}\nराशि: ₹${data.totalAmount || ''}\nगाँव: ${data.village || ''}\nग्राहक: ${data.customerName || ''}`,
          [{ text: 'ठीक है (OK)' }]
        );
      }
    });

    return () => {
      unsubNewOrder();
    };
  }, [user]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
