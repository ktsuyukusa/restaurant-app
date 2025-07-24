import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabase = null;
  }
}

export { supabase };

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

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
    onAuthStateChange: (callback: unknown) => ({ data: { subscription: null } })
  }
};

// Export the appropriate client
export const getSupabaseClient = () => {
  return isSupabaseAvailable() ? supabase : mockSupabase;
};