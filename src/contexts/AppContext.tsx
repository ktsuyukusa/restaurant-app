import React, { createContext, useContext, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import authService, { User } from '@/services/authService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

type UserRole = 'customer' | 'restaurant_owner' | 'admin';

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
  // Authentication
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<'restaurants' | 'restaurant-details' | 'cart' | 'profile' | 'users' | 'menus' | 'reservations' | 'dashboard' | 'orders' | 'menu-management'>('restaurants');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  
  // Load user role from localStorage or default to customer
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('navikko_user_role');
    return (savedRole as UserRole) || 'customer';
  });

  // Authentication state
  const [user, setUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Wrapper function to persist user role
  const setUserRoleWithPersistence = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('navikko_user_role', role);
  };

  // Authentication functions
  const login = async (email: string, password: string) => {
    const user = await authService.login({ email, password });
    setUser(user);
    setUserRole(user.userType);
    setShowAuthModal(false);
  };

  const signup = async (userData: any) => {
    const user = await authService.signup(userData);
    setUser(user);
    setUserRole(user.userType);
    setShowAuthModal(false);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole('customer');
    setCurrentView('restaurants');
  };

  // Computed properties for role checking
  const isAuthenticated = authService.isAuthenticated();
  const isRestaurantOwner = authService.isRestaurantOwner();
  const isAdmin = authService.isAdmin();
  const isCustomer = authService.isCustomer();

  return (
    <AppContext.Provider
      value={{
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
        setUserRole: setUserRoleWithPersistence,
        isRestaurantOwner,
        isAdmin,
        isCustomer,
        // Authentication
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}