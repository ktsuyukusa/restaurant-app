// Payment fallback service for handling Komoju issues
// This provides a Stripe-only mode when Komoju is not available

import paymentService, { OrderPayment } from './paymentService';

export interface PaymentConfig {
  mode: 'stripe-only' | 'komoju-stripe' | 'full';
  stripeEnabled: boolean;
  komojuEnabled: boolean;
}

class PaymentFallbackService {
  private config: PaymentConfig;

  constructor() {
    // Check environment variables to determine payment mode
    const komojuAvailable = this.checkKomojuAvailability();
    const stripeAvailable = this.checkStripeAvailability();

    this.config = {
      mode: komojuAvailable ? 'full' : 'stripe-only',
      stripeEnabled: stripeAvailable,
      komojuEnabled: komojuAvailable
    };

    console.log('Payment Fallback Service initialized:', this.config);
  }

  private checkKomojuAvailability(): boolean {
    // Check if Komoju credentials are available and working
    const komojuKey = import.meta.env.VITE_KOMOJU_API_KEY;
    const komojuEnabled = import.meta.env.VITE_KOMOJU_ENABLED === 'true';
    
    // For now, disable Komoju due to 2FA issues
    return false; // Set to true when Komoju 2FA is resolved
  }

  private checkStripeAvailability(): boolean {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return !!stripeKey && stripeKey !== 'pk_test_your_stripe_publishable_key_here';
  }

  public getConfig(): PaymentConfig {
    return this.config;
  }

  public getAvailablePaymentMethods(): string[] {
    const methods: string[] = [];
    
    if (this.config.stripeEnabled) {
      methods.push('stripe');
    }
    
    if (this.config.komojuEnabled) {
      methods.push('komoju');
    }
    
    return methods;
  }

  public isPaymentMethodAvailable(method: string): boolean {
    switch (method) {
      case 'stripe':
        return this.config.stripeEnabled;
      case 'komoju':
        return this.config.komojuEnabled;
      default:
        return false;
    }
  }

  public getPaymentMethodDisplayName(method: string): string {
    switch (method) {
      case 'stripe':
        return 'Credit Card (Stripe)';
      case 'komoju':
        return 'Multiple Payment Methods (Komoju)';
      default:
        return method;
    }
  }

  public async createPaymentSession(orderData: OrderPayment, preferredMethod?: string) {
    const availableMethods = this.getAvailablePaymentMethods();
    
    if (availableMethods.length === 0) {
      throw new Error('No payment methods available');
    }

    // Use preferred method if available, otherwise use first available
    const method = preferredMethod && this.isPaymentMethodAvailable(preferredMethod) 
      ? preferredMethod 
      : availableMethods[0];

    switch (method) {
      case 'stripe':
        return await paymentService.createPaymentSession(orderData);
      case 'komoju':
        // Implement Komoju integration when 2FA is resolved
        throw new Error('Komoju payment method is temporarily unavailable');
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  public getPaymentStatusMessage(): string {
    if (this.config.mode === 'stripe-only') {
      return 'Currently using Stripe for payment processing. Komoju integration is temporarily unavailable.';
    } else if (this.config.mode === 'full') {
      return 'All payment methods are available.';
    } else {
      return 'Limited payment methods available.';
    }
  }
}

export const paymentFallbackService = new PaymentFallbackService();
export default paymentFallbackService;