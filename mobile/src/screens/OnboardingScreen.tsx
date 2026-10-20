import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';
import { Button } from '../components/Button';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: NavigationProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: 'basket',
      titleHi: 'गाँव का अपना शुद्ध किराना',
      titleEn: 'Your Local Pure Grocery Store',
      descHi: 'आटा, दाल, शुद्ध सरसों तेल, मसाले और रोज़ का सामान अब सीधे आपके फोन पर।',
      descEn: 'Flour, pulses, pure mustard oil, spices and daily staples now on your mobile.'
    },
    {
      icon: 'home',
      titleHi: 'आसानी से दें गाँव का पता',
      titleEn: 'Simple Village Address',
      descHi: 'कोई कठिन पता नहीं, बस अपने गाँव का नाम और नज़दीकी पहचान (जैसे मंदिर या स्कूल) बताएं।',
      descEn: 'No complex maps needed, just enter your village name and a nearby landmark.'
    },
    {
      icon: 'cash',
      titleHi: 'सामान मिलने पर नकद दें',
      titleEn: 'Cash on Delivery (COD)',
      descHi: 'जब सामान आपके घर या दुकान पर पहुँचे, तभी रुपये दें। 100% सुरक्षित और भरोसेमंद।',
      descEn: 'Pay in cash only after receiving your items safely at your doorstep. 100% trustworthy.'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('CustomerAuth');
    }
  };

  const handleSkip = () => {
    navigation.replace('CustomerAuth');
  };

  const slide = slides[currentSlide];
  const title = currentLanguage === 'hi' ? slide.titleHi : slide.titleEn;
  const desc = currentLanguage === 'hi' ? slide.descHi : slide.descEn;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <Text style={styles.brandTag}>ShopEase • अपना बाज़ार</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Illustration & Text */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon as any} size={70} color={colors.primary} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>

      {/* Pagination & Next Button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        <Button
          title={
            currentSlide === slides.length - 1
              ? t('getStarted')
              : `${t('next')} ➔`
          }
          onPress={handleNext}
          variant="primary"
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 34,
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brandTag: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 16
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 10
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderWidth: 2,
    borderColor: '#FED7AA'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 14
  },
  desc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24
  },
  footer: {
    width: '100%'
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.primary
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E2E8F0'
  }
});
