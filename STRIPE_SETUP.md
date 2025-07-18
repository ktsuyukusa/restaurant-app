# Stripe Payment Integration Setup

This guide will help you set up Stripe payment processing for your multilingual dining app.

## Prerequisites

1. A Stripe account (free to create)
2. A web application domain

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

## Step 2: Environment Variables Setup

Update your `.env.local` file with the following variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51HEPeKHDciAfHF4XWMChPT07lSjGrbNhz2ZWhqKszcdG2BOwyZbRHRdYkMKg3OoAGAyIztd3yxY5BMHP7itw8FMd00BRBijcCL

# For production, you'll also need backend environment variables:
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```