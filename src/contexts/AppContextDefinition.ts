import { createContext } from 'react';
import { User, SignupData } from '@/services/authService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

type UserRole = 'customer' | 'restaurant_owner' | 'admin' | null;

export interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
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
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateUserAfter2FA: (user: User) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  hasRole: (role: 'customer' | 'restaurant_owner' | 'admin') => boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export type { CartItem, UserRole };