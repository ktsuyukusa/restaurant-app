import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qqcoooscyzhyzmrcvsxi.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E';

console.log('Supabase: Initializing with URL:', supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase: Client created successfully');

// Get Supabase client instance
export const getSupabaseClient = () => {
  return supabase;
};

// Auth service
export const authService = {
  // Sign up with email
  signUp: async (email: string, password: string) => {
    try {
      console.log('AuthService: Attempting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log('AuthService: Sign up result:', error ? 'Error' : 'Success');
      return { data, error };
    } catch (err) {
      console.error('AuthService: Sign up error:', err);
      return { data: null, error: err };
    }
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    try {
      console.log('AuthService: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('AuthService: Sign in result:', error ? 'Error' : 'Success');
      return { data, error };
    } catch (err) {
      console.error('AuthService: Sign in error:', err);
      return { data: null, error: err };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('AuthService: Attempting sign out');
      const { error } = await supabase.auth.signOut();
      console.log('AuthService: Sign out result:', error ? 'Error' : 'Success');
      return { error };
    } catch (err) {
      console.error('AuthService: Sign out error:', err);
      return { error: err };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('AuthService: Getting current user');
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('AuthService: Current user result:', error ? 'Error' : user ? 'Found' : 'None');
      return { user, error };
    } catch (err) {
      console.error('AuthService: Get current user error:', err);
      return { user: null, error: err };
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      console.log('AuthService: Getting current session');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('AuthService: Current session result:', error ? 'Error' : session ? 'Found' : 'None');
      return { session, error };
    } catch (err) {
      console.error('AuthService: Get current session error:', err);
      return { session: null, error: err };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      console.log('AuthService: Attempting password reset for:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      console.log('AuthService: Password reset result:', error ? 'Error' : 'Success');
      return { data, error };
    } catch (err) {
      console.error('AuthService: Password reset error:', err);
      return { data: null, error: err };
    }
  },

  // Update password
  updatePassword: async (password: string) => {
    try {
      console.log('AuthService: Attempting password update');
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      console.log('AuthService: Password update result:', error ? 'Error' : 'Success');
      return { data, error };
    } catch (err) {
      console.error('AuthService: Password update error:', err);
      return { data: null, error: err };
    }
  },
};

// Restaurant service
export const restaurantService = {
  // Get all restaurants
  getAll: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('name_en');
    return { data, error };
  },

  // Get restaurant by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Get restaurants by location
  getByLocation: async (latitude: number, longitude: number, radius: number = 5) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true);
    
    if (error) return { data: null, error };

    // Filter by distance (this would be better done with PostGIS in production)
    const restaurantsWithDistance = data?.map(restaurant => {
      if (restaurant.latitude && restaurant.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        return { ...restaurant, distance };
      }
      return restaurant;
    }).filter(restaurant => restaurant.distance && restaurant.distance <= radius) || [];

    return { data: restaurantsWithDistance, error: null };
  },
};

// Menu service
export const menuService = {
  // Get menu by restaurant ID
  getByRestaurantId: async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('category_id')
      .order('sort_order');
    return { data, error };
  },

  // Get menu categories
  getCategories: async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order');
    return { data, error };
  },
};

// Order service
export const orderService = {
  // Create new order
  create: async (orderData: any) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    return { data, error };
  },

  // Get user orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants(name_ja, name_en, address_ja, address_en)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Update order status
  updateStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    return { data, error };
  },
};

// Reservation service
export const reservationService = {
  // Create reservation
  create: async (reservationData: any) => {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();
    return { data, error };
  },

  // Get user reservations
  getUserReservations: async (userId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        restaurants(name_ja, name_en, address_ja, address_en)
      `)
      .eq('user_id', userId)
      .order('reservation_date', { ascending: true });
    return { data, error };
  },

  // Update reservation status
  updateStatus: async (reservationId: string, status: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId);
    return { data, error };
  },
};

// Utility functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Initialize auth state listener
export const initializeAuthListener = () => {
  try {
    console.log('Supabase: Initializing auth listener');
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase: Auth state changed:', event, session?.user?.id);
    });
    console.log('Supabase: Auth listener initialized successfully');
  } catch (err) {
    console.error('Supabase: Error initializing auth listener:', err);
    throw err;
  }
};

// Initialize app state listener for session refresh
export const initializeAppStateListener = () => {
  try {
    console.log('Supabase: Initializing app state listener');
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('Supabase: App became active, refreshing session');
        // Refresh session when app becomes active
        supabase.auth.getSession();
      }
    });
    console.log('Supabase: App state listener initialized successfully');
  } catch (err) {
    console.error('Supabase: Error initializing app state listener:', err);
    throw err;
  }
}; 