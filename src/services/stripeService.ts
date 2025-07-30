import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;

// Stripe webhook event types
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

interface StripeCheckoutSession {
  id: string;
  customer: string;
  subscription: string;
  metadata: Record<string, string>;
}

interface StripeSubscriptionObject {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface StripeInvoice {
  id: string;
  subscription: string;
  customer: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
}

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Stripe Price IDs for different plans (these would be created in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: 'price_starter_monthly',
    yearly: 'price_starter_yearly'
  },
  standard: {
    monthly: 'price_standard_monthly',
    yearly: 'price_standard_yearly'
  },
  premium: {
    monthly: 'price_premium_monthly',
    yearly: 'price_premium_yearly'
  }
};

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  restaurantId: string;
  successUrl: string;
  cancelUrl: string;
  countryCode: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  country?: string;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: 'month' | 'year';
        };
      };
    }>;
  };
}

class StripeService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<void> {
    this.stripe = await getStripe();
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  }

  // Create a checkout session for subscription
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ sessionId: string; url: string }> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      return { sessionId, url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      await this.initialize();
    }

    const { error } = await this.stripe!.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  }

  // Create a customer portal session for subscription management
  async createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return { url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  // Get customer information
  async getCustomer(customerId: string): Promise<StripeCustomer> {
    try {
      const response = await fetch(`/api/stripe/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  // Get subscription information
  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<StripeSubscription> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: newPriceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as unknown as StripeCheckoutSession);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as unknown as StripeSubscriptionObject);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as unknown as StripeSubscriptionObject);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as unknown as StripeSubscriptionObject);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as unknown as StripeInvoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as unknown as StripeInvoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: StripeCheckoutSession): Promise<void> {
    const { customer, subscription, metadata } = session;
    
    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        stripe_customer_id: customer,
        stripe_subscription_id: subscription,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', metadata.userId);
  }

  private async handleSubscriptionCreated(subscription: StripeSubscriptionObject): Promise<void> {
    const { customer, id, status, current_period_start, current_period_end } = subscription;
    
    // Find user by customer ID and update subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', customer)
      .single();

    if (existingSubscription) {
      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: id,
          status: status,
          current_period_start: new Date(current_period_start * 1000).toISOString(),
          current_period_end: new Date(current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
    }
  }

  private async handleSubscriptionUpdated(subscription: StripeSubscriptionObject): Promise<void> {
    const { id, status, current_period_start, current_period_end, cancel_at_period_end } = subscription;
    
    await supabase
      .from('subscriptions')
      .update({
        status: status,
        current_period_start: new Date(current_period_start * 1000).toISOString(),
        current_period_end: new Date(current_period_end * 1000).toISOString(),
        cancel_at_period_end: cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', id);
  }

  private async handleSubscriptionDeleted(subscription: StripeSubscriptionObject): Promise<void> {
    const { id } = subscription;
    
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', id);
  }

  private async handlePaymentSucceeded(invoice: StripeInvoice): Promise<void> {
    const { subscription, customer } = invoice;
    
    // Update payment record
    await supabase
      .from('payments')
      .insert({
        subscription_id: subscription,
        stripe_customer_id: customer,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        stripe_invoice_id: invoice.id,
        created_at: new Date().toISOString(),
      });
  }

  private async handlePaymentFailed(invoice: StripeInvoice): Promise<void> {
    const { subscription, customer } = invoice;
    
    // Update payment record
    await supabase
      .from('payments')
      .insert({
        subscription_id: subscription,
        stripe_customer_id: customer,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        stripe_invoice_id: invoice.id,
        created_at: new Date().toISOString(),
      });

    // Update subscription status if payment failed
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription);
  }
}

export const stripeService = new StripeService();