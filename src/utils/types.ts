// Type definitions for translations

/**
 * Interface representing the structure of translation keys and their values
 */
export interface TranslationKeys {
  [key: string]: string;
}

/**
 * Interface representing the structure of the entire translation dictionary
 * Keys are language codes (e.g., 'en', 'ja') and values are TranslationKeys
 */
export interface Dictionary {
  [lang: string]: TranslationKeys;
}

/**
 * Interface representing the structure of signup data
 */
export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  userType: 'customer' | 'restaurant_owner' | 'admin';
  locationConsent?: boolean;
  restaurantName?: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  adminCode?: string;
}

/**
 * Interface representing the structure of login data
 */
export interface LoginData {
  email: string;
  password: string;
}
