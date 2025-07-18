const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Webhook service not configured' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook service not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  console.log('Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Webhook event handlers
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update order status in your database
  // You can access order details from metadata
  const orderId = paymentIntent.metadata?.order_id;
  if (orderId) {
    // Update order status to 'paid'
    console.log(`Updating order ${orderId} to paid status`);
    // Add your database update logic here
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  const orderId = paymentIntent.metadata?.order_id;
  if (orderId) {
    // Update order status to 'failed'
    console.log(`Updating order ${orderId} to failed status`);
    // Add your database update logic here
  }
}

async function handleChargeSucceeded(charge) {
  console.log('Charge succeeded:', charge.id);
  // Additional charge success handling if needed
}

async function handleChargeFailed(charge) {
  console.log('Charge failed:', charge.id);
  // Additional charge failure handling if needed
}

async function handleChargeRefunded(charge) {
  console.log('Charge refunded:', charge.id);
  
  const orderId = charge.metadata?.order_id;
  if (orderId) {
    // Update order status to 'refunded'
    console.log(`Updating order ${orderId} to refunded status`);
    // Add your database update logic here
  }
}

async function handleCustomerCreated(customer) {
  console.log('Customer created:', customer.id);
  
  // Store customer information in your database
  const customerData = {
    stripe_customer_id: customer.id,
    email: customer.email,
    name: customer.name,
    created_at: new Date().toISOString()
  };
  
  console.log('Storing customer data:', customerData);
  // Add your database insert logic here
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  const orderId = session.metadata?.order_id;
  if (orderId) {
    // Confirm order completion
    console.log(`Confirming order ${orderId} completion`);
    // Add your order confirmation logic here
  }
}

async function handleCheckoutSessionExpired(session) {
  console.log('Checkout session expired:', session.id);
  
  const orderId = session.metadata?.order_id;
  if (orderId) {
    // Clean up expired session
    console.log(`Cleaning up expired session for order ${orderId}`);
    // Add your cleanup logic here
  }
}

// Configure for raw body parsing
module.exports.config = {
  api: {
    bodyParser: false,
  },
}; 