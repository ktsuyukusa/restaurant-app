import { createClient } from '@supabase/supabase-js';

// Get environment variables with type checking
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env or .env.local file.\n' +
    'Required variables: VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export const getSupabaseClient = () => isSupabaseAvailable() ? supabase : mockSupabase;