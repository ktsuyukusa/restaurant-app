import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Store, MapPin, Clock, Star } from 'lucide-react';
import AppStatus from '@/components/AppStatus';

const Index: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { setShowAuthModal } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navikko-background to-navikko-primary/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* App Status Component */}
        <AppStatus />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-navikko-primary rounded-full flex items-center justify-center">
              <Globe className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-navikko-secondary mb-4">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.multilingual')}</h3>
            <p className="text-gray-600">{t('features.multilingual_desc')}</p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.restaurants')}</h3>
            <p className="text-gray-600">{t('features.restaurants_desc')}</p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.location')}</h3>
            <p className="text-gray-600">{t('features.location_desc')}</p>
          </Card>
        </div>

        {/* Language Support */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('languages.supported')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['en', 'ja', 'zh', 'ko'].map((lang) => (
                <Badge 
                  key={lang} 
                  variant={currentLanguage === lang ? "default" : "outline"}
                  className="text-sm"
                >
                  {t(`languages.${lang}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-navikko-secondary mb-4">
            {t('welcome.signup_message')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-navikko-primary text-white rounded-lg hover:bg-navikko-primary/90 transition-colors font-semibold"
            >
              {t('welcome.get_started')}
            </button>
          </div>
          
          {/* Policy Links */}
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">By using this app, you agree to our</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a 
                href="/terms-of-service" 
                className="text-navikko-primary hover:underline"
              >
                Terms of Service
              </a>
              <span className="hidden sm:inline">,</span>
              <a 
                href="/privacy-policy" 
                className="text-navikko-primary hover:underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
