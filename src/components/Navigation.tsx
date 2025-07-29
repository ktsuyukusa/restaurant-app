import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Store, BookOpen, Calendar, BarChart3, Settings, ShoppingCart, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';

interface NavigationProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentSection }) => {
  const { t } = useLanguage();
  const { userRole, isRestaurantOwner, isAdmin, isCustomer } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Customer navigation items
  const customerNavigationItems = [
    { id: 'restaurants', label: t('restaurants'), icon: Store },
    { id: 'cart', label: t('nav.cart'), icon: ShoppingCart },
  ];

  // Restaurant owner navigation items
  const restaurantOwnerNavigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'orders', label: t('orders'), icon: Calendar },
    { id: 'menu-management', label: t('menu_management'), icon: BookOpen },
    { id: 'restaurants', label: t('restaurants'), icon: Store },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  // Admin navigation items (includes everything)
  const adminNavigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'orders', label: t('orders'), icon: Calendar },
    { id: 'menu-management', label: t('menu_management'), icon: BookOpen },
    { id: 'restaurants', label: t('restaurants'), icon: Store },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'reservations', label: t('reservation'), icon: Calendar },
  ];

  // Select navigation items based on user role
  const getNavigationItems = () => {
    if (isAdmin) return adminNavigationItems;
    if (isRestaurantOwner) return restaurantOwnerNavigationItems;
    return customerNavigationItems;
  };

  const navigationItems = getNavigationItems();

  // Get current section from URL path
  const getCurrentSectionFromPath = () => {
    const path = location.pathname.split('/')[1] || 'restaurants';
    return path;
  };

  const currentSectionFromPath = getCurrentSectionFromPath();

  const handleNavigation = (section: string) => {
    navigate(`/${section}`);
    onNavigate(section);
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center sm:justify-start gap-1 py-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSectionFromPath === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`flex items-center gap-2 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-navikko-primary text-white hover:bg-navikko-primary/90 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;