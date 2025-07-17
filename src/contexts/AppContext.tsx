import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import authService, { User } from '@/services/authService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

type UserRole = 'customer' | 'restaurant_owner' | 'admin' | null;

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  currentView: 'restaurants' | 'restaurant-details' | 'cart' | 'profile' | 'users' | 'menus' | 'reservations' | 'dashboard' | 'orders' | 'menu-management';
  setCurrentView: (view: 'restaurants' | 'restaurant-details' | 'cart' | 'profile' | 'users' | 'menus' | 'reservations' | 'dashboard' | 'orders' | 'menu-management') => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isRestaurantOwner: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  canAccessAdminFeatures: boolean;
  canAccessRestaurantFeatures: boolean;
  // Authentication
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  hasRole: (role: 'customer' | 'restaurant_owner' | 'admin') => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<'restaurants' | 'restaurant-details' | 'cart' | 'profile' | 'users' | 'menus' | 'reservations' | 'dashboard' | 'orders' | 'menu-management'>('restaurants');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  
  // Load user role from localStorage or default to customer
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('navikko_user_role');
    return (savedRole as UserRole) || null;
  });

  // Authentication state
  const [user, setUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
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
  const hasRole = (role: 'customer' | 'restaurant_owner' | 'admin'): boolean => {
    return userRole === role && user;
  };

  const isAdmin = hasRole('admin');
  const isRestaurantOwner = hasRole('restaurant_owner');
  const isCustomer = hasRole('customer');

  // Enhanced access control with security validation
  const canAccessAdminFeatures = (): boolean => {
    if (!isAdmin || !user) return false;
    
    // Additional security checks for admin access
    if (!user.adminAccess) return false;
    
    // Check if admin access is still valid
    if (!user.adminAccess.accessCode) return false;
    
    // Check IP restrictions (if implemented)
    if (typeof window !== 'undefined') {
      // In production, this would validate against allowed IP ranges
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      const isVercel = window.location.hostname.includes('vercel.app');
      
      // For development, allow localhost and Vercel
      if (!isLocalhost && !isVercel) {
        console.warn('Admin access attempted from non-authorized domain');
        return false;
      }
    }
    
    return true;
  };

  const canAccessRestaurantFeatures = (): boolean => {
    if (!isRestaurantOwner || !user) return false;
    
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
    setUserRole(role);
    
    // Update authentication state
    if (role) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
  };

  const handleSetCurrentUser = (user: any) => {
    setUser(user);
    if (user) {
      setUserRole(user.userType);
    } else {
      setUserRole(null);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
    setCurrentView('restaurants');
  };

  const value: AppContextType = {
    sidebarOpen,
    toggleSidebar,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    currentView,
    setCurrentView,
    selectedRestaurantId,
    setSelectedRestaurantId,
    userRole,
    setUserRole: handleSetUserRole,
    isRestaurantOwner,
    isAdmin,
    isCustomer,
    canAccessAdminFeatures: canAccessAdminFeatures(),
    canAccessRestaurantFeatures: canAccessRestaurantFeatures(),
    // Authentication
    isAuthenticated: !!user,
    user,
    login: async (email: string, password: string) => {
      const user = await authService.login({ email, password });
      setUser(user);
      setUserRole(user.userType);
      setShowAuthModal(false);
    },
    signup: async (userData: any) => {
      const user = await authService.signup(userData);
      setUser(user);
      setUserRole(user.userType);
      setShowAuthModal(false);
    },
    logout,
    showAuthModal,
    setShowAuthModal,
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    hasRole,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};