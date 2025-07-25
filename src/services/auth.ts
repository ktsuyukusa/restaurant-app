import { getSupabaseClient } from '@/lib/supabase';
import { User, SignupData } from '@/utils/types';

export const auth = {
  async login(email: string, password: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      ...data.user,
      ...profile,
    };
  },

  async signup(userData: SignupData) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          user_type: userData.userType,
          name: userData.name,
          phone: userData.phone,
        },
      },
    });

    if (error) throw error;

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user?.id,
      user_type: userData.userType,
      name: userData.name,
      phone: userData.phone,
      location_consent: userData.locationConsent,
      restaurant_name: userData.restaurantName,
      restaurant_address: userData.restaurantAddress,
      restaurant_phone: userData.restaurantPhone,
      admin_code: userData.adminCode,
    });

    if (profileError) throw profileError;

    return data;
  },

  async logout() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      ...session.user,
      ...profile,
    };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = getSupabaseClient();
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        callback({
          ...session.user,
          ...profile,
        } as User);
      } else {
        callback(null);
      }
    });
  },
};
