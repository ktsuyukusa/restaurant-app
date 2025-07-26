import { createClient } from '@supabase/supabase-js';
import { validateAdminCode, getAdminLevel } from '@/config/adminCodes';
import { getSupabaseClient } from '@/lib/supabase';
import { ADMIN_CODES } from '@/config/adminCodes';
import { generateTOTPSecret, verifyTOTPCode, TOTP } from '@/utils/totp';

// Types for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'customer' | 'restaurant_owner' | 'admin';
  createdAt: string;
  locationConsent?: boolean;
  paymentMethods?: PaymentMethod[];
  restaurantInfo?: RestaurantInfo;
  subscription?: Subscription;
  adminAccess?: AdminAccess;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  cuisine: string;
  subscriptionId?: string;
}

export interface Subscription {
  id: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
}

export interface AdminAccess {
  level: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  accessCode: string;
  twoFactorSecret?: string; // TOTP secret for 2FA
  twoFactorEnabled?: boolean; // Whether 2FA is enabled
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  userType: 'customer' | 'restaurant_owner' | 'admin';
  locationConsent?: boolean;
  restaurantInfo?: Partial<RestaurantInfo>;
  adminCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Google Sign-In interfaces
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleSignInData {
  userType: 'customer' | 'restaurant_owner' | 'admin';
  locationConsent?: boolean;
  restaurantInfo?: Partial<RestaurantInfo>;
  adminCode?: string;
  phone?: string; // Optional for Google Sign-In
}

// Mock user data for development/testing
const mockUsers = new Map();

// Mock subscription data
const mockSubscriptions = new Map();

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 10,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  ALLOWED_ADMIN_IPS: import.meta.env.VITE_ALLOWED_ADMIN_IPS?.split(',') || [
    '133.204.210.193', // Current IP
    '127.0.0.1', // Localhost for development
    'localhost' // Localhost for development
  ],
  REQUIRE_2FA_FOR_ADMIN: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Login attempt tracking
interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
  ipAddress?: string;
}

const loginAttempts = new Map<string, LoginAttempt>();

