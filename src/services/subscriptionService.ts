import { getSupabaseClient } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  plan_code: 'starter' | 'standard' | 'premium';
  name_en: string;
  name_ja: string;
  description_en: string;
  description_ja: string;
  features: string[];
  max_menu_items: number;
  max_languages: number;
  has_reservations: boolean;
  has_analytics: boolean;
  has_api_access: boolean;
  has_multi_location: boolean;
}

export interface SubscriptionPricing {
  id: string;
  plan_id: string;
  country_code: string;
  currency: string;
  price_monthly: number;
  price_yearly: number;
  multiplier: number;
  stripe_price_id?: string;
  paypal_plan_id?: string;
  komoju_plan_id?: string;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  country_code: string;
  currency: string;
  amount: number;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  paypal_subscription_id?: string;
  komoju_subscription_id?: string;
}

export interface PaymentProvider {
  name: 'stripe' | 'paypal' | 'komoju';
  display_name: string;
  supported_countries: string[];
  supported_methods: string[];
}

// Regional pricing multipliers
const PRICING_MULTIPLIERS: Record<string, number> = {
  'JP': 1.0,   // Japan - Base pricing
  'KR': 1.0,   // South Korea - Base pricing
  'MY': 0.6,   // Malaysia - 60%
  'TH': 0.6,   // Thailand - 60%
  'ID': 0.4,   // Indonesia - 40%
  'VN': 0.4,   // Vietnam - 40%
  'PL': 0.7,   // Poland - 70%
  'RO': 0.5,   // Romania - 50%
};

// Currency mapping
const CURRENCY_MAP: Record<string, string> = {
  'JP': 'JPY',
  'KR': 'KRW',
  'MY': 'MYR',
  'TH': 'THB',
  'ID': 'IDR',
  'VN': 'VND',
  'PL': 'PLN',
  'RO': 'RON',
};

// Payment providers by country
const PAYMENT_PROVIDERS: Record<string, PaymentProvider[]> = {
  'JP': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['JP'],
      supported_methods: ['card', 'apple_pay', 'google_pay']
    },
    {
      name: 'komoju',
      display_name: 'Komoju (Local Payments)',
      supported_countries: ['JP'],
      supported_methods: ['card', 'convenience_store', 'bank_transfer', 'pay_easy']
    }
  ],
  'KR': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['KR'],
      supported_methods: ['card', 'apple_pay', 'google_pay']
    }
  ],
  'MY': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['MY'],
      supported_methods: ['card', 'grabpay', 'fpx']
    }
  ],
  'TH': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['TH'],
      supported_methods: ['card', 'promptpay', 'truemoney']
    }
  ],
  'ID': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['ID'],
      supported_methods: ['card', 'gopay', 'ovo']
    }
  ],
  'VN': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['VN'],
      supported_methods: ['card']
    }
  ],
  'PL': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['PL'],
      supported_methods: ['card', 'blik', 'p24']
    }
  ],
  'RO': [
    {
      name: 'stripe',
      display_name: 'Credit Card (Stripe)',
      supported_countries: ['RO'],
      supported_methods: ['card', 'sepa_debit']
    }
  ]
};

export class SubscriptionService {
  private supabase = getSupabaseClient();

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .order('plan_code');

    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get pricing for a specific country
   */
  async getPricingForCountry(countryCode: string): Promise<SubscriptionPricing[]> {
    const { data, error } = await this.supabase
      .from('subscription_pricing')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('country_code', countryCode)
      .order('plan_id');

    if (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get available payment providers for a country
   */
  getPaymentProviders(countryCode: string): PaymentProvider[] {
    return PAYMENT_PROVIDERS[countryCode] || PAYMENT_PROVIDERS['JP']; // Fallback to Japan
  }

  /**
   * Calculate price for a plan in a specific country
   */
  calculatePrice(basePriceJPY: number, countryCode: string): number {
    const multiplier = PRICING_MULTIPLIERS[countryCode] || 1.0;
    return Math.round(basePriceJPY * multiplier);
  }

  /**
   * Get currency for a country
   */
  getCurrency(countryCode: string): string {
    return CURRENCY_MAP[countryCode] || 'JPY';
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number, currency: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      'JPY': new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
      'KRW': new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
      'MYR': new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }),
      'THB': new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }),
      'IDR': new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }),
      'VND': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
      'PLN': new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }),
      'RON': new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }),
    };

    const formatter = formatters[currency] || formatters['JPY'];
    return formatter.format(amount);
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: {
    restaurant_id: string;
    plan_id: string;
    country_code: string;
    payment_provider: string;
    payment_method_id?: string;
  }): Promise<Subscription> {
    // Get pricing for the plan and country
    const { data: pricing, error: pricingError } = await this.supabase
      .from('subscription_pricing')
      .select('*')
      .eq('plan_id', data.plan_id)
      .eq('country_code', data.country_code)
      .single();

    if (pricingError || !pricing) {
      throw new Error('Pricing not found for this plan and country');
    }

    // Calculate subscription period (30 days from now)
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscriptionData = {
      restaurant_id: data.restaurant_id,
      plan_id: data.plan_id,
      status: 'trialing' as const, // Start with trial
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_end: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
      country_code: data.country_code,
      currency: pricing.currency,
      amount: pricing.price_monthly,
      cancel_at_period_end: false,
    };

    const { data: subscription, error } = await this.supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }

    return subscription;
  }

  /**
   * Get subscription for a restaurant
   */
  async getRestaurantSubscription(restaurantId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching subscription:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: Subscription['status'],
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    const updateData: Record<string, string | number | boolean> = {
      status,
      updated_at: new Date().toISOString(),
      ...metadata
    };

    const { error } = await this.supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Record a payment
   */
  async recordPayment(data: {
    subscription_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
    payment_method: string;
    payment_provider: 'stripe' | 'paypal' | 'komoju';
    provider_payment_id: string;
    description?: string;
    receipt_url?: string;
    failure_reason?: string;
  }): Promise<void> {
    const paymentData = {
      subscription_id: data.subscription_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      payment_method: data.payment_method,
      payment_provider: data.payment_provider,
      description: data.description,
      receipt_url: data.receipt_url,
      failure_reason: data.failure_reason,
      // Set provider-specific ID based on provider
      ...(data.payment_provider === 'stripe' && { stripe_payment_intent_id: data.provider_payment_id }),
      ...(data.payment_provider === 'paypal' && { paypal_payment_id: data.provider_payment_id }),
      ...(data.payment_provider === 'komoju' && { komoju_payment_id: data.provider_payment_id }),
    };

    const { error } = await this.supabase
      .from('payments')
      .insert([paymentData]);

    if (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Check if restaurant has access to a feature
   */
  async hasFeatureAccess(restaurantId: string, feature: string): Promise<boolean> {
    const subscription = await this.getRestaurantSubscription(restaurantId);
    
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    // Get plan details
    const { data: plan, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription.plan_id)
      .single();

    if (error || !plan) {
      return false;
    }

    // Check feature access based on plan
    switch (feature) {
      case 'reservations':
        return plan.has_reservations;
      case 'analytics':
        return plan.has_analytics;
      case 'api_access':
        return plan.has_api_access;
      case 'multi_location':
        return plan.has_multi_location;
      default:
        return true; // Basic features are available to all plans
    }
  }

  /**
   * Get usage limits for a restaurant
   */
  async getUsageLimits(restaurantId: string): Promise<{
    max_menu_items: number;
    max_languages: number;
    current_menu_items: number;
    current_languages: number;
  }> {
    const subscription = await this.getRestaurantSubscription(restaurantId);
    
    if (!subscription) {
      return {
        max_menu_items: 0,
        max_languages: 0,
        current_menu_items: 0,
        current_languages: 0
      };
    }

    // Get plan limits
    const { data: plan } = await this.supabase
      .from('subscription_plans')
      .select('max_menu_items, max_languages')
      .eq('id', subscription.plan_id)
      .single();

    // Get current usage
    const { data: menuItems } = await this.supabase
      .from('menu_items')
      .select('id')
      .eq('restaurant_id', restaurantId);

    return {
      max_menu_items: plan?.max_menu_items || 0,
      max_languages: plan?.max_languages || 0,
      current_menu_items: menuItems?.length || 0,
      current_languages: 1 // This would need to be calculated based on actual usage
    };
  }
}

export const subscriptionService = new SubscriptionService();