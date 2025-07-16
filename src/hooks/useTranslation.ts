// useTranslation.ts
import { translations, SupportedLang } from '../i18n';
import { UserPreferences } from '../types';

// Add type for translation objects
interface TranslationDict {
  [key: string]: string;
}

export function useTranslation(preferences: UserPreferences) {
  const lang: SupportedLang = (preferences.language as SupportedLang) || 'en';
  const t = (key: string): string => {
    const langDict = translations[lang] as TranslationDict;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // fallback to English
    const enDict = translations.en as TranslationDict;
    return enDict[key] || key;
  };
  return { t, lang };
} 