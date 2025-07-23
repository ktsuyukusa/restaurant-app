import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translate, getLanguageName } from '@/utils/translations';

type Language = 'en' | 'ja' | 'pl' | 'zh' | 'ko' | 'ms' | 'id' | 'vi' | 'th' | 'es' | 'ro';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
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
  const [currentLanguage, setCurrentLanguage] = useState<Language>('jp');

  const availableLanguages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'ja' as Language, name: '日本語' },
    { code: 'pl' as Language, name: 'Polski' },
    { code: 'zh' as Language, name: '中文' },
    { code: 'ko' as Language, name: '한국어' },
    { code: 'ms' as Language, name: 'Bahasa Melayu' },
    { code: 'id' as Language, name: 'Bahasa Indonesia' },
    { code: 'vi' as Language, name: 'Tiếng Việt' },
    { code: 'th' as Language, name: 'ไทย' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'ro' as Language, name: 'Română' }
  ];

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translate(key, currentLanguage);
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
      });
    }
    
    return translation;
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
