import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, ShoppingCart, User, Bell, Settings, Crown, LogIn, LogOut } from 'lucide-react';
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
    <header className="bg-gradient-to-r from-[#6CBF72] via-[#F4D35E] to-[#6CBF72] shadow-lg border-b border-[#F4D35E] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden text-white hover:bg-[#6CBF72] p-1 rounded-md transition-colors"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                src="/AZ Dining Saku/NAVIkko Green.png"
                alt="Navikko Logo" 
                className="w-20 h-12 sm:w-24 sm:h-14 object-contain flex-shrink-0 shadow-sm"
                style={{ minWidth: '80px', minHeight: '48px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCartClick}
              className="relative text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#892F25] border border-white"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onProfileClick}
                  className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
                  title={`${user?.name || 'User'} (${userRole})`}
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
                title="Login / Sign Up"
              >
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            
            {onAdminClick && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAdminClick}
                className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
                title="Admin Menu Management"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            
            {onRoleSwitcherClick && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onRoleSwitcherClick}
                className="text-white hover:bg-[#6CBF72] p-1 sm:p-2 rounded-md transition-colors"
                title={`Current Role: ${userRole} - Click to switch`}
              >
                <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
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