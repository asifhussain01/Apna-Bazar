import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAuthStore, VillageAddress } from '../store/authStore';
import { useLocalizationStore } from '../store/localizationStore';

type ScreenRouteProp = RouteProp<RootStackParamList, 'AddressManage'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'AddressManage'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const AddressManageScreen: React.FC<Props> = ({ route, navigation }) => {
  const { returnToCheckout } = route.params || {};
  const { t } = useLocalizationStore();
  const { activeAddress, setActiveAddress } = useAuthStore();

  const [fullName, setFullName] = useState(activeAddress?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(activeAddress?.phoneNumber || '');
  const [alternatePhone, setAlternatePhone] = useState(activeAddress?.alternatePhone || '');
  const [village, setVillage] = useState(activeAddress?.village || '');
  const [district, setDistrict] = useState(activeAddress?.district || '');
  const [state, setState] = useState(activeAddress?.state || 'उत्तर प्रदेश (Uttar Pradesh)');
  const [pincode, setPincode] = useState(activeAddress?.pincode || '');
  const [landmark, setLandmark] = useState(activeAddress?.landmark || '');
  const [instructions, setInstructions] = useState(activeAddress?.deliveryInstructions || '');

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('नाम आवश्यक है', 'कृपया अपना पूरा नाम लिखें');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('अमान्य मोबाइल नंबर', 'कृपया 10 अंकों का सही मोबाइल नंबर भरें');
      return;
    }

    if (!village.trim()) {
      Alert.alert('गाँव का नाम आवश्यक है', 'कृपया अपने गाँव या कस्बे का नाम लिखें');
      return;
    }

    if (!district.trim()) {
      Alert.alert('जिला आवश्यक है', 'कृपया अपना जिला लिखें');
      return;
    }

    if (!landmark.trim()) {
      Alert.alert('पहचान / लैंडमार्क आवश्यक है', 'कृपया अपने घर के पास का मंदिर, स्कूल या दुकान का नाम लिखें ताकि डिलीवरी बॉय आसानी से पहुँच सके');
      return;
    }

    const newAddress: VillageAddress = {
      fullName: fullName.trim(),
      phoneNumber: cleanPhone,
      alternatePhone: alternatePhone.trim(),
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim() || '000000',
      landmark: landmark.trim(),
      deliveryInstructions: instructions.trim(),
      isDefault: true
    };

    await setActiveAddress(newAddress);

    if (returnToCheckout) {
      navigation.navigate('Checkout');
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={t('address')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            गाँव में सही डिलीवरी के लिए कृपया पास की जानी-मानी दुकान, मंदिर या स्कूल की पहचान (Landmark) अवश्य लिखें।
          </Text>
        </View>

        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('fullName')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="जैसे: रामेश्वर यादव"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('phoneNumber')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="10 अंकों का मोबाइल नंबर (जैसे: 9876543210)"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {/* Alternate Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>दूसरा मोबाइल नंबर (वैकल्पिक)</Text>
            <TextInput
              style={styles.input}
              placeholder="घर के किसी अन्य सदस्य का नंबर"
              keyboardType="phone-pad"
              maxLength={10}
              value={alternatePhone}
              onChangeText={setAlternatePhone}
            />
          </View>

          {/* Village */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('village')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="गाँव या कस्बे का नाम"
              value={village}
              onChangeText={setVillage}
            />
          </View>

          {/* District & State */}
          <View style={styles.rowFields}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>{t('district')} *</Text>
              <TextInput
                style={styles.input}
                placeholder="जिला"
                value={district}
                onChangeText={setDistrict}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>{t('pincode')}</Text>
              <TextInput
                style={styles.input}
                placeholder="पिन कोड"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
            </View>
          </View>

          {/* State */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('state')}</Text>
            <TextInput
              style={styles.input}
              placeholder="राज्य"
              value={state}
              onChangeText={setState}
            />
          </View>

          {/* Landmark */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>घर के पास की पहचान (Landmark) *</Text>
            <TextInput
              style={styles.input}
              placeholder="जैसे: प्राथमिक विद्यालय के पास, शिव मंदिर के पीछे, या शर्मा जी की दुकान"
              value={landmark}
              onChangeText={setLandmark}
            />
          </View>

          {/* Delivery Instructions */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>डिलीवरी निर्देश (वैकल्पिक)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="जैसे: घर पहुँचकर फोन करें या दोपहर 2 बजे के बाद आएं"
              multiline
              numberOfLines={3}
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>
        </View>

        <Button
          title="पता सुरक्षित करें (Save Address)"
          onPress={handleSave}
          variant="primary"
          style={styles.saveBtn}
        />
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
    padding: 16
  },
  infoBanner: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  infoText: {
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 18,
    fontWeight: '600'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },
  fieldGroup: {
    marginBottom: 14
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary
  },
  multilineInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  saveBtn: {
    width: '100%',
    marginBottom: 20
  }
});
