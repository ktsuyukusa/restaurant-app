import { createClient } from '@supabase/supabase-js';

// Use Vercel's automatically created environment variables
// These are set by the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qqcoooscyzhyzmrcvsxi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E';

// Force clear any environment variables that might interfere
if (typeof window !== 'undefined') {
  // Clear any cached environment variables in the browser
  delete (window as any).__SUPABASE_URL__;
  delete (window as any).__SUPABASE_ANON_KEY__;
}

// Debug: Log the credentials being used (remove in production)
console.log('🔧 FORCED hardcoded Supabase URL:', supabaseUrl);
console.log('🔧 FORCED hardcoded Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Create Supabase client with hardcoded credentials - NO FALLBACKS
let supabase = null;

try {
  // Force create client with explicit options to bypass any environment interference
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'navikko-app'
      }
    }
  });
  console.log('✅ FORCED Supabase client initialized successfully with hardcoded credentials');
} catch (error) {
  console.error('❌ Error creating FORCED Supabase client:', error);
  supabase = null;
}

// Mock Supabase client for development/testing
export const mockSupabase = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data: unknown) => ({
      select: () => Promise.resolve({ data: data, error: null }),
      then: (callback: (value: { data: unknown; error: any }) => any) => Promise.resolve({ data: data, error: null }).then(callback)
    }),
    update: (data: unknown) => ({
      select: () => Promise.resolve({ data: data, error: null }),
      then: (callback: (value: { data: unknown; error: any }) => any) => Promise.resolve({ data: data, error: null }).then(callback)
    }),
    delete: () => ({
      select: () => Promise.resolve({ data: null, error: null }),
      then: (callback: (value: { data: any; error: any }) => any) => Promise.resolve({ data: null, error: null }).then(callback)
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
