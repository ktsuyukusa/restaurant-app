import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Store, MapPin, Star } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

type Language = 'en' | 'ja' | 'pl' | 'zh' | 'ko' | 'ms' | 'id' | 'vi' | 'th' | 'es' | 'ro';

const Index: React.FC = () => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { setShowAuthModal, showAuthModal, isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img 
              src={import.meta.env.VITE_LOGO_URL || '/AZ Dining Saku/Navikko2.svg'} 
              alt="Navikko" 
              className="h-16 w-auto"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="text-4xl font-bold text-navikko-primary hidden">
              Navikko
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.multilingual')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.multilingual_desc')}</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app')}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.restaurants')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.restaurants_desc')}</p>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                Browse Restaurants
              </Button>
            </div>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.location')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('features.location_desc')}</p>
          </div>
        </div>

        {/* Language Support Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('languages.supported')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['en', 'ja', 'pl', 'zh', 'ko', 'ms', 'id', 'vi', 'th', 'es', 'ro'].map((lang) => (
              <Badge 
                key={lang} 
                variant={currentLanguage === lang ? "default" : "outline"}
                className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentLanguage === lang 
                    ? 'bg-navikko-primary text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-navikko-primary'
                }`}
                onClick={() => setLanguage(lang as Language)}
              >
                {t(`languages.${lang}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-navikko-primary hover:bg-navikko-primary/90 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {t('welcome.get_started')}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="text-left text-sm text-gray-500">
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">事業者情報 / Business Information</h3>
                <p>事業者名: WaSanDo 和讃堂</p>
                <p>所在地: 〒386-0005 長野県上田市古里1499-28</p>
                <p>Address: 1499-28 Kosato, Ueda, Nagano, 386-0005 Japan</p>
                <p>電子メール: info@wasando.com</p>
                <p>
                  WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">お問い合わせ</a>
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-left">
                <a 
                  href="/terms-of-service" 
                  className="text-navikko-primary hover:underline"
                >
                  利用規約 / Terms of Service
                </a>
                <a 
                  href="/privacy-policy" 
                  className="text-navikko-primary hover:underline"
                >
                  プライバシーポリシー / Privacy Policy
                </a>
                <a 
                  href="/commercial-transaction-act" 
                  className="text-navikko-primary hover:underline"
                >
                  特定商取引法に基づく表記
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Index;
