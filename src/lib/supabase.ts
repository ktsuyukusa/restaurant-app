import { createClient } from '@supabase/supabase-js';

// Get environment variables with type checking
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables (remove in production)
console.log('🔧 Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('🔧 Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Create Supabase client with fallback
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('⚠️ Missing Supabase environment variables. Using mock client.');
}

// Mock Supabase client for development/testing
export const mockSupabase = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data: unknown) => ({
      select: () => Promise.resolve({ data: data, error: null }),
      then: (callback: unknown) => Promise.resolve({ data: data, error: null }).then(callback)
    }),
    update: (data: unknown) => ({
      select: () => Promise.resolve({ data: data, error: null }),
      then: (callback: unknown) => Promise.resolve({ data: data, error: null }).then(callback)
    }),
    delete: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
      then: (callback: unknown) => Promise.resolve({ data: null, error: null }).then(callback)
    }),
    rpc: (func: string, params: unknown) => Promise.resolve({ data: null, error: null })
  }),
  auth: {
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: unknown) => ({ data: { subscription: null } }),
    resetPasswordForEmail: (email: string) => Promise.resolve({ 
      data: null, 
      error: { message: 'Mock client: Password reset not available. Please check Supabase configuration.' } 
    })
  }
};

// Export the appropriate client - always return a valid client
export { supabase };

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// Export the appropriate client - always return a valid client
export const getSupabaseClient = () => {
  return supabase || mockSupabase;
};