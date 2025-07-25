import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import RestaurantList from './RestaurantList';
import RestaurantDetails from './RestaurantDetails';
import RestaurantManagement from './RestaurantManagement';
import MenuManagement from './MenuManagement';
import ReservationManagement from './ReservationManagement';
import UserManagement from './UserManagement';
import RestaurantOwnerDashboard from './RestaurantOwnerDashboard';
import OrdersManagement from './OrdersManagement';
import RoleSwitcher from './RoleSwitcher';
import Profile from './Profile';
import SecureRoute from './SecureRoute';
import SubscriptionManagement from './SubscriptionManagement';
import SupabaseTest from './SupabaseTest';
import { Users, Store, MapPin } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { 
    sidebarOpen, 
    toggleSidebar,
    cartItems,
    currentView,
    setCurrentView,
    selectedRestaurantId,
    setSelectedRestaurantId,
    userRole,
    isRestaurantOwner,
    isAdmin,
    isCustomer,
    isAuthenticated,
    user,
    setShowAuthModal
  } = useAppContext();
  
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleRestaurantSelect = (id: string) => {
    setSelectedRestaurantId(id);
    setCurrentView('restaurant-details');
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurantId(null);
    setCurrentView('restaurants');
  };

  const handleCartClick = () => {
    setCurrentView('cart');
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleAdminClick = () => {
    setCurrentView('menu-management');
  };

  const handleRoleSwitcherClick = () => {
    setCurrentView('role-switcher');
  };

  const handleNavigate = (section: string) => {
    setCurrentView(section as 'dashboard' | 'orders' | 'menu-management' | 'restaurants' | 'subscription' | 'users' | 'reservations' | 'restaurant-details' | 'cart' | 'profile' | 'menus' | 'role-switcher');
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const renderCurrentView = () => {
    // Show welcome screen for unauthenticated users
    if (!isAuthenticated) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
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
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.multilingual')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('features.multilingual_desc')}</p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.restaurants')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('features.restaurants_desc')}</p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('features.location')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('features.location_desc')}</p>
            </div>
          </div>
          
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
            <div className="text-center text-sm text-gray-500">
              <p className="mb-3">By using this app, you agree to our</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link 
                  to="/terms-of-service" 
                  className="text-navikko-primary hover:underline"
                >
                  Terms of Service
                </Link>
                <span className="hidden sm:inline">, and</span>
                <Link 
                  to="/privacy-policy" 
                  className="text-navikko-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                <span className="hidden sm:inline">, and</span>
                <Link 
                  to="/commercial-transaction-act" 
                  className="text-navikko-primary hover:underline"
                >
                  特定商取引法
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default to restaurants view for authenticated users
    if (currentView === 'restaurants' || !currentView) {
      return <RestaurantList onViewDetails={handleRestaurantSelect} />;
    }

    switch (currentView) {
      // Restaurant Owner Views (with SecureRoute)
      case 'dashboard':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <RestaurantOwnerDashboard />
          </SecureRoute>
        );
      case 'orders':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <OrdersManagement />
          </SecureRoute>
        );
      case 'menu-management':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <MenuManagement />
          </SecureRoute>
        );
      case 'restaurants':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <RestaurantManagement />
          </SecureRoute>
        );
      case 'subscription':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <SubscriptionManagement />
          </SecureRoute>
        );
      
      // Admin-only Views (with SecureRoute)
      case 'users':
        return (
          <SecureRoute requiredRole="admin">
            <UserManagement />
          </SecureRoute>
        );
      case 'reservations':
        return (
          <SecureRoute requiredRole="admin">
            <ReservationManagement />
          </SecureRoute>
        );
      
      // Customer Views (no restrictions needed)
      case 'restaurant-details':
        return selectedRestaurantId ? (
          <RestaurantDetails 
            restaurantId={selectedRestaurantId} 
            onBack={handleBackToRestaurants}
          />
        ) : (
          <div className="p-4 sm:p-8 text-center bg-white rounded-lg shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-navikko-secondary">Restaurant not found</h2>
            <p className="text-navikko-secondary text-sm sm:text-base">Please select a restaurant from the list.</p>
          </div>
        );
      case 'cart':
        return (
          <div className="p-4 sm:p-8 bg-white rounded-lg shadow-sm border-navikko-primary/20 border">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-navikko-secondary">{t('nav.cart')}</h2>
            {cartItems.length === 0 ? (
              <p className="text-navikko-secondary text-center text-sm sm:text-base">{t('cart.empty')}</p>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-navikko-background rounded-lg border border-navikko-primary/20 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate text-navikko-secondary">{item.name}</h3>
                        <p className="text-navikko-secondary text-xs sm:text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm sm:text-base flex-shrink-0 text-navikko-action">¥{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="text-lg sm:text-xl font-bold text-center text-navikko-action">
                  {t('cart.total')}: ¥{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        );
      case 'profile':
        return <Profile />;
      
      // Legacy views (with SecureRoute)
      case 'menus':
        return (
          <SecureRoute requiredRole="restaurant_owner">
            <MenuManagement />
          </SecureRoute>
        );
      
      // Development/Testing (admin only)
      case 'role-switcher':
        return (
          <SecureRoute requiredRole="admin">
            <RoleSwitcher />
          </SecureRoute>
        );
      
      default:
        // Default view based on user role with proper access control
        if (isRestaurantOwner) {
          return (
            <SecureRoute requiredRole="restaurant_owner">
              <RestaurantOwnerDashboard />
            </SecureRoute>
          );
        }
        return <RestaurantList onViewDetails={handleRestaurantSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={toggleSidebar}
        cartItemCount={cartItemCount}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
        onAdminClick={handleAdminClick}
        onRoleSwitcherClick={handleRoleSwitcherClick}
      />
      
      {isAuthenticated && (
        <Navigation 
          onNavigate={handleNavigate}
          currentSection={currentView}
        />
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full">
          {renderCurrentView()}
        </div>
      </main>
      
      {/* Footer with Policy Links */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-4 sm:mb-0">
              <p>&copy; 2024 WaSanDo 和讃堂. All rights reserved.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/privacy-policy" 
                className="text-navikko-primary hover:underline"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-navikko-primary hover:underline"
              >
                Terms of Service
              </Link>
              <Link 
                to="/commercial-transaction-act" 
                className="text-navikko-primary hover:underline"
              >
                特定商取引法
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;