import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import authService from '@/services/authService';
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
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Extract current view from URL path
  const getCurrentViewFromPath = (pathname: string) => {
    const path = pathname.split('/')[1] || 'restaurants';
    return path;
  };

  const currentView = getCurrentViewFromPath(location.pathname);

  // Handle restaurant selection from URL
  useEffect(() => {
    if (location.pathname.startsWith('/restaurant/') && params.id) {
      setSelectedRestaurantId(params.id);
    } else if (location.pathname === '/restaurants') {
      setSelectedRestaurantId(null);
    }
  }, [location.pathname, params.id, setSelectedRestaurantId]);

  const handleRestaurantSelect = (id: string) => {
    setSelectedRestaurantId(id);
    navigate(`/restaurant/${id}`);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurantId(null);
    navigate('/restaurants');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAdminClick = () => {
    navigate('/menu-management');
  };

  const handleRoleSwitcherClick = () => {
    navigate('/role-switcher');
  };

  const handleNavigate = (section: string) => {
    navigate(`/${section}`);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const renderCurrentView = () => {
    // Debug information (remove in production)
    const debugInfo = {
      isAuthenticated,
      userRole,
      currentView,
      pathname: location.pathname,
      user: user ? { id: user.id, email: user.email, userType: user.userType } : null,
      authService: {
        currentUser: authService.getCurrentUser() ? { 
          id: authService.getCurrentUser()?.id, 
          email: authService.getCurrentUser()?.email, 
          userType: authService.getCurrentUser()?.userType 
        } : null,
        isAuthenticated: authService.isAuthenticated(),
        isAdmin: authService.isAdmin(),
        isRestaurantOwner: authService.isRestaurantOwner(),
        isCustomer: authService.isCustomer()
      }
    };
    
    console.log('🔍 AppLayout Debug:', debugInfo);

    // Show welcome screen for unauthenticated users
    if (!isAuthenticated) {
      console.log('🚫 User not authenticated, showing welcome screen');
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="mb-8">
              <img 
                src="/logo/NAVIkko Green.webp" 
                alt="NAVIkko" 
                className="h-16 sm:h-20 mx-auto mb-6"
              />
              <h1 className="text-3xl sm:text-4xl font-bold text-navikko-secondary mb-4">
                {t('welcome.title')}
              </h1>
              <p className="text-lg sm:text-xl text-navikko-secondary/80 mb-6">
                {t('welcome.subtitle')}
              </p>
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
        </div>
      );
    }

    console.log('✅ User authenticated, rendering view:', currentView);

    // Route-based rendering
    switch (currentView) {
      case 'restaurants':
        return <RestaurantList onViewDetails={handleRestaurantSelect} />;
      
      case 'restaurant':
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
      
      // Development/Testing (admin only)
      case 'role-switcher':
        return (
          <SecureRoute requiredRole="admin">
            <RoleSwitcher />
          </SecureRoute>
        );
      
      default:
        // Default to restaurants view for authenticated users
        console.log('🔄 Defaulting to restaurants view');
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
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-3">© 2024 NAVIkko. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link 
                to="/terms-of-service" 
                className="text-navikko-primary hover:underline"
              >
                Terms of Service
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link 
                to="/privacy-policy" 
                className="text-navikko-primary hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
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