// Mock authentication functions
const mockAuth = {
  signUp: async (userData: any) => {
    const user = {
      id: `mock-user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      user_type: userData.user_type || 'customer',
      subscription: null,
      created_at: new Date().toISOString()
    };
    mockUsers.set(userData.email, user);
    return { data: { user }, error: null };
  },

  signInWithPassword: async (credentials: { email: string; password: string }) => {
    const user = mockUsers.get(credentials.email);
    if (user) {
      return { data: { user }, error: null };
    }
    return { data: { user: null }, error: { message: 'Invalid credentials' } };
  },

  signOut: async () => {
    return { error: null };
  },

  getSession: async () => {
    return { data: { session: null }, error: null };
  }
};

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private loginAttempts: Map<string, LoginAttempt> = new Map();

  private constructor() {
    this.loadUserFromStorage();
    this.loadLoginAttempts();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('navikko_user_data');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        this.logout();
      }
    }
  }

  private saveUserToStorage(user: User): void {
    console.log('Saving user to storage:', user);
    localStorage.setItem('navikko_user_data', JSON.stringify(user));
    localStorage.setItem('navikko_user_role', user.userType);
  }

  private clearStorage(): void {
    console.log('Clearing user storage');
    localStorage.removeItem('navikko_user_data');
    localStorage.removeItem('navikko_user_role');
  }

  // Get client IP address (for admin access control)
  private getClientIP(): string {
    // For now, we'll use a placeholder that should be replaced with actual IP detection
    // In production, this should be replaced with server-side IP detection
    return '133.204.210.193'; // Your current IP - this should be dynamic in production
  }

  // Check if IP is allowed for admin access
  private isIPAllowedForAdmin(): boolean {
    // For local development, testing, and production domains, allow admin access
    if (import.meta.env.DEV || 
        window.location.hostname.includes('vercel.app') ||
        window.location.hostname === 'www.navikko.com' ||
        window.location.hostname === 'navikko.com') {
      console.log('🔧 Development/Testing/Production mode: Admin IP restrictions disabled');
      return true;
    }
    
    // Always require IP restrictions for admin access in production
    if (SECURITY_CONFIG.ALLOWED_ADMIN_IPS.length === 0) {
      console.warn('No admin IPs configured - admin access blocked for security');
      return false; // Block admin access if no IPs configured
    }
    
    const clientIP = this.getClientIP();
    const isAllowed = SECURITY_CONFIG.ALLOWED_ADMIN_IPS.includes(clientIP);
    
    if (!isAllowed) {
      console.warn(`Admin access blocked from IP: ${clientIP}. Allowed IPs: ${SECURITY_CONFIG.ALLOWED_ADMIN_IPS.join(', ')}`);
    }
    
    return isAllowed;
  }

  // Track login attempts
  private trackLoginAttempt(email: string, success: boolean): boolean {
    const now = Date.now();
    const attempt = this.loginAttempts.get(email) || {
      email,
      attempts: 0,
      lastAttempt: 0,
      ipAddress: this.getClientIP()
    };

    if (success) {
      // Reset on successful login
      this.loginAttempts.delete(email);
      this.saveLoginAttempts();
      return true;
    }

    // Check if account is locked
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000 / 60);
      throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
    }

    // Increment failed attempts
    attempt.attempts += 1;
    attempt.lastAttempt = now;

    // Lock account if max attempts reached
    if (attempt.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION;
      this.loginAttempts.set(email, attempt);
      this.saveLoginAttempts();
      throw new Error(`Account locked due to too many failed attempts. Please try again in 30 minutes.`);
    }

    this.loginAttempts.set(email, attempt);
    this.saveLoginAttempts();
    return false;
  }

  // Save login attempts to localStorage
  private saveLoginAttempts(): void {
    try {
      const attemptsData = Array.from(this.loginAttempts.entries());
      localStorage.setItem('navikko_login_attempts', JSON.stringify(attemptsData));
    } catch (error) {
      console.error('Failed to save login attempts:', error);
    }
  }

  // Load login attempts from localStorage
  private loadLoginAttempts(): void {
    try {
      const attemptsData = localStorage.getItem('navikko_login_attempts');
      if (attemptsData) {
        const attempts = JSON.parse(attemptsData);
        this.loginAttempts = new Map(attempts);
      }
    } catch (error) {
      console.error('Failed to load login attempts:', error);
    }
  }

  // Check if user needs 2FA
  private requires2FA(userType: string): boolean {
    return SECURITY_CONFIG.REQUIRE_2FA_FOR_ADMIN && userType === 'admin';
  }

  // Generate 2FA code using proper TOTP
  // Note: Old TOTP methods removed - login now uses database secret directly

  // Check if user exists in Supabase
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Customer signup with location consent and payment method registration
  async signupCustomer(data: SignupData): Promise<User> {
    console.log('Customer signup attempt for email:', data.email);
    
    if (data.userType !== 'customer') {
      throw new Error('Invalid user type for customer signup');
    }

    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.phone) {
      throw new Error('All fields are required');
    }

    if (!data.locationConsent) {
      throw new Error('Location consent is required for customers');
    }

    // Check if user already exists
    const userExists = await this.checkUserExists(data.email);
    if (userExists) {
      throw new Error('User with this email already exists. Please login instead.');
    }

    try {
      // Create user in Supabase
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          user_type: 'customer',
          location_consent: data.locationConsent
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        throw new Error('Failed to create user account');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.user_type,
        locationConsent: userData.location_consent,
        paymentMethods: [],
        createdAt: userData.created_at
      };

      console.log('Created user object:', user);
      this.currentUser = user;
      this.saveUserToStorage(user);
      console.log('Customer signup successful for user:', user);
      return user;
    } catch (error: any) {
      console.error('Customer signup error:', error);
      throw new Error(error.message || 'Failed to create customer account');
    }
  }

  // Restaurant owner signup with subscription requirement
  async signupRestaurantOwner(data: SignupData): Promise<User> {
    if (data.userType !== 'restaurant_owner') {
      throw new Error('Invalid user type for restaurant owner signup');
    }

    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.phone) {
      throw new Error('All fields are required');
    }

    if (!data.restaurantInfo?.name || !data.restaurantInfo?.address || !data.restaurantInfo?.phone) {
      throw new Error('Restaurant information is required');
    }

    // Check if user already exists
    const userExists = await this.checkUserExists(data.email);
    if (userExists) {
      throw new Error('User with this email already exists. Please login instead.');
    }

    try {
      // Create user in Supabase
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          user_type: 'restaurant_owner'
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating restaurant owner:', userError);
        throw new Error('Failed to create restaurant owner account');
      }

      // Create restaurant info
      const { error: restaurantError } = await supabase
        .from('restaurant_info')
        .insert({
          user_id: userData.id,
          name: data.restaurantInfo.name,
          address: data.restaurantInfo.address,
          phone: data.restaurantInfo.phone,
          cuisine: data.restaurantInfo.cuisine || 'Other'
        });

      if (restaurantError) {
        console.error('Error creating restaurant info:', restaurantError);
        // Clean up user if restaurant info creation fails
        await supabase.from('users').delete().eq('id', userData.id);
        throw new Error('Failed to create restaurant information');
      }

      // Create subscription (assuming basic plan for now)
      const subscriptionId = `sub_${Date.now()}`;
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userData.id,
          plan: 'basic',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          price: 5000,
          currency: 'JPY'
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        // Clean up if subscription creation fails
        await supabase.from('restaurant_info').delete().eq('user_id', userData.id);
        await supabase.from('users').delete().eq('id', userData.id);
        throw new Error('Failed to create subscription');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.user_type,
        restaurantInfo: {
          name: data.restaurantInfo.name,
          address: data.restaurantInfo.address,
          phone: data.restaurantInfo.phone,
          cuisine: data.restaurantInfo.cuisine || 'Other',
          subscriptionId
        },
        subscription: {
          id: subscriptionId,
          plan: 'basic',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          price: 5000,
          currency: 'JPY'
        },
        createdAt: userData.created_at
      };

      this.currentUser = user;
      this.saveUserToStorage(user);
      return user;
    } catch (error: any) {
      console.error('Restaurant owner signup error:', error);
      throw new Error(error.message || 'Failed to create restaurant owner account');
    }
  }

  // Admin signup with admin code validation
  async signupAdmin(data: SignupData): Promise<User> {
    if (data.userType !== 'admin') {
      throw new Error('Invalid user type for admin signup');
    }

    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.phone || !data.adminCode) {
      throw new Error('All fields including admin code are required');
    }

    // Validate admin code
    const adminLevel = getAdminLevel(data.adminCode);
    if (!adminLevel) {
      throw new Error('Invalid admin code');
    }

    // Check IP restrictions for admin access
    if (!this.isIPAllowedForAdmin()) {
      throw new Error('Admin access is restricted from this IP address');
    }

    // Check if user already exists
    const userExists = await this.checkUserExists(data.email);
    if (userExists) {
      throw new Error('User with this email already exists. Please login instead.');
    }

    try {
      // Create user in Supabase
      const supabase = getSupabaseClient();
      console.log('Creating admin user with data:', {
        email: data.email,
        name: data.name,
        phone: data.phone,
        user_type: 'admin'
      });
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          user_type: 'admin'
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating admin user:', userError);
        throw new Error(`Failed to create admin account: ${userError.message}`);
      }

      console.log('Admin user created successfully:', userData);

      // Create admin access record
      const adminAccessData = {
          user_id: userData.id,
          level: adminLevel,
          permissions: this.getPermissionsForLevel(adminLevel),
          access_code: data.adminCode
      };
      
      console.log('Creating admin access with data:', adminAccessData);
      
      const { error: adminError } = await supabase
        .from('admin_access')
        .insert(adminAccessData);

      if (adminError) {
        console.error('Error creating admin access:', adminError);
        // Clean up user if admin access creation fails
        await supabase.from('users').delete().eq('id', userData.id);
        throw new Error(`Failed to create admin access: ${adminError.message}`);
      }

      console.log('Admin access created successfully');

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.user_type,
        adminAccess: {
          level: adminLevel,
          permissions: this.getPermissionsForLevel(adminLevel),
          accessCode: data.adminCode
        },
        createdAt: userData.created_at
      };

      this.currentUser = user;
      this.saveUserToStorage(user);
      return user;
    } catch (error: any) {
      console.error('Admin signup error:', error);
      throw new Error(error.message || 'Failed to create admin account');
    }
  }

  // Unified signup method
  async signup(data: SignupData): Promise<User> {
    switch (data.userType) {
      case 'customer':
        return this.signupCustomer(data);
      case 'restaurant_owner':
        return this.signupRestaurantOwner(data);
      case 'admin':
        return this.signupAdmin(data);
      default:
        throw new Error('Invalid user type');
    }
  }

  // Enhanced login method with security measures
  async login(data: LoginData, twoFactorCode?: string): Promise<User> {
    console.log('Login attempt for email:', data.email);

    // Check IP restriction for admin login
    if (data.email.includes('admin') && !this.isIPAllowedForAdmin()) {
      throw new Error('Access denied from this IP address for admin accounts.');
    }

    try {
      // Find user in Supabase
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email)
        .single();

      if (userError || !userData) {
        this.trackLoginAttempt(data.email, false);
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      const attempt = this.loginAttempts.get(data.email);
      if (attempt?.lockedUntil && Date.now() < attempt.lockedUntil) {
        const remainingTime = Math.ceil((attempt.lockedUntil - Date.now()) / 1000 / 60);
        throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
      }

      // In a real app, you would verify the password here
      // For now, we'll just check if the user exists
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.user_type,
        locationConsent: userData.location_consent,
        createdAt: userData.created_at
      };

      // Load additional data based on user type
      if (userData.user_type === 'restaurant_owner') {
        const { data: restaurantData } = await supabase
          .from('restaurant_info')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (restaurantData) {
          user.restaurantInfo = {
            name: restaurantData.name,
            address: restaurantData.address,
            phone: restaurantData.phone,
            cuisine: restaurantData.cuisine,
            subscriptionId: restaurantData.subscription_id
          };
        }

        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (subscriptionData) {
          user.subscription = {
            id: subscriptionData.id,
            plan: subscriptionData.plan,
            status: subscriptionData.status,
            startDate: subscriptionData.start_date,
            endDate: subscriptionData.end_date,
            price: parseFloat(subscriptionData.price),
            currency: subscriptionData.currency
          };
        }
      }

      if (userData.user_type === 'admin') {
        // Load admin data first - force fresh data
        console.log('🔍 Login Debug: Querying admin_access for user_id:', userData.id);
        const { data: adminData, error: adminError } = await supabase
          .from('admin_access')
          .select('*')
          .eq('user_id', userData.id)
          .single();
        
        if (adminError) {
          console.error('🔍 Login Debug: Admin data query error:', adminError);
        }

        if (adminData) {
          user.adminAccess = {
            level: adminData.level,
            permissions: adminData.permissions,
            accessCode: adminData.access_code,
            twoFactorSecret: adminData.two_factor_secret,
            twoFactorEnabled: adminData.two_factor_enabled
          };
          console.log('🔍 Login Debug: Admin data loaded for user ID:', userData.id);
          console.log('🔍 Login Debug: Admin data:', adminData);
        }

        // Check 2FA for admin users
        if (this.requires2FA(userData.user_type)) {
          if (!twoFactorCode) {
            // For proper TOTP, we don't generate a code - user gets it from authenticator app
            throw new Error('2FA_REQUIRED');
          }

          // Validate 2FA code using TOTP with secret from database
          if (!user.adminAccess?.twoFactorSecret) {
            throw new Error('2FA not set up. Please complete 2FA setup first.');
          }

          console.log('🔍 Login 2FA Debug: Using secret from database:', user.adminAccess.twoFactorSecret);
          
          const { verifyTOTPCode } = await import('@/utils/totp');
          const isValid = await verifyTOTPCode(user.adminAccess.twoFactorSecret, twoFactorCode);
          
          if (!isValid) {
            this.trackLoginAttempt(data.email, false);
            throw new Error('Invalid 2FA code');
          }
        }
      }

      // Track successful login
      this.trackLoginAttempt(data.email, true);

      this.currentUser = user;
      this.saveUserToStorage(user);
      console.log('Login successful for user:', user);
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout method
  logout(): void {
    this.currentUser = null;
    this.clearStorage();
  }

  // Clear all stored data (for testing purposes)
  clearAllData(): void {
    this.currentUser = null;
    this.clearStorage();
    // Also clear any other related data
    localStorage.removeItem('navikko_user_session');
    localStorage.removeItem('navikko_user_preferences');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Debug method to check localStorage state
  debugStorageState(): void {
    console.log('=== LocalStorage Debug Info ===');
    console.log('navikko_user_data:', localStorage.getItem('navikko_user_data'));
    console.log('navikko_user_role:', localStorage.getItem('navikko_user_role'));
    console.log('Current user in memory:', this.currentUser);
    console.log('==============================');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Check user role
  hasRole(role: User['userType']): boolean {
    return this.currentUser?.userType === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUser?.userType === 'admin';
  }

  // Check if user is restaurant owner
  isRestaurantOwner(): boolean {
    return this.currentUser?.userType === 'restaurant_owner';
  }

  // Check if user is customer
  isCustomer(): boolean {
    return this.currentUser?.userType === 'customer';
  }

  // Add payment method for customers
  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    if (!this.currentUser || this.currentUser.userType !== 'customer') {
      throw new Error('Only customers can add payment methods');
    }

    const newPaymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      ...paymentMethod
    };

    if (!this.currentUser.paymentMethods) {
      this.currentUser.paymentMethods = [];
    }

    this.currentUser.paymentMethods.push(newPaymentMethod);
    this.saveUserToStorage(this.currentUser);

    return newPaymentMethod;
  }

  // Update location consent for customers
  async updateLocationConsent(consent: boolean): Promise<void> {
    if (!this.currentUser || this.currentUser.userType !== 'customer') {
      throw new Error('Only customers can update location consent');
    }

    this.currentUser.locationConsent = consent;
    this.saveUserToStorage(this.currentUser);
  }

  // Check restaurant subscription (mock implementation)
  private async checkRestaurantSubscription(email: string): Promise<boolean> {
    // In real app, this would check against a subscription database
    // For demo purposes, we'll simulate that some emails have subscriptions
    const subscribedEmails = ['restaurant@example.com', 'owner@test.com'];
    return subscribedEmails.includes(email);
  }

  // Get subscription plans for restaurant owners
  async getSubscriptionPlans(): Promise<Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
    duration: string;
  }>> {
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 5000,
        currency: 'JPY',
        features: ['Menu Management', 'Order Management', 'Basic Analytics', 'Email Support'],
        duration: 'monthly'
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 10000,
        currency: 'JPY',
        features: ['All Basic Features', 'Advanced Analytics', 'Multi-language Support', 'Priority Support', 'Custom Branding'],
        duration: 'monthly'
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 25000,
        currency: 'JPY',
        features: ['All Premium Features', 'API Access', 'White-label Solution', 'Dedicated Support', 'Custom Integration'],
        duration: 'monthly'
      }
    ];
  }

  // Purchase subscription for restaurant owners
  async purchaseSubscription(planId: string, paymentMethod: string): Promise<Subscription> {
    if (!this.currentUser || this.currentUser.userType !== 'restaurant_owner') {
      throw new Error('Only restaurant owners can purchase subscriptions');
    }

    const plans = await this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      plan: planId as 'basic' | 'premium' | 'enterprise',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      price: plan.price,
      currency: plan.currency
    };

    if (this.currentUser) {
      this.currentUser.subscription = subscription;
      if (this.currentUser.restaurantInfo) {
        this.currentUser.restaurantInfo.subscriptionId = subscription.id;
      }
      this.saveUserToStorage(this.currentUser);
    }

    return subscription;
  }

  // Google Sign-In method with security enforcement
  async signInWithGoogle(googleUser: GoogleUser, signInData: GoogleSignInData): Promise<User> {
    console.log('Google Sign-In attempt for email:', googleUser.email);
    
    // Check IP restriction for admin login
    if (signInData.userType === 'admin' && !this.isIPAllowedForAdmin()) {
      throw new Error('Access denied from this IP address for admin accounts.');
    }

    // Validate admin code for admin signup
    if (signInData.userType === 'admin') {
      if (!signInData.adminCode || !validateAdminCode(signInData.adminCode)) {
        throw new Error('Invalid admin access code required for admin registration.');
      }
    }
    
    // Check if user already exists
    const userExists = await this.checkUserExists(googleUser.email);
    
    if (userExists) {
      // User exists, perform login with security checks
      const storedUserData = localStorage.getItem('navikko_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.email === googleUser.email) {
          // Check if existing user is admin and requires 2FA
          if (userData.userType === 'admin' && this.requires2FA(userData.userType)) {
            // For existing admin users, require 2FA even with Google Sign-In
            const twoFACode = this.generate2FACode();
            sessionStorage.setItem('temp_2fa_code', twoFACode);
            sessionStorage.setItem('temp_google_user', JSON.stringify({ googleUser, signInData }));
            throw new Error('2FA_REQUIRED_GOOGLE');
          }
          
          this.currentUser = userData;
          this.saveUserToStorage(userData);
          console.log('Google Sign-In successful (existing user):', userData);
          return userData;
        }
      }
    }

    // User doesn't exist, create new account with security validation
    const user: User = {
      id: `${signInData.userType}_${Date.now()}`,
      email: googleUser.email,
      name: googleUser.name,
      phone: signInData.phone || '',
      userType: signInData.userType,
      locationConsent: signInData.locationConsent || false,
      paymentMethods: [],
      restaurantInfo: signInData.restaurantInfo,
      adminAccess: signInData.userType === 'admin' && signInData.adminCode ? {
        level: getAdminLevel(signInData.adminCode) || 'admin',
        permissions: ['user_management', 'restaurant_management', 'system_settings', 'analytics'],
        accessCode: signInData.adminCode
      } : undefined,
      subscription: signInData.userType === 'restaurant_owner' ? {
        id: `sub_${Date.now()}`,
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        price: 5000,
        currency: 'JPY'
      } : undefined,
      createdAt: new Date().toISOString()
    };

    // For new admin users, require 2FA setup
    if (signInData.userType === 'admin' && this.requires2FA(signInData.userType)) {
      const twoFACode = this.generate2FACode();
      sessionStorage.setItem('temp_2fa_code', twoFACode);
      sessionStorage.setItem('temp_google_user', JSON.stringify({ googleUser, signInData }));
      throw new Error('2FA_REQUIRED_GOOGLE');
    }

    console.log('Created user object via Google Sign-In:', user);
    this.currentUser = user;
    this.saveUserToStorage(user);
    console.log('Google Sign-In successful (new user):', user);
    return user;
  }

  // Complete Google Sign-In with 2FA verification
  async completeGoogleSignInWith2FA(twoFactorCode: string): Promise<User> {
    const storedData = sessionStorage.getItem('temp_google_user');
    if (!storedData) {
      throw new Error('No pending Google Sign-In found');
    }

    const { googleUser, signInData } = JSON.parse(storedData);
    const expectedCode = sessionStorage.getItem('temp_2fa_code');

    if (!expectedCode || !this.validate2FACode(twoFactorCode, expectedCode)) {
      this.trackLoginAttempt(googleUser.email, false);
      sessionStorage.removeItem('temp_2fa_code');
      sessionStorage.removeItem('temp_google_user');
      throw new Error('Invalid 2FA code');
    }

    // Clear temporary data
    sessionStorage.removeItem('temp_2fa_code');
    sessionStorage.removeItem('temp_google_user');

    // Create or retrieve user
    const userExists = await this.checkUserExists(googleUser.email);
    
    if (userExists) {
      // User exists, retrieve existing data
      const storedUserData = localStorage.getItem('navikko_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.email === googleUser.email) {
          this.currentUser = userData;
          this.saveUserToStorage(userData);
          this.trackLoginAttempt(googleUser.email, true);
          return userData;
        }
      }
    }

    // Create new user
    const user: User = {
      id: `${signInData.userType}_${Date.now()}`,
      email: googleUser.email,
      name: googleUser.name,
      phone: signInData.phone || '',
      userType: signInData.userType,
      locationConsent: signInData.locationConsent || false,
      paymentMethods: [],
      restaurantInfo: signInData.restaurantInfo,
      adminAccess: signInData.userType === 'admin' && signInData.adminCode ? {
        level: getAdminLevel(signInData.adminCode) || 'admin',
        permissions: ['user_management', 'restaurant_management', 'system_settings', 'analytics'],
        accessCode: signInData.adminCode
      } : undefined,
      subscription: signInData.userType === 'restaurant_owner' ? {
        id: `sub_${Date.now()}`,
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        price: 5000,
        currency: 'JPY'
      } : undefined,
      createdAt: new Date().toISOString()
    };

    this.currentUser = user;
    this.saveUserToStorage(user);
    this.trackLoginAttempt(googleUser.email, true);
    console.log('Google Sign-In with 2FA successful:', user);
    return user;
  }

  // Sign up with email/password
  async signUp(userData: any) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.user_type || 'customer'
          }
        }
      });
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  // Sign in with email/password
  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  // Sign out
  async signOut() {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  // Get current session
  async getSession() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      console.error('Get session error:', error);
      return { data: null, error };
    }
  }

  // 2FA Methods
  async setup2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) {
      throw new Error('User not found');
    }

    if (user.userType !== 'admin') {
      throw new Error('2FA is only available for admin accounts');
    }

    const secret = generateTOTPSecret();
    const totp = new TOTP({ secret });
    const qrCodeUrl = totp.getQRCodeURL(user.email, 'Navikko Admin');

    // Update user's 2FA secret (but don't enable yet)
    if (user.adminAccess) {
      user.adminAccess.twoFactorSecret = secret;
      this.saveUserToStorage(user);
    }

    return { secret, qrCodeUrl };
  }

  async verifyAndEnable2FA(userId: string, code: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) {
      throw new Error('User not found');
    }

    if (user.userType !== 'admin' || !user.adminAccess?.twoFactorSecret) {
      throw new Error('2FA not available for this account');
    }

    const isValid = await verifyTOTPCode(user.adminAccess.twoFactorSecret, code);
    
    if (isValid) {
      // Enable 2FA
      user.adminAccess.twoFactorEnabled = true;
      this.saveUserToStorage(user);
      
      // Update in mock storage
      mockUsers.set(user.email, user);
      localStorage.setItem('navikko_users', JSON.stringify(Array.from(mockUsers.entries())));
      
      console.log('✅ 2FA enabled for admin:', user.email);
    }

    return isValid;
  }

  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || user.id !== userId) {
      throw new Error('User not found');
    }

    if (user.userType !== 'admin' || !user.adminAccess?.twoFactorSecret) {
      throw new Error('2FA not available for this account');
    }

    return await verifyTOTPCode(user.adminAccess.twoFactorSecret, code);
  }

  is2FAEnabled(userId: string): boolean {
    const user = this.getCurrentUser();
    return user?.id === userId && user?.adminAccess?.twoFactorEnabled === true;
  }

  get2FAStatus(userId: string): { enabled: boolean; secret?: string } {
    const user = this.getCurrentUser();
    if (user?.id !== userId) {
      return { enabled: false };
    }

    return {
      enabled: user.adminAccess?.twoFactorEnabled || false,
      secret: user.adminAccess?.twoFactorSecret
    };
  }

  // Get permissions for admin level
  private getPermissionsForLevel(level: 'admin' | 'super_admin' | 'moderator'): string[] {
    switch (level) {
      case 'super_admin':
        return [
          'user_management',
          'restaurant_management', 
          'system_settings',
          'analytics',
          'content_moderation',
          'billing_management',
          'security_settings'
        ];
      case 'admin':
        return [
          'user_management',
          'restaurant_management',
          'system_settings',
          'analytics',
          'content_moderation'
        ];
      case 'moderator':
        return [
          'content_moderation',
          'user_management',
          'analytics'
        ];
      default:
        return [];
    }
  }

  // Reset password method
  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const supabase = getSupabaseClient();
      
      // Check if Supabase is properly configured
      if (!isSupabaseAvailable()) {
        return { 
          error: { 
            message: 'Supabase is not properly configured. Please check your environment variables.' 
          } 
        };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error: any) {
      return { 
        error: { 
          message: `Password reset failed: ${error.message || 'Unknown error'}` 
        } 
      };
    }
  }
}

export default AuthService.getInstance(); 