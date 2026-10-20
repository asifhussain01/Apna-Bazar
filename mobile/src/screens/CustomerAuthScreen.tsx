import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useLocalizationStore } from '../store/localizationStore';
import { apiClient } from '../api/client';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CustomerAuth'>;

interface Props {
  navigation: NavigationProp;
}

export const CustomerAuthScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const { setAuth } = useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [village, setVillage] = useState('');
  const [landmark, setLandmark] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '').slice(-10);

  const handleLogin = async () => {
    const phone = cleanPhone(phoneNumber);
    if (phone.length !== 10) {
      Alert.alert('अमान्य मोबाइल नंबर', 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!password) {
      Alert.alert('पासवर्ड आवश्यक है', 'कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    try {
      setLoading(true);
      const res: any = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: phone,
          password
        })
      });

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (res.success && token && user) {
        await setAuth(user, token);
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        Alert.alert('लॉगिन असफल', res.message || 'कृपया मोबाइल नंबर और पासवर्ड जांचें।');
      }
    } catch (err: any) {
      Alert.alert('नेटवर्क समस्या', 'सर्वर से कनेक्ट नहीं हो सका। कृपया इंटरनेट जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const phone = cleanPhone(phoneNumber);
    if (!fullName.trim()) {
      Alert.alert('नाम आवश्यक है', 'कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('अमान्य मोबाइल नंबर', 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!village.trim()) {
      Alert.alert('गाँव का नाम आवश्यक है', 'सामान डिलीवरी के लिए अपने गाँव का नाम दर्ज करें।');
      return;
    }
    if (password.length < 6) {
      Alert.alert('कमज़ोर पासवर्ड', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('पासवर्ड मेल नहीं खाया', 'दोनों पासवर्ड एक जैसे होने चाहिए।');
      return;
    }

    try {
      setLoading(true);
      const res: any = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phone,
          password,
          village: village.trim(),
          landmark: landmark.trim() || village.trim(),
          languagePreference: currentLanguage
        })
      });

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;

      if (res.success && token && user) {
        await setAuth(user, token);
        // खाता बनने के बाद तुरंत होम पेज पर ले जाएं
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        Alert.alert('खाता नहीं बन सका', res.message || 'कृपया दोबारा प्रयास करें।');
      }
    } catch (err: any) {
      Alert.alert('नेटवर्क समस्या', 'सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAsGuest = () => {
    navigation.replace('MainTabs', { screen: 'HomeTab' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Ionicons name="storefront" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Apna Bazar</Text>
          <Text style={styles.brandSubtitle}>अपना बाज़ार</Text>
          <Text style={styles.tagline}>गाँव का भरोसेमंद किराना स्टोर</Text>
        </View>

        {/* Auth Mode Toggle Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !isRegisterMode && styles.activeTab]}
            onPress={() => setIsRegisterMode(false)}
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color={!isRegisterMode ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, !isRegisterMode && styles.activeTabText]}>
              लॉगिन (Log In)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, isRegisterMode && styles.activeTab]}
            onPress={() => setIsRegisterMode(true)}
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color={isRegisterMode ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, isRegisterMode && styles.activeTabText]}>
              नया खाता (Sign Up)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.formCard}>
          {isRegisterMode ? (
            /* --- CREATE ACCOUNT FORM --- */
            <>
              <Text style={styles.formHeading}>नया ग्राहक खाता बनाएं</Text>
              <Text style={styles.formSub}>
                गाँव में सामान मंगाने के लिए एक बार अपनी जानकारी भरें
              </Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>आपका पूरा नाम (Full Name) *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="उदा. रमेश कुमार / शांति देवी"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>10 अंकों का मोबाइल नंबर *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="उदा. 9876543210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              {/* Village Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>आपके गाँव का नाम (Village Name) *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="home-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="उदा. रामपुर / शिवपुर / बेलवा"
                    placeholderTextColor={colors.textMuted}
                    value={village}
                    onChangeText={setVillage}
                  />
                </View>
              </View>

              {/* Landmark */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>नज़दीकी पहचान / लैंडमार्क (Nearby Landmark)</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="location-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="उदा. शिव मंदिर के पास / स्कूल के सामने"
                    placeholderTextColor={colors.textMuted}
                    value={landmark}
                    onChangeText={setLandmark}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>पासवर्ड (कम से कम 6 अक्षर) *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>पासवर्ड दोबारा लिखें *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>नया खाता बनाएं (Create Account)</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            /* --- LOGIN FORM --- */
            <>
              <Text style={styles.formHeading}>अपने खाते में लॉगिन करें</Text>
              <Text style={styles.formSub}>
                पंजीकृत मोबाइल नंबर से लॉगिन करें और चालू व पुराने ऑर्डर देखें
              </Text>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>10 अंकों का मोबाइल नंबर *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="9876543210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>पासवर्ड (Password) *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>लॉगिन करें (Sign In)</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Toggle Helper Link */}
          <View style={styles.toggleRow}>
            {isRegisterMode ? (
              <TouchableOpacity onPress={() => setIsRegisterMode(false)}>
                <Text style={styles.toggleText}>
                  पहले से खाता है? <Text style={styles.toggleTextBold}>यहाँ लॉगिन करें (Sign In)</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsRegisterMode(true)}>
                <Text style={styles.toggleText}>
                  नया ग्राहक हैं? <Text style={styles.toggleTextBold}>नया खाता बनाएं (Create Account)</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Skip as Guest Option */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkipAsGuest}>
          <Text style={styles.skipText}>बिना लॉगिन सामान देखें (Explore as Guest) ➔</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scroll: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.primary
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4
  },
  formSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 10,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  toggleRow: {
    marginTop: 16,
    alignItems: 'center'
  },
  toggleText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  toggleTextBold: {
    color: colors.primary,
    fontWeight: '800'
  },
  skipBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textDecorationLine: 'underline'
  }
});
