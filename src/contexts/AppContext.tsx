import React, { useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import authService, { User, SignupData } from '@/services/authService';
import { AppContext, AppContextType, CartItem, UserRole } from './AppContextDefinition';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  
  // Load user role from localStorage or default to null
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('navikko_user_role');
    return (savedRole as UserRole) || null;
  });

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load user data on mount with security validation
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      // Allow all users to be loaded from storage (authService handles 2FA validation)
      console.log('🔍 AppContext: Loading user from storage:', user.email, user.userType);
      setUser(user);
      setUserRole(user.userType);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ 
      title: 'Added to cart', 
      description: item.name 
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Role-based access control functions
  const hasRole = (role: 'customer' | 'restaurant_owner'): boolean => {
    if (!user) return false;
    
    // Super admin can access all roles
    if (user.adminAccess?.level === 'super_admin') {
      return true;
    }
    
    // Admin can access all roles
    if (user.adminAccess) {
      return true;
    }
    
    return userRole === role;
  };

  const isAdmin = user?.adminAccess ? true : false;
  const isRestaurantOwner = hasRole('restaurant_owner');
  const isCustomer = hasRole('customer');

  // Enhanced access control with security validation
  const canAccessAdminFeatures = (): boolean => {
    if (!user) {
      console.log('🔒 Admin features access denied: No user');
      return false;
    }
    
    console.log('🔍 Admin access check - User:', user.email, 'Type:', user.userType);
    console.log('🔍 Admin access check - AuthService isAdmin:', authService.isAdmin());
    console.log('🔍 Admin access check - AuthService isAuthenticated:', authService.isAuthenticated());
    
    // For development: Allow admin users even without 2FA if they have adminAccess
    if (user.adminAccess) {
      console.log('🔒 Admin features access granted (development mode)');
      return true;
    }
    
    // Use authService.isAdmin() which properly validates 2FA for admin users
    const hasAdminAccess = authService.isAdmin();
    console.log('🔒 Admin features access check:', hasAdminAccess ? 'granted' : 'denied');
    
    return hasAdminAccess;
  };

  const canAccessRestaurantFeatures = (): boolean => {
    if (!user) return false;
    
    // Admin users can always access restaurant features
    if (user.adminAccess) {
      console.log('🔒 Admin user granted restaurant features access');
      return true;
    }
    
    // For restaurant owners, check subscription
    if (!isRestaurantOwner) return false;
    
    // Check if restaurant owner has valid subscription
    if (!user.subscription) return false;
    
    // Check if subscription is active
    if (user.subscription.status !== 'active') return false;
    
    // Check if subscription hasn't expired
    const now = new Date();
    const endDate = new Date(user.subscription.endDate);
    if (endDate < now) return false;
    
    return true;
  };

  const handleSetUserRole = (role: UserRole) => {
    console.log('🔄 Role switching to:', role);
    
    // For admin users, allow role switching for testing purposes
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.adminAccess) {
      console.log('🔒 Admin user switching role for testing:', role);
      setUserRole(role);
      // Keep the admin user object but change the display role
      return;
    }
    
    
    setUserRole(role);
    
    // Update authentication state for non-admin users
    if (role) {
      const user = authService.getCurrentUser();
      if (user && !user.adminAccess) {
        setUser(user);
      }
    } else {
      setUser(null);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
  };

  // Function to update user state after successful 2FA authentication
  const updateUserAfter2FA = (user: User) => {
    console.log('🔍 AppContext: Updating user state after successful 2FA:', user);
    setUser(user);
    setUserRole(user.userType);
  };

  const value: AppContextType = {
    sidebarOpen,
    toggleSidebar,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    selectedRestaurantId,
    setSelectedRestaurantId,
    userRole,
    setUserRole: handleSetUserRole,
    isRestaurantOwner,
    isAdmin,
    isCustomer,
    get canAccessAdminFeatures() {
      return canAccessAdminFeatures();
    },
    get canAccessRestaurantFeatures() {
      return canAccessRestaurantFeatures();
    },
    // Authentication
    isAuthenticated: authService.isAuthenticated(),
    user,
    setUser,
    login: async (email: string, password: string) => {
      // Check if user is already authenticated (e.g., after 2FA verification)
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        console.log('🔍 AppContext: User already authenticated, updating state');
        setUser(currentUser);
        setUserRole(currentUser.userType);
        setShowAuthModal(false);
        return;
      }
      
      // Otherwise, perform normal login
      const user = await authService.login({ email, password });
      setUser(user);
      setUserRole(user.userType);
      setShowAuthModal(false);
    },
    signup: async (userData: SignupData) => {
      const user = await authService.signup(userData);
      setUser(user);
      setUserRole(user.userType);
      setShowAuthModal(false);
    },
    logout,
    updateUserAfter2FA,
    showAuthModal,
    setShowAuthModal,
    hasRole,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
