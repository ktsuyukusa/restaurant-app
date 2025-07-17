import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  const languageFlags = {
    en: '🇺🇸',
    ja: '🇯🇵',
    pl: '🇵🇱'
  };

  return (
    <Select value={currentLanguage} onValueChange={setLanguage}>
      <SelectTrigger className="w-24 sm:w-32 lg:w-40 text-white border-blue-300 hover:bg-blue-500 bg-blue-600 rounded-md transition-colors">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{languageFlags[currentLanguage as keyof typeof languageFlags]}</span>
          <span className="truncate text-xs sm:text-sm">
            <SelectValue />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-w-48 bg-white border-blue-200 shadow-lg">
        {availableLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-sm hover:bg-blue-50 focus:bg-blue-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0">{languageFlags[lang.code as keyof typeof languageFlags]}</span>
              <span className="truncate text-blue-800">{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;