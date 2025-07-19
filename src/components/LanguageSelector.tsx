import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const languageFlags = {
    en: '🇺🇸',
    ja: '🇯🇵',
    pl: '🇵🇱',
    zh: '🇨🇳',
    ko: '🇰🇷',
    ms: '🇲🇾',
    id: '🇮🇩',
    vi: '🇻🇳',
    th: '🇹🇭',
    es: '🇪🇸',
    ro: '🇷🇴'
  };

  const languageNames = {
    en: 'English',
    ja: '日本語',
    pl: 'Polski',
    zh: '中文',
    ko: '한국어',
    ms: 'Bahasa Melayu',
    id: 'Bahasa Indonesia',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    es: 'Español',
    ro: 'Română'
  };

  return (
    <Select value={currentLanguage} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto min-w-[120px] h-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-navikko-primary/20 focus:border-navikko-primary">
        <div className="flex items-center gap-2 px-2">
          <span className="text-sm">{languageFlags[currentLanguage as keyof typeof languageFlags]}</span>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {languageNames[currentLanguage as keyof typeof languageNames]}
          </span>
          <span className="text-xs font-medium text-gray-700 sm:hidden">
            {currentLanguage.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </div>
      </SelectTrigger>
      <SelectContent className="w-48 bg-white border-gray-200 shadow-lg rounded-lg">
        {availableLanguages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code} 
            className="text-sm hover:bg-gray-50 focus:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center gap-3 py-1">
              <span className="text-base">{languageFlags[lang.code as keyof typeof languageFlags]}</span>
              <span className="font-medium text-gray-700">{languageNames[lang.code as keyof typeof languageNames]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;