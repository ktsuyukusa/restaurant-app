import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced logging to debug URL issues
console.log('Environment Variables Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  urlType: typeof supabaseUrl,
  keyType: typeof supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
});

// Validate URL before using it
const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    console.warn('Supabase URL is invalid: empty or not a string');
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    const isValid = urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase.co');
    if (!isValid) {
      console.warn('Supabase URL is invalid: wrong protocol or hostname', url);
    }
    return isValid;
  } catch (error) {
    console.warn('Supabase URL is invalid: failed to parse', url, error);
    return false;
  }
};

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  isValidSupabaseUrl(supabaseUrl);

console.log('Supabase Configuration Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDefaultUrl: supabaseUrl === 'https://your-project.supabase.co',
  isDefaultKey: supabaseAnonKey === 'your-anon-key-here',
  isUrlValid: supabaseUrl ? isValidSupabaseUrl(supabaseUrl) : false,
  isConfigured: isSupabaseConfigured
});

// Create Supabase client only if properly configured
let supabase = null;
try {
  if (isSupabaseConfigured) {
    console.log('Creating Supabase client with URL:', supabaseUrl);
    
    // Additional safety check before creating client
    if (!isValidSupabaseUrl(supabaseUrl)) {
      throw new Error('Invalid Supabase URL');
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created successfully');
  } else {
    console.log('Supabase not configured, using null client');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  supabase = null;
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
    insert: (data: any) => Promise.resolve({ data: data, error: null }),
    update: (data: any) => Promise.resolve({ data: data, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    rpc: (func: string, params: any) => Promise.resolve({ data: null, error: null })
  }),
  auth: {
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: null } })
  }
};

// Export the appropriate client
export const getSupabaseClient = () => {
  const client = isSupabaseAvailable() ? supabase : mockSupabase;
  console.log('getSupabaseClient called, returning:', isSupabaseAvailable() ? 'real client' : 'mock client');
  return client;
};