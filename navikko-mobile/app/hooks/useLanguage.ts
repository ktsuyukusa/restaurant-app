import { useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

// Import language files
import en from '../../i18n/en.json';
import ja from '../../i18n/ja.json';
import zh from '../../i18n/zh.json';
import ko from '../../i18n/ko.json';
import th from '../../i18n/th.json';
import vi from '../../i18n/vi.json';
import ms from '../../i18n/ms.json';
import id from '../../i18n/id.json';
import pl from '../../i18n/pl.json';
import es from '../../i18n/es.json';
import ro from '../../i18n/ro.json';

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
  ko: { translation: ko },
  th: { translation: th },
  vi: { translation: vi },
  ms: { translation: ms },
  id: { translation: id },
  pl: { translation: pl },
  es: { translation: es },
  ro: { translation: ro },
};

// Initialize i18next
const i18n = new I18n();
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0], // Get device language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const useLanguage = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    // Set initial language based on device locale
    const deviceLanguage = Localization.locale.split('-')[0];
    const supportedLanguages = Object.keys(resources);
    
    if (supportedLanguages.includes(deviceLanguage)) {
      i18nInstance.changeLanguage(deviceLanguage);
      setCurrentLanguage(deviceLanguage);
    } else {
      // Fallback to English if device language is not supported
      i18nInstance.changeLanguage('en');
      setCurrentLanguage('en');
    }
  }, []);

  const changeLanguage = (language: string) => {
    if (Object.keys(resources).includes(language)) {
      i18nInstance.changeLanguage(language);
      setCurrentLanguage(language);
    }
  };

  const getSupportedLanguages = () => {
    return Object.keys(resources).map(code => ({
      code,
      name: getLanguageName(code),
    }));
  };

  const getLanguageName = (code: string): string => {
    const languageNames: { [key: string]: string } = {
      en: 'English',
      ja: '日本語',
      zh: '中文',
      ko: '한국어',
      th: 'ไทย',
      vi: 'Tiếng Việt',
      ms: 'Bahasa Melayu',
      id: 'Bahasa Indonesia',
      pl: 'Polski',
      es: 'Español',
      ro: 'Română',
    };
    return languageNames[code] || code;
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    getSupportedLanguages,
    getLanguageName,
  };
}; 