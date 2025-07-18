# Stripe & Square Payment Integration Setup

This guide will help you set up Stripe and Square payment processing for your multilingual dining app.

## Prerequisites

1. A Stripe account (free to create)
2. A Square account (free to create)
3. A web application domain

## Step 1: Stripe Setup

### 1.1 Create a Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete your business verification

### 1.2 Get Your API Keys
1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two important keys:
   - **Publishable key** (starts with `pk_`) - Safe for frontend
   - **Secret key** (starts with `sk_`) - Keep secret, use only in backend

### 1.3 Configure Webhooks (Optional)
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret

## Step 2: Square Setup

### 2.1 Create a Square Account
1. Go to [Square Dashboard](https://squareup.com/dashboard/)
2. Sign up for a free account
3. Complete your business verification

### 2.2 Get Your Application Credentials
1. Go to **Developers** → **Applications**
2. Create a new application or use the default one
3. Copy the **Application ID**
4. Go to **Locations** and copy your **Location ID**

### 2.3 Get Your API Keys
1. Go to **Developers** → **API Keys**
2. Copy your **Access Token** (this is your secret key)
3. For production, you'll need to get a production access token

## Step 3: Environment Variables Setup

Update your `.env.local` file with the following variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Square Configuration
VITE_SQUARE_APPLICATION_ID=sq0idp_your_square_application_id_here
VITE_SQUARE_LOCATION_ID=your_square_location_id_here

# For production, you'll also need backend environment variables:
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# SQUARE_ACCESS_TOKEN=your_square_access_token_here
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 4: Backend API Setup

You'll need to create backend API endpoints to handle payment processing securely. Here are the endpoints you need to implement:

### 4.1 Create Stripe Checkout Session
**Endpoint:** `POST /api/create-stripe-session`

```javascript
// Example implementation (Node.js/Express)
app.post('/api/create-stripe-session', async (req, res) => {
  try {
    const { order_id, amount, currency, customer_email, customer_name, items, restaurant_id } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      line_items: items.map(item => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/order/cancel`,
      customer_email: customer_email,
      metadata: {
        order_id: order_id,
        restaurant_id: restaurant_id,
        customer_name: customer_name,
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.2 Create Square Checkout Session
**Endpoint:** `POST /api/create-square-session`

```javascript
// Example implementation (Node.js/Express)
app.post('/api/create-square-session', async (req, res) => {
  try {
    const { order_id, amount, currency, customer_email, customer_name, items, restaurant_id } = req.body;
    
    const checkoutApi = new square.CheckoutApi(client);
    
    const requestBody = {
      idempotencyKey: order_id,
      checkout: {
        amountMoney: {
          amount: amount * 100, // Convert to cents
          currency: currency,
        },
        redirectUrl: `${req.headers.origin}/order/success?checkout_id={CHECKOUT_ID}`,
        merchantSupportEmail: customer_email,
        prePopulateBuyerEmail: customer_email,
        prePopulateBuyerPhoneNumber: req.body.phone,
        note: `Order ${order_id} - ${customer_name}`,
        order: {
          referenceId: order_id,
          lineItems: items.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            basePriceMoney: {
              amount: item.price * 100,
              currency: currency,
            },
          })),
        },
      },
    };

    const response = await checkoutApi.createCheckout(locationId, requestBody);
    
    res.json({
      checkoutId: response.result.checkout.id,
      checkoutUrl: response.result.checkout.checkoutPageUrl,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.3 Payment Verification
**Endpoint:** `POST /api/verify-payment`

```javascript
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { session_id, method } = req.body;
    
    if (method === 'stripe') {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      res.json({ verified: session.payment_status === 'paid' });
    } else if (method === 'square') {
      const checkoutApi = new square.CheckoutApi(client);
      const response = await checkoutApi.getCheckout(session_id);
      res.json({ verified: response.result.checkout.status === 'COMPLETED' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.4 Webhook Handler
**Endpoint:** `POST /api/webhook`

```javascript
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    if (req.body.method === 'stripe') {
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Update order status in your database
        await updateOrderStatus(session.metadata.order_id, 'paid');
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

## Step 5: Frontend Integration

The frontend is already configured to work with Stripe and Square. The payment service will:

1. Create a payment session using the selected provider
2. Redirect the user to the payment provider's checkout page
3. Handle the success/cancel redirects
4. Verify payment status

## Step 6: Testing

### 6.1 Stripe Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

### 6.2 Square Test Cards
- **Success:** `4111 1111 1111 1111`
- **Decline:** `4000 0000 0000 0002`

## Step 7: Production Deployment

### 7.1 Update Environment Variables
Replace test keys with production keys:
- Use production Stripe publishable key (`pk_live_...`)
- Use production Square application ID and access token
- Set up production webhook endpoints

### 7.2 Security Considerations
- Never expose secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper error handling
- Add logging for payment events

## Step 8: Vercel Deployment

Add these environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the environment variables from your `.env.local` file

## Troubleshooting

### Common Issues:

1. **"Invalid URL" errors**: Make sure all URLs in environment variables are on single lines
2. **CORS errors**: Ensure your backend allows requests from your frontend domain
3. **Payment failures**: Check that you're using the correct test cards
4. **Webhook errors**: Verify webhook endpoints are accessible and properly configured

### Support Resources:

- [Stripe Documentation](https://stripe.com/docs)
- [Square Documentation](https://developer.squareup.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Square Support](https://squareup.com/help)

## Next Steps

1. Set up your Stripe and Square accounts
2. Add the environment variables to your `.env.local` file
3. Implement the backend API endpoints
4. Test the payment flow with test cards
5. Deploy to production with real API keys

The payment integration is now ready to accept real payments from your customers! 