import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dictionary, Language, TranslationKey } from '@/utils/dictionary';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const availableLanguages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'ja' as Language, name: '日本語' },
    { code: 'pl' as Language, name: 'Polski' },
    { code: 'th' as Language, name: 'ไทย' },
    { code: 'ms' as Language, name: 'Bahasa Melayu' },
    { code: 'id' as Language, name: 'Bahasa Indonesia' },
    { code: 'es' as Language, name: 'Español' }
  ];

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: TranslationKey): string => {
    return dictionary[currentLanguage][key] || dictionary.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}