# Vercel Environment Variables Setup Guide

## 🚨 CRITICAL: Deployment Issue Resolution

Your Vercel deployment is failing because required environment variables are missing. This guide will help you set up all necessary environment variables in Vercel.

## Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `restaurant-app`
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

## Step 2: Add Required Environment Variables

### Essential Variables (Required for Basic Functionality)

Add these variables one by one:

#### 1. Supabase Configuration
```
Name: VITE_SUPABASE_URL
Value: https://qqcoooscyzhyzmrcvsxi.supabase.co
Environment: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E
Environment: Production, Preview, Development
```

#### 2. Stripe Configuration
```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51HEPeKHDciAfHF4XWMChPT07lSjGrbNhz2ZWhqKszcdG2BOwyZbRHRdYkMKg3OoAGAyIztd3yxY5BMHP7itw8FMd00BRBijcCL
Environment: Production, Preview, Development
```

#### 3. Application Configuration
```
Name: VITE_APP_NAME
Value: Navikko
Environment: Production, Preview, Development
```

```
Name: VITE_LOGO_URL
Value: https://www.canva.com/design/DAGtJGufdF0/mYh2U-2EoQPIvJK7Ntwf7A/view?utm_content=DAGtJGufdF0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3a9a6cf222
Environment: Production, Preview, Development
```

### Optional Variables (Recommended for Full Functionality)

#### 4. Map Configuration
```
Name: VITE_DEFAULT_LATITUDE
Value: 36.2342
Environment: Production, Preview, Development
```

```
Name: VITE_DEFAULT_LONGITUDE
Value: 138.4792
Environment: Production, Preview, Development
```

```
Name: VITE_MAP_BBOX_OFFSET
Value: 0.02
Environment: Production, Preview, Development
```

#### 5. AZ Dining Photo URLs
```
Name: VITE_AZ_DINING_MAIN_IMAGE
Value: https://www.instagram.com/p/DH8JUTQzprp/
Environment: Production, Preview, Development
```

```
Name: VITE_AZ_DINING_INTERIOR_IMAGE
Value: https://www.instagram.com/p/DGiOOQ8hzYt/?img_index=1
Environment: Production, Preview, Development
```

```
Name: VITE_AZ_DINING_DISH_IMAGE
Value: https://www.instagram.com/p/DL-VY2UBfgm/?img_index=1
Environment: Production, Preview, Development
```

```
Name: VITE_AZ_DINING_ANOTHER_DISH
Value: https://www.instagram.com/p/DG5OQyMBgKg/
Environment: Production, Preview, Development
```

## Step 3: API Environment Variables (For Serverless Functions)

### Stripe API Keys (For Payment Processing)
```
Name: STRIPE_SECRET_KEY
Value: [Your Stripe Secret Key - Get from Stripe Dashboard]
Environment: Production, Preview, Development
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: [Your Stripe Webhook Secret - Get from Stripe Dashboard]
Environment: Production, Preview, Development
```

## Step 4: Verify Configuration

After adding all variables:

1. **Save** all environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on your latest deployment
4. Monitor the build logs for any remaining issues

## Step 5: Test Deployment

Once the deployment succeeds:

1. Visit your deployed app URL
2. Check the **App Status** component (if visible)
3. Verify that all services show as "✅ Connected" or "✅ Configured"

## Troubleshooting

### If Deployment Still Fails:

1. **Check Build Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure all variables are set correctly
3. **Check Variable Names**: Make sure they start with `VITE_` for frontend access
4. **Environment Selection**: Ensure variables are set for the correct environment (Production/Preview/Development)

### Common Issues:

- **Missing VITE_ prefix**: Frontend variables must start with `VITE_`
- **Incorrect values**: Double-check URLs and API keys
- **Environment mismatch**: Variables must be set for the deployment environment

## Security Notes

- **Never commit API keys** to your repository
- **Use different keys** for development and production
- **Rotate keys regularly** for security
- **Monitor usage** of your API keys

## Next Steps

After successful deployment:

1. Test all app functionality
2. Verify payment processing (if using Stripe)
3. Check database connectivity (if using Supabase)
4. Monitor app performance and errors

## Support

If you continue to have issues:

1. Check the Vercel build logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your local `.env` file matches the Vercel configuration
4. Contact support if the issue persists

---

**Note**: This configuration should resolve the deployment failures you've been experiencing. The key issue was missing environment variables that the app requires to function properly. 