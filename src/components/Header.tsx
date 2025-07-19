import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, ShoppingCart, User, Bell, LogIn, LogOut, Settings, Crown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  onMenuClick: () => void;
  cartItemCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
  onRoleSwitcherClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  cartItemCount,
  onCartClick,
  onProfileClick,
  onAdminClick,
  onRoleSwitcherClick
}) => {
  const { t } = useLanguage();
  const { 
    userRole, 
    isAuthenticated, 
    user, 
    logout, 
    showAuthModal, 
    setShowAuthModal 
  } = useAppContext();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/AZ Dining Saku/Navikko2.svg"
                alt="Navikko" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-navikko-secondary hidden sm:block">
                Navikko
              </span>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCartClick}
              className="relative text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-navikko-action border border-white"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onProfileClick}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  title={`${user?.name || 'User'} (${userRole})`}
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                title="Login / Sign Up"
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
            
            {/* Admin Actions */}
            {onAdminClick && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAdminClick}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                title="Admin Menu Management"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            
            {onRoleSwitcherClick && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onRoleSwitcherClick}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                title={`Current Role: ${userRole} - Click to switch`}
              >
                <Crown className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
};

export default Header;