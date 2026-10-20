import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useLocalizationStore } from '../store/localizationStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HelpContact'>;

interface Props {
  navigation: NavigationProp;
}

export const HelpContactScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();

  const [showCallModal, setShowCallModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const shopPhone = '+919876543210';
  const shopWhatsapp = '+919876543210';

  const faqs = [
    {
      qHi: 'कैश ऑन डिलीवरी (COD) कैसे काम करता है?',
      qEn: 'How does Cash on Delivery (COD) work?',
      aHi: 'जब डिलीवरी बॉय आपका सामान आपके गाँव में लेकर पहुँचेगा, तब आपको सामान देखकर नकद रुपये देने होंगे। ऑनलाइन भुगतान या बैंक कार्ड की कोई ज़रूरत नहीं है।',
      aEn: 'You pay in cash directly to our delivery boy when your items arrive at your village. No cards or online banking required.'
    },
    {
      qHi: 'गाँव में सामान कितनी देर में पहुँचता है?',
      qEn: 'How long does village delivery take?',
      aHi: 'ऑर्डर मिलने के बाद दुकानदार सामान पैक करता है और 2 से 4 घंटे के भीतर आपके बताए गए पते या लैंडमार्क पर डिलीवरी कर दी जाती है।',
      aEn: 'Orders are typically packed and delivered to your designated village landmark within 2 to 4 hours.'
    },
    {
      qHi: 'अगर कोई सामान खराब या गलत आ जाए तो क्या करें?',
      qEn: 'What if an item is damaged or missing?',
      aHi: 'डिलीवरी लेते समय ही सामान चेक कर लें। यदि कोई सामान नहीं चाहिए या खराब है, तो तुरंत डिलीवरी बॉय को वापस कर दें या दुकानदार को फोन करें। केवल लिए गए सामान के पैसे दें।',
      aEn: 'Inspect the items upon delivery. You can return any unwanted or damaged items immediately to the delivery boy.'
    },
    {
      qHi: 'मुफ़्त डिलीवरी (Free Delivery) के क्या नियम हैं?',
      qEn: 'What are the rules for Free Delivery?',
      aHi: '₹499 या उससे अधिक के ऑर्डर पर गाँव में कोई डिलीवरी शुल्क नहीं लगता। ₹499 से कम के ऑर्डर पर केवल ₹20 का न्यूनतम डिलीवरी शुल्क लिया जाता है।',
      aEn: 'Orders of ₹499 and above receive FREE village delivery. Smaller orders carry a nominal ₹20 delivery fee.'
    }
  ];

  const handleCall = () => {
    setShowCallModal(false);
    Linking.openURL(`tel:${shopPhone}`);
  };

  const handleWhatsapp = () => {
    setShowWhatsappModal(false);
    const text = encodeURIComponent('नमस्ते, मुझे अपना बाज़ार से सामान के बारे में जानकारी चाहिए।');
    Linking.openURL(`https://wa.me/${shopWhatsapp.replace(/[^0-9]/g, '')}?text=${text}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="मदद और दुकानदार संपर्क"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Shopkeeper Profile Card */}
        <View style={styles.shopCard}>
          <View style={styles.shopIconCircle}>
            <Ionicons name="storefront" size={32} color={colors.primary} />
          </View>
          <Text style={styles.shopName}>अपना बाज़ार ग्राहक सहायता केंद्र</Text>
          <Text style={styles.shopAddress}>
            मुख्य बाज़ार, ग्राम पंचायत भवन के पास
          </Text>

          <View style={styles.timingPill}>
            <Ionicons name="time-outline" size={16} color={colors.secondaryDark} />
            <Text style={styles.timingText}>
              समय: सुबह 7:30 से रात 8:30 (सातों दिन)
            </Text>
          </View>

          {/* Contact Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => setShowCallModal(true)}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callBtnText}>सीधे फोन करें</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => setShowWhatsappModal(true)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>व्हाट्सएप चैट</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs Accordion */}
        <View style={styles.faqSection}>
          <Text style={styles.faqHeading}>{t('faqs')}</Text>

          {faqs.map((faq, index) => {
            const question = currentLanguage === 'hi' ? faq.qHi : faq.qEn;
            const answer = currentLanguage === 'hi' ? faq.aHi : faq.aEn;
            const isOpen = openFaqIndex === index;

            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Call Shopkeeper Modal */}
      <ConfirmationModal
        visible={showCallModal}
        title="दुकानदार को कॉल करें"
        message={`क्या आप दुकानदार रमेश जी (${shopPhone}) को कॉल करना चाहते हैं?`}
        confirmLabel="हाँ, कॉल करें (Call)"
        onConfirm={handleCall}
        onCancel={() => setShowCallModal(false)}
      />

      {/* WhatsApp Modal */}
      <ConfirmationModal
        visible={showWhatsappModal}
        title="व्हाट्सएप खोलें"
        message="क्या आप दुकानदार से व्हाट्सएप पर बातचीत शुरू करना चाहते हैं?"
        confirmLabel="व्हाट्सएप खोलें (Open WhatsApp)"
        onConfirm={handleWhatsapp}
        onCancel={() => setShowWhatsappModal(false)}
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
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },
  shopIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  shopName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  shopAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10
  },
  timingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12
  },
  timingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryDark,
    marginLeft: 6
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 18,
    width: '100%',
    justifyContent: 'space-between'
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6
  },
  faqSection: {
    marginBottom: 20
  },
  faqHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 10
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20
  }
});
