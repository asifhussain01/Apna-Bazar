import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode, translate } from '../i18n/i18n';

interface LocalizationState {
  currentLanguage: LanguageCode;
  isLanguageSelected: boolean;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
  t: (key: string) => string;
}

const STORAGE_KEY = '@shopease_app_lang';
const ONBOARDING_KEY = '@shopease_lang_selected';

export const useLocalizationStore = create<LocalizationState>((set, get) => ({
  currentLanguage: 'hi', // Default to Hindi for rural villagers
  isLanguageSelected: false,

  setLanguage: async (lang: LanguageCode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      set({ currentLanguage: lang, isLanguageSelected: true });
    } catch (e) {
      set({ currentLanguage: lang, isLanguageSelected: true });
    }
  },

  loadSavedLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
      const isSelected = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (savedLang === 'en' || savedLang === 'hi') {
        set({ currentLanguage: savedLang, isLanguageSelected: isSelected === 'true' });
      }
    } catch (e) {
      // keep default
    }
  },

  t: (key: string) => {
    const lang = get().currentLanguage;
    return translate(key, lang);
  }
}));
