import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';
import { LanguageCode } from '../i18n/i18n';
import { Button } from '../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSelect'>;

interface Props {
  navigation: NavigationProp;
}

export const LanguageSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, setLanguage, t } = useLocalizationStore();

  const handleSelect = async (lang: LanguageCode) => {
    await setLanguage(lang);
  };

  const handleContinue = () => {
    navigation.replace('Onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="language" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>अपनी भाषा चुनें</Text>
        <Text style={styles.englishTitle}>Choose your preferred language</Text>
        <Text style={styles.subtext}>आप इसे बाद में कभी भी बदल सकते हैं</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Hindi Option */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.langCard,
            currentLanguage === 'hi' && styles.langCardSelected
          ]}
          onPress={() => handleSelect('hi')}
        >
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.badgeCircle,
                currentLanguage === 'hi' && styles.badgeCircleSelected
              ]}
            >
              <Text
                style={[
                  styles.badgeChar,
                  currentLanguage === 'hi' && styles.badgeCharSelected
                ]}
              >
                अ
              </Text>
            </View>
            <View>
              <Text style={styles.primaryLangText}>हिन्दी (Hindi)</Text>
              <Text style={styles.secondaryLangText}>गाँव, कस्बा और परिवार के लिए</Text>
            </View>
          </View>

          <View style={styles.radio}>
            {currentLanguage === 'hi' && (
              <Ionicons name="checkmark-circle" size={28} color={colors.secondary} />
            )}
          </View>
        </TouchableOpacity>

        {/* English Option */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.langCard,
            currentLanguage === 'en' && styles.langCardSelected
          ]}
          onPress={() => handleSelect('en')}
        >
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.badgeCircle,
                currentLanguage === 'en' && styles.badgeCircleSelected
              ]}
            >
              <Text
                style={[
                  styles.badgeChar,
                  currentLanguage === 'en' && styles.badgeCharSelected
                ]}
              >
                A
              </Text>
            </View>
            <View>
              <Text style={styles.primaryLangText}>English</Text>
              <Text style={styles.secondaryLangText}>Simple English mode</Text>
            </View>
          </View>

          <View style={styles.radio}>
            {currentLanguage === 'en' && (
              <Ionicons name="checkmark-circle" size={28} color={colors.secondary} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title={currentLanguage === 'hi' ? 'आगे बढ़ें (Continue)' : 'Continue'}
          onPress={handleContinue}
          variant="primary"
          size="large"
          icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: 20
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary
  },
  englishTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4
  },
  subtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6
  },
  cardContainer: {
    marginVertical: 20
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
    backgroundColor: '#F8FAFC'
  },
  langCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badgeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  badgeCircleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  badgeChar: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary
  },
  badgeCharSelected: {
    color: '#FFFFFF'
  },
  primaryLangText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  secondaryLangText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  radio: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    width: '100%'
  }
});
