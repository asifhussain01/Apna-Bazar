import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { useLocalizationStore } from '../store/localizationStore';

type ScreenRouteProp = RouteProp<RootStackParamList, 'PolicyTerms'>;
type ScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'PolicyTerms'>;

interface Props {
  route: ScreenRouteProp;
  navigation: ScreenNavProp;
}

export const PolicyTermsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { type = 'privacy' } = route.params || {};
  const { t } = useLocalizationStore();

  const isTerms = type === 'terms';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title={isTerms ? t('termsOfService') : t('privacyPolicy')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {isTerms ? (
          <View style={styles.contentCard}>
            <Text style={styles.heading}>अपना बाज़ार: सेवा के नियम और शर्तें</Text>
            <Text style={styles.date}>अंतिम अद्यतन: अक्टूबर 2026</Text>

            <Text style={styles.sectionTitle}>1. सेवाओं का दायरा</Text>
            <Text style={styles.paragraph}>
              शॉपईज़ (अपना बाज़ार) ग्रामीण क्षेत्रों, परिवारों और गाँव के निवासियों के लिए एक स्थानीय किराना डिलीवरी सेवा है। हमारा लक्ष्य आपको उचित मूल्य पर बिना किसी बिचौलिए के शुद्ध किराना सामान आपके गाँव तक पहुँचाना है।
            </Text>

            <Text style={styles.sectionTitle}>2. मूल्य और भुगतान</Text>
            <Text style={styles.paragraph}>
              सभी सामानों के मूल्य पारदर्शी हैं। वर्तमान में हम मुख्य रूप से कैश ऑन डिलीवरी (COD) का समर्थन करते हैं। ग्राहक सामान मिलने के बाद संतुष्ट होकर नकद भुगतान कर सकते हैं।
            </Text>

            <Text style={styles.sectionTitle}>3. गाँव में डिलीवरी नियम</Text>
            <Text style={styles.paragraph}>
              ऑर्डर की डिलीवरी आपके द्वारा दिए गए गाँव के लैंडमार्क (पहचान) पर 2 से 4 घंटे के भीतर की जाती है। ₹499 या अधिक के ऑर्डर पर कोई डिलीवरी शुल्क नहीं लिया जाता है।
            </Text>

            <Text style={styles.sectionTitle}>4. ऑर्डर रद्दीकरण और वापसी</Text>
            <Text style={styles.paragraph}>
              ग्राहक सामान पैक होने या डिलीवरी के लिए रवाना होने से पहले कभी भी अपना ऑर्डर रद्द कर सकते हैं। डिलीवरी के समय खराब या अनुपयुक्त सामान को बिना किसी शुल्क के तुरंत वापस किया जा सकता है।
            </Text>
          </View>
        ) : (
          <View style={styles.contentCard}>
            <Text style={styles.heading}>शॉपईज़ - अपना बाज़ार: गोपनीयता नीति (Privacy Policy)</Text>
            <Text style={styles.date}>अंतिम अद्यतन: अक्टूबर 2026</Text>

            <Text style={styles.sectionTitle}>1. हम कौन सी जानकारी एकत्र करते हैं?</Text>
            <Text style={styles.paragraph}>
              हम केवल वही जानकारी एकत्र करते हैं जो आपके गाँव में सामान पहुँचाने के लिए आवश्यक है:
              {'\n'}• आपका नाम और मोबाइल नंबर
              {'\n'}• आपके गाँव का नाम, जिला और नज़दीकी पहचान (Landmark)
              {'\n'}• आपके द्वारा खरीदे गए सामान का विवरण
            </Text>

            <Text style={styles.sectionTitle}>2. हम बैंक कार्ड या पासवर्ड स्टोर नहीं करते</Text>
            <Text style={styles.paragraph}>
              हम किसी भी ग्राहक के डेबिट/क्रेडिट कार्ड, बैंक खाते की जानकारी या वित्तीय विवरण एकत्र अथवा सुरक्षित नहीं करते हैं। भुगतान पूर्ण रूप से नकद (COD) में होता है।
            </Text>

            <Text style={styles.sectionTitle}>3. डेटा सुरक्षा और गोपनीयता</Text>
            <Text style={styles.paragraph}>
              आपकी जानकारी किसी भी तीसरे पक्ष या विज्ञापन कंपनी को नहीं बेची जाती है। यह जानकारी केवल स्थानीय दुकानदार और डिलीवरी सहायक द्वारा ऑर्डर पूरा करने के लिए उपयोग की जाती है।
            </Text>

            <Text style={styles.sectionTitle}>4. खाता और डेटा हटाने का अधिकार (Right to Deletion)</Text>
            <Text style={styles.paragraph}>
              आप प्रोफाइल स्क्रीन में दिए गए 'खाता हटाएँ (Delete Account)' विकल्प पर क्लिक करके किसी भी समय अपनी सभी व्यक्तिगत जानकारी, पते और खाते को स्थायी रूप से हटा सकते हैं।
            </Text>
          </View>
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
  scroll: {
    padding: 16
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 24
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22
  }
});
