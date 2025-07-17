import React from 'react';
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
  
  // Customer navigation items
  const customerNavigationItems = [
    { id: 'restaurants', label: t('restaurants'), icon: Store },
    { id: 'cart', label: t('nav.cart'), icon: ShoppingCart },
  ];

  // Restaurant owner navigation items
  const restaurantOwnerNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: Calendar },
    { id: 'menu-management', label: 'Menu Management', icon: BookOpen },
    { id: 'restaurants', label: t('restaurants'), icon: Store },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  // Admin navigation items (includes everything)
  const adminNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: Calendar },
    { id: 'menu-management', label: 'Menu Management', icon: BookOpen },
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

  return (
    <nav className="bg-gradient-to-r from-[#F8FDF7] to-[#F4D35E] shadow-sm border-b border-[#6CBF72]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant={currentSection === item.id ? 'default' : 'ghost'}
                className={`flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap rounded-md transition-all duration-200 ${
                  currentSection === item.id 
                    ? 'bg-[#6CBF72] text-white hover:bg-[#5ba865] shadow-md' 
                    : 'text-[#007C91] hover:bg-[#6CBF72] hover:text-white'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;