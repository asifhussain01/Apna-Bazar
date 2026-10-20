import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isLanguageSelected, loadSavedLanguage } = useLocalizationStore();
  const { user, token, loadAuth } = useAuthStore();
  const { loadCart } = useCartStore();

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadSavedLanguage(), loadAuth(), loadCart()]);

      // Natural splash delay
      setTimeout(() => {
        if (!isLanguageSelected) {
          navigation.replace('LanguageSelect');
        } else if (!useAuthStore.getState().user && !useAuthStore.getState().token) {
          navigation.replace('CustomerAuth');
        } else {
          navigation.replace('MainTabs', {});
        }
      }, 1600);
    };

    initializeApp();
  }, [isLanguageSelected]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="storefront" size={54} color={colors.primary} />
        </View>

        <Text style={styles.appName}>Apna Bazar</Text>
        <Text style={styles.appHindiName}>अपना बाज़ार</Text>
        <Text style={styles.tagline}>गाँव का भरोसेमंद किराना स्टोर</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.badgeText}>100% शुद्ध सामान • नकद भुगतान (COD)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  appHindiName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FEF08A', // Warm golden yellow
    marginTop: 2
  },
  tagline: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 10,
    opacity: 0.95
  },
  footer: {
    alignItems: 'center'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  }
});
