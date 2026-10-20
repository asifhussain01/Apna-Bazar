import hi from './hi.json';
import en from './en.json';

export type LanguageCode = 'hi' | 'en';

const translations: Record<LanguageCode, Record<string, string>> = {
  hi,
  en
};

export const translate = (key: string, lang: LanguageCode = 'hi'): string => {
  const dict = translations[lang] || translations.hi;
  return dict[key] || key;
};
