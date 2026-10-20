import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useLocalizationStore } from '../store/localizationStore';

type ScreenRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmation'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const OrderConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, orderNumber, totalAmount, village } = route.params;
  const { currentLanguage, t } = useLocalizationStore();
  const [showCallModal, setShowCallModal] = useState(false);

  const shopPhone = '+919876543210';

  const handleCallShopkeeper = () => {
    setShowCallModal(false);
    Linking.openURL(`tel:${shopPhone}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-done" size={60} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>{t('orderSuccess')}</Text>
        <Text style={styles.subtitle}>
          दुकानदार द्वारा जल्द ही आपके ऑर्डर की पुष्टि की जाएगी।
        </Text>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.row}>
            <Text style={styles.label}>{t('orderNumber')}:</Text>
            <Text style={styles.orderNumberText}>{orderNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('totalPayable')}:</Text>
            <Text style={styles.amountText}>₹{totalAmount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>डिलीवरी का गाँव:</Text>
            <Text style={styles.valText}>{village}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>भुगतान:</Text>
            <Text style={styles.codText}>कैश ऑन डिलीवरी (COD)</Text>
          </View>

          <View style={styles.deliveryEstimateBox}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.estimateText}>
              अनुमानित समय: 2 से 4 घंटे के भीतर
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title={t('trackOrder')}
          onPress={() => navigation.replace('OrderDetail', { orderId })}
          variant="secondary"
          size="large"
          style={styles.trackBtn}
          icon={<Ionicons name="navigate-outline" size={20} color="#FFFFFF" />}
        />

        <Button
          title={t('callShopkeeper')}
          onPress={() => setShowCallModal(true)}
          variant="outline"
          size="normal"
          icon={<Ionicons name="call-outline" size={18} color={colors.primary} />}
        />
      </View>

      {/* Confirmation Modal before dialing external phone */}
      <ConfirmationModal
        visible={showCallModal}
        title="दुकानदार को कॉल करें"
        message={`क्या आप दुकानदार रमेश जी (${shopPhone}) को कॉल करना चाहते हैं?`}
        confirmLabel="हाँ, कॉल करें (Call)"
        onConfirm={handleCallShopkeeper}
        onCancel={() => setShowCallModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between'
  },
  content: {
    alignItems: 'center'
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.secondaryDark
  },
  valText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  codText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E'
  },
  deliveryEstimateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 14
  },
  estimateText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8
  },
  footer: {
    width: '100%'
  },
  trackBtn: {
    marginBottom: 12
  }
});
