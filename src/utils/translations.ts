// Translation utilities for Navikko app
// This file provides utility functions for handling translations across the app

import { dictionary } from './dictionary';
import { authTranslations } from './authTranslations';

/**
 * Translates a key into the specified language
 * First checks auth-specific translations, then falls back to general dictionary
 * @param key The translation key to look up
 * @param defaultValue Optional fallback value if no translation is found
 * @param lang The target language code (optional, defaults to current language)
 * @returns The translated string
 */
export const translate = (key: string, defaultValue?: string, lang?: string): string => {
  lang = lang || 'ja'; // Default to Japanese if no language specified
  try {
    // Check for auth-specific translations first
    if (key.startsWith('auth.')) {
      const authTranslation = authTranslations[lang]?.[key];
      if (authTranslation) {
        return authTranslation;
      }
    }

    // Fall back to general dictionary
    const translation = dictionary[lang] ? dictionary[lang][key] : undefined;
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
      return defaultValue || key.split('.').pop() || key;
    }
    return translation;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return defaultValue || key;
  }
};

/**
 * Get the name of a language in its native form
 * @param code The language code (e.g., 'en', 'ja')
 * @returns The native name of the language
 */
export const getLanguageName = (code: string): string => {
  const languageNames: { [key: string]: string } = {
    en: 'English',
    ja: '日本語',
    pl: 'Polski',
    zh: '中文',
    ko: '한国어',
    ms: 'Bahasa Melayu',
    id: 'Bahasa Indonesia',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    es: 'Español',
    ro: 'Română',
  };
  return code in languageNames ? languageNames[code] : code;
};