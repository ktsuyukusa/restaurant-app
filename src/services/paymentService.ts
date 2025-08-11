// Payment service for handling Stripe integration

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_url?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'stripe';
  merchant_id: string;
  api_key: string;
  webhook_secret?: string;
}

export interface OrderPayment {
  order_id: string;
  restaurant_id: string;
  amount: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

class PaymentService {
  private stripePublishableKey: string;

  constructor() {
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    
    // Debug logging for Stripe configuration
    console.log('Stripe Configuration:', {
      hasKey: !!this.stripePublishableKey,
      keyLength: this.stripePublishableKey.length,
      keyPrefix: this.stripePublishableKey.substring(0, 10),
      keyType: typeof this.stripePublishableKey
    });

    // Initialize Stripe with error handling
    try {
      if (this.stripePublishableKey) {
        console.log('Initializing Stripe with key:', this.stripePublishableKey.substring(0, 20) + '...');
        // Stripe will be loaded dynamically when needed
      } else {
        console.log('No Stripe key provided, Stripe will not be available');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  // Safe URL construction helper
  private createSafeUrl(baseUrl: string, path: string): string {
    try {
      // Ensure baseUrl is valid
      if (!baseUrl || typeof baseUrl !== 'string') {
        console.warn('Invalid baseUrl provided:', baseUrl);
        return 'https://localhost' + path;
      }
      
      // Construct URL safely
      const url = new URL(path, baseUrl);
      return url.toString();
    } catch (error) {
      console.error('Error creating URL:', { baseUrl, path, error });
      return 'https://localhost' + path;
    }
  }

  // Stripe Payment Integration
  async createStripeSession(order: OrderPayment): Promise<PaymentSession> {
    try {
      // For client-side Stripe, we'll create a checkout session
      const baseUrl = window.location.origin || 'http://localhost:8080';
      console.log('Payment service - baseUrl:', baseUrl);
      
      // Use safe URL construction
      const apiUrl = this.createSafeUrl(baseUrl, '/api/create-stripe-session');
      console.log('Payment service - apiUrl:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.order_id,
          amount: order.amount,
          currency: order.currency || 'jpy',
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          items: order.items,
          restaurant_id: order.restaurant_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.sessionId,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        payment_url: data.url,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Stripe session creation error:', error);
      throw error;
    }
  }

  // Create payment session (Stripe only)
  async createPaymentSession(order: OrderPayment): Promise<PaymentSession> {
    // For development/testing, if API key is not set, return a mock session
    if (!this.stripePublishableKey) {
      console.log('Stripe API key not configured, using mock payment session');
      return {
        id: `mock-${Date.now()}`,
        amount: order.amount,
        currency: order.currency,
        status: 'pending',
        payment_url: undefined, // No redirect for mock
        created_at: new Date().toISOString(),
      };
    }

    return this.createStripeSession(order);
  }

  // Verify payment status
  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const baseUrl = window.location.origin || 'http://localhost:8080';
      const apiUrl = this.createSafeUrl(baseUrl, '/api/verify-payment');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          method: 'stripe',
        }),
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.verified === true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Handle webhook notifications
  async handleWebhook(payload: unknown, signature: string): Promise<boolean> {
    try {
      const baseUrl = window.location.origin || 'http://localhost:8080';
      const apiUrl = this.createSafeUrl(baseUrl, '/api/webhook');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body: JSON.stringify({
          payload,
          method: 'stripe',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  // Get supported payment methods for a restaurant
  getSupportedPaymentMethods(restaurant: {stripe_account_id?: string}): ('stripe')[] {
    const methods: ('stripe')[] = [];
    
    if (restaurant.stripe_account_id || this.stripePublishableKey) {
      methods.push('stripe');
    }
    
    return methods;
  }

  // Get payment method display name
  getPaymentMethodName(method: 'stripe'): string {
    switch (method) {
      case 'stripe':
        return 'Stripe (Credit Card, Apple Pay, Google Pay)';
      default:
        return method;
    }
  }

  // Get Stripe publishable key for client-side integration
  getStripePublishableKey(): string {
    return this.stripePublishableKey;
  }

  // Check if Stripe is configured
  isStripeConfigured(): boolean {
    return !!this.stripePublishableKey && 
           this.stripePublishableKey !== 'pk_test_your_stripe_publishable_key_here' &&
           this.stripePublishableKey !== 'pk_live_your_stripe_publishable_key_here';
  }
}

export const paymentService = new PaymentService();
export default paymentService;  