import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LanguageSwitcherModal } from '../components/LanguageSwitcherModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuthStore } from '../store/authStore';
import { useLocalizationStore } from '../store/localizationStore';
import { apiClient } from '../api/client';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const { user, activeAddress, logout } = useAuthStore();

  const [showLangModal, setShowLangModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName = user?.fullName || activeAddress?.fullName || 'अतिथि ग्राहक (Guest)';
  const displayPhone = user?.phoneNumber || activeAddress?.phoneNumber || 'नंबर दर्ज नहीं';

  const handleDeleteAccount = async () => {
    try {
      setShowDeleteModal(false);
      await apiClient('/auth/account', { method: 'DELETE' });
      await logout();
      Alert.alert('सफल', 'आपका खाता सुरक्षित रूप से हटा दिया गया है');
    } catch (e) {
      Alert.alert('त्रुटि', 'कृपया पुनः प्रयास करें');
    }
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.replace('CustomerAuth');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={t('profile')} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userPhone}>+91 {displayPhone}</Text>
            {activeAddress?.village && (
              <View style={styles.villageTag}>
                <Ionicons name="location-outline" size={12} color={colors.primary} />
                <Text style={styles.villageText}>गाँव: {activeAddress.village}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Options List */}
        <View style={styles.menuCard}>
          {/* Language Selection */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowLangModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="language" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{t('language')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.langBadgeText}>
                {currentLanguage === 'hi' ? 'हिन्दी' : 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Manage Village Address */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddressManage', {})}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="home-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>गाँव का डिलीवरी पता (Manage Address)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Help & Contact Shopkeeper */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpContact')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>मदद और दुकानदार संपर्क (Help & Support)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Privacy Policy & Terms */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PolicyTerms', { type: 'privacy' })}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{t('privacyPolicy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PolicyTerms', { type: 'terms' })}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{t('termsOfService')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.menuItem, styles.noBorder]}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error }]}>
                {t('deleteAccount')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        {user ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.logoutText}>लॉगआउट (Logout)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: colors.primary, backgroundColor: '#FFF7ED' }]}
            onPress={() => navigation.navigate('CustomerAuth')}
          >
            <Ionicons name="log-in-outline" size={20} color={colors.primary} />
            <Text style={[styles.logoutText, { color: colors.primary, fontWeight: '800' }]}>
              लॉगिन करें या नया खाता बनाएं (Login / Sign Up)
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.appVersionRow}>
          <Text style={styles.appVersionText}>Apna Bazar Mobile v1.0.0</Text>
          <Text style={styles.appSubText}>गाँव का अपना डिजिटल बाज़ार</Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <LanguageSwitcherModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="खाता हटाएँ (Delete Account)"
        message="क्या आप वाकई अपना खाता और सभी सुरक्षित पते हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।"
        confirmLabel="हाँ, खाता हटाएँ"
        isDestructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Logout Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="लॉगआउट"
        message="क्या आप लॉगआउट करना चाहते हैं?"
        confirmLabel="लॉगआउट करें"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
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
    padding: 16
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginVertical: 2
  },
  villageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  villageText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  noBorder: {
    borderBottomWidth: 0
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 6
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginLeft: 8
  },
  appVersionRow: {
    alignItems: 'center',
    marginVertical: 10
  },
  appVersionText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600'
  },
  appSubText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  }
});
