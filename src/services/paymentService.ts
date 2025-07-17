// Payment service for handling KOMOJU and PAY.JP integrations

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
  type: 'komoju' | 'payjp';
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
  private komojuApiKey: string;
  private payjpApiKey: string;

  constructor() {
    this.komojuApiKey = import.meta.env.VITE_KOMOJU_API_KEY || '';
    this.payjpApiKey = import.meta.env.VITE_PAYJP_API_KEY || '';
  }

  // KOMOJU Payment Integration
  async createKomojuSession(order: OrderPayment): Promise<PaymentSession> {
    try {
      const response = await fetch('https://komoju.com/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(this.komojuApiKey + ':')}`,
        },
        body: JSON.stringify({
          amount: order.amount,
          currency: order.currency || 'JPY',
          external_order_num: order.order_id,
          payment_data: {
            payment_method_types: ['credit_card', 'paypay', 'apple_pay'],
            locale: 'ja',
            return_url: `${window.location.origin}/order/confirmation/${order.order_id}`,
            cancel_url: `${window.location.origin}/order/cancel/${order.order_id}`,
          },
          metadata: {
            restaurant_id: order.restaurant_id,
            customer_email: order.customer_email,
            customer_name: order.customer_name,
            items: JSON.stringify(order.items),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`KOMOJU API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        payment_url: data.redirect_url,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('KOMOJU session creation error:', error);
      throw error;
    }
  }

  // PAY.JP Payment Integration
  async createPayjpSession(order: OrderPayment): Promise<PaymentSession> {
    try {
      const response = await fetch('https://api.pay.jp/v1/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(this.payjpApiKey + ':')}`,
        },
        body: new URLSearchParams({
          amount: order.amount.toString(),
          currency: order.currency || 'jpy',
          description: `Order ${order.order_id} - ${order.customer_name}`,
          metadata: JSON.stringify({
            order_id: order.order_id,
            restaurant_id: order.restaurant_id,
            customer_email: order.customer_email,
            customer_name: order.customer_name,
            items: JSON.stringify(order.items),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`PAY.JP API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.paid ? 'completed' : 'pending',
        created_at: data.created,
      };
    } catch (error) {
      console.error('PAY.JP session creation error:', error);
      throw error;
    }
  }

  // Create payment session based on method
  async createPaymentSession(
    order: OrderPayment, 
    method: 'komoju' | 'payjp'
  ): Promise<PaymentSession> {
    // For development/testing, if API keys are not set, return a mock session
    if (!this.komojuApiKey && !this.payjpApiKey) {
      console.log('Payment API keys not configured, using mock payment session');
      return {
        id: `mock-${Date.now()}`,
        amount: order.amount,
        currency: order.currency,
        status: 'pending',
        payment_url: undefined, // No redirect for mock
        created_at: new Date().toISOString(),
      };
    }

    switch (method) {
      case 'komoju':
        return this.createKomojuSession(order);
      case 'payjp':
        return this.createPayjpSession(order);
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  // Verify payment status
  async verifyPayment(sessionId: string, method: 'komoju' | 'payjp'): Promise<boolean> {
    try {
      if (method === 'komoju') {
        const response = await fetch(`https://komoju.com/api/v1/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Basic ${btoa(this.komojuApiKey + ':')}`,
          },
        });

        if (!response.ok) return false;
        const data = await response.json();
        return data.status === 'authorized' || data.status === 'captured';
      } else if (method === 'payjp') {
        const response = await fetch(`https://api.pay.jp/v1/charges/${sessionId}`, {
          headers: {
            'Authorization': `Basic ${btoa(this.payjpApiKey + ':')}`,
          },
        });

        if (!response.ok) return false;
        const data = await response.json();
        return data.paid === true;
      }
      return false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Handle webhook notifications
  async handleWebhook(
    payload: any, 
    signature: string, 
    method: 'komoju' | 'payjp'
  ): Promise<boolean> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature, method)) {
        return false;
      }

      // Process webhook based on method
      if (method === 'komoju') {
        return this.processKomojuWebhook(payload);
      } else if (method === 'payjp') {
        return this.processPayjpWebhook(payload);
      }

      return false;
    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  private verifyWebhookSignature(
    payload: any, 
    signature: string, 
    method: 'komoju' | 'payjp'
  ): boolean {
    // Implement signature verification based on payment provider
    // This is a simplified version - in production, you'd verify the actual signature
    return true;
  }

  private async processKomojuWebhook(payload: any): Promise<boolean> {
    try {
      const { session_id, status, external_order_num } = payload;
      
      if (status === 'authorized' || status === 'captured') {
        // Update order status in database
        const { error } = await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: external_order_num,
            status: 'paid',
            payment_session_id: session_id,
          }),
        });

        return !error;
      }
      return false;
    } catch (error) {
      console.error('KOMOJU webhook processing error:', error);
      return false;
    }
  }

  private async processPayjpWebhook(payload: any): Promise<boolean> {
    try {
      const { id, paid, metadata } = payload;
      
      if (paid && metadata?.order_id) {
        // Update order status in database
        const { error } = await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: metadata.order_id,
            status: 'paid',
            payment_session_id: id,
          }),
        });

        return !error;
      }
      return false;
    } catch (error) {
      console.error('PAY.JP webhook processing error:', error);
      return false;
    }
  }

  // Get supported payment methods for a restaurant
  getSupportedPaymentMethods(restaurant: any): ('komoju' | 'payjp')[] {
    const methods: ('komoju' | 'payjp')[] = [];
    
    if (restaurant.komoju_merchant_id) {
      methods.push('komoju');
    }
    
    if (restaurant.payjp_merchant_id) {
      methods.push('payjp');
    }
    
    return methods;
  }

  // Get payment method display name
  getPaymentMethodName(method: 'komoju' | 'payjp'): string {
    switch (method) {
      case 'komoju':
        return 'KOMOJU (Credit Card, PayPay, Apple Pay)';
      case 'payjp':
        return 'PAY.JP (Credit Card)';
      default:
        return method;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService; 