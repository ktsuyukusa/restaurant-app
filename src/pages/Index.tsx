import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Store, MapPin, Star } from 'lucide-react';

const Index: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { setShowAuthModal } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-navikko-primary rounded-full flex items-center justify-center shadow-lg">
              <img 
                src="/AZ Dining Saku/Navikko2.svg"
                alt="Navikko" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8 border border-gray-200 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.multilingual')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.multilingual_desc')}</p>
          </Card>

          <Card className="text-center p-8 border border-gray-200 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.restaurants')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.restaurants_desc')}</p>
          </Card>

          <Card className="text-center p-8 border border-gray-200 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.location')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.location_desc')}</p>
          </Card>
        </div>

        {/* Language Support */}
        <Card className="mb-16 border border-gray-200 bg-white rounded-xl shadow-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-navikko-primary" />
                <h2 className="text-2xl font-bold text-gray-900">{t('languages.supported')}</h2>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['en', 'ja', 'pl', 'zh', 'ko', 'ms', 'id', 'vi', 'th', 'es', 'ro'].map((lang) => (
                <Badge 
                  key={lang} 
                  variant={currentLanguage === lang ? "default" : "outline"}
                  className={`text-sm px-4 py-2 rounded-lg ${
                    currentLanguage === lang 
                      ? 'bg-navikko-primary text-white' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t(`languages.${lang}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-700 mb-8 text-lg">
            {t('welcome.signup_message')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 bg-navikko-primary text-white rounded-lg hover:bg-navikko-primary/90 transition-colors font-semibold text-lg shadow-sm"
            >
              {t('welcome.get_started')}
            </button>
          </div>
          
          {/* Policy Links */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p className="mb-3">By using this app, you agree to our</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a 
                href="/terms-of-service" 
                className="text-navikko-primary hover:underline"
              >
                Terms of Service
              </a>
              <span className="hidden sm:inline">, and</span>
              <a 
                href="/privacy-policy" 
                className="text-navikko-primary hover:underline"
              >
                Privacy Policy
              </a>
              <span className="hidden sm:inline">, and</span>
              <a 
                href="/commercial-transaction-act" 
                className="text-navikko-primary hover:underline"
              >
                特定商取引法
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
