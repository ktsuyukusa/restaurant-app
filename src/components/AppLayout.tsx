import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
    setCurrentView(section as any);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const renderCurrentView = () => {
    // Show welcome screen for unauthenticated users
    if (!isAuthenticated) {
      return (
        <div className="p-4 sm:p-8 text-center bg-white rounded-lg shadow-sm border-navikko-primary/20 border">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-navikko-secondary">
              {t('welcome.title')}
            </h1>
            <p className="text-lg text-navikko-secondary mb-8">
              {t('welcome.subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">{t('welcome.for_customers')}</h3>
                <p className="text-sm text-blue-700">
                  {t('welcome.for_customers_desc')}
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">{t('welcome.for_owners')}</h3>
                <p className="text-sm text-green-700">
                  {t('welcome.for_owners_desc')}
                </p>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">{t('welcome.for_admins')}</h3>
                <p className="text-sm text-purple-700">
                  {t('welcome.for_admins_desc')}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-navikko-secondary mb-4">
                {t('welcome.signup_message')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-navikko-primary text-white rounded-lg hover:bg-navikko-primary/90 transition-colors font-semibold"
                >
                  {t('welcome.get_started')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      // Restaurant Owner & Admin Views
      case 'dashboard':
        return (isRestaurantOwner || isAdmin) ? <RestaurantOwnerDashboard /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      case 'orders':
        return (isRestaurantOwner || isAdmin) ? <OrdersManagement /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      case 'menu-management':
        return (isRestaurantOwner || isAdmin) ? <MenuManagement /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      case 'restaurants':
        return (isRestaurantOwner || isAdmin) ? <RestaurantManagement /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      
      // Admin-only Views
      case 'users':
        return isAdmin ? <UserManagement /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      case 'reservations':
        return isAdmin ? <ReservationManagement /> : <RestaurantList onViewDetails={handleRestaurantSelect} />;
      
      // Customer Views
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
      
      // Legacy views
      case 'menus':
        return <MenuManagement />;
      
      // Development/Testing
      case 'role-switcher':
        return <RoleSwitcher />;
      
      default:
        // Default view based on user role
        if (isRestaurantOwner) {
          return <RestaurantOwnerDashboard />;
        }
        return <RestaurantList onViewDetails={handleRestaurantSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-navikko-background">
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
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
        <div className="w-full overflow-hidden">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;