import { createClient } from '@supabase/supabase-js';
import { validateAdminCode, getAdminLevel } from '@/config/adminCodes';

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

// Mock Supabase client (replace with real credentials)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    this.loadUserFromStorage();
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

  // Check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const storedUserData = localStorage.getItem('navikko_user_data');
    if (!storedUserData) {
      return false;
    }

    try {
      const userData = JSON.parse(storedUserData);
      return userData.email === email;
    } catch (error) {
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `customer_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      userType: 'customer',
      locationConsent: data.locationConsent,
      paymentMethods: [],
      createdAt: new Date().toISOString()
    };

    console.log('Created user object:', user);
    this.currentUser = user;
    this.saveUserToStorage(user);
    console.log('Customer signup successful for user:', user);
    return user;
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

    // Check if subscription is required (in real app, this would check payment)
    const hasSubscription = await this.checkRestaurantSubscription(data.email);
    if (!hasSubscription) {
      throw new Error('Restaurant subscription is required. Please purchase a subscription first.');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `restaurant_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      userType: 'restaurant_owner',
      restaurantInfo: {
        name: data.restaurantInfo.name,
        address: data.restaurantInfo.address,
        phone: data.restaurantInfo.phone,
        cuisine: data.restaurantInfo.cuisine || 'Other',
        subscriptionId: `sub_${Date.now()}`
      },
      subscription: {
        id: `sub_${Date.now()}`,
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        price: 5000,
        currency: 'JPY'
      },
      createdAt: new Date().toISOString()
    };

    this.currentUser = user;
    this.saveUserToStorage(user);
    return user;
  }

  // Admin signup with strict access control
  async signupAdmin(data: SignupData): Promise<User> {
    if (data.userType !== 'admin') {
      throw new Error('Invalid user type for admin signup');
    }

    // Validate admin code using secure configuration
    if (!data.adminCode || !validateAdminCode(data.adminCode)) {
      throw new Error('Invalid admin access code');
    }

    // Additional validation for admin signup
    if (!data.email || !data.password || !data.name || !data.phone) {
      throw new Error('All fields are required');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: `admin_${Date.now()}`,
      email: data.email,
      name: data.name,
      phone: data.phone,
      userType: 'admin',
      adminAccess: {
        level: getAdminLevel(data.adminCode) || 'admin',
        permissions: ['user_management', 'restaurant_management', 'system_settings', 'analytics'],
        accessCode: data.adminCode
      },
      createdAt: new Date().toISOString()
    };

    this.currentUser = user;
    this.saveUserToStorage(user);
    return user;
  }

  // Main signup method
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

  // Login method
  async login(data: LoginData): Promise<User> {
    console.log('Login attempt for email:', data.email);
    
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists in localStorage (in real app, this would query the database)
    const storedUserData = localStorage.getItem('navikko_user_data');
    console.log('Stored user data:', storedUserData);
    
    if (!storedUserData) {
      throw new Error('No such user. Please sign up first.');
    }

    try {
      const userData = JSON.parse(storedUserData);
      console.log('Parsed user data:', userData);
      
      // Check if email matches (in real app, you would also verify password hash)
      if (userData.email !== data.email) {
        throw new Error('Invalid email or password');
      }

      // For demo purposes, we'll accept any password if email matches
      // In real app, you would verify the password hash here
      
      this.currentUser = userData;
      this.saveUserToStorage(userData);
      console.log('Login successful for user:', userData);
      return userData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      throw new Error('Invalid user data. Please sign up again.');
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

  // Google Sign-In method
  async signInWithGoogle(googleUser: GoogleUser, signInData: GoogleSignInData): Promise<User> {
    console.log('Google Sign-In attempt for email:', googleUser.email);
    
    // Check if user already exists
    const userExists = await this.checkUserExists(googleUser.email);
    
    if (userExists) {
      // User exists, perform login
      const storedUserData = localStorage.getItem('navikko_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.email === googleUser.email) {
          this.currentUser = userData;
          this.saveUserToStorage(userData);
          console.log('Google Sign-In successful (existing user):', userData);
          return userData;
        }
      }
    }

    // User doesn't exist, create new account
    const user: User = {
      id: `${signInData.userType}_${Date.now()}`,
      email: googleUser.email,
      name: googleUser.name,
      phone: signInData.phone || '',
      userType: signInData.userType,
      locationConsent: signInData.locationConsent || false,
      paymentMethods: [],
      restaurantInfo: signInData.restaurantInfo,
      adminAccess: signInData.adminCode ? {
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

    console.log('Created user object via Google Sign-In:', user);
    this.currentUser = user;
    this.saveUserToStorage(user);
    console.log('Google Sign-In successful (new user):', user);
    return user;
  }
}

export default AuthService.getInstance(); 