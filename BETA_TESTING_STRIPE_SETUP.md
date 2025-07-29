# Beta Testing - Stripe Configuration Guide
*For Navikko Restaurant App Beta Testing Phase*

## ⚠️ IMPORTANT: Use Test Mode for Beta Testing

**DO NOT use production Stripe keys during beta testing!** Use Stripe's test environment to avoid real charges.

## Current Status Analysis

Based on your [`STRIPE_SETUP.md`](STRIPE_SETUP.md), you have a **production Stripe key** configured:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51HEPeKHDciAfHF4XWMChPT07lSjGrbNhz2ZWhqKszcdG2BOwyZbRHRdYkMKg3OoAGAyIztd3yxY5BMHP7itw8FMd00BRBijcCL
```

## Beta Testing Stripe Setup

### Step 1: Get Test Keys from Stripe Dashboard

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Switch to Test Mode**: Toggle the "Test mode" switch in the left sidebar
3. **Get Test Keys**: Go to Developers → API keys
   - **Test Publishable Key**: `pk_test_...` (safe for frontend)
   - **Test Secret Key**: `sk_test_...` (keep secret, backend only)

### Step 2: Create Beta Testing Environment File

Create a `.env.beta` file for beta testing:

```env
# Beta Testing Environment - Stripe Test Mode
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here

# App Configuration
VITE_APP_MODE=beta
VITE_APP_NAME=Navikko Beta
VITE_APP_URL=https://your-beta-domain.com

# Database (use separate beta database)
VITE_SUPABASE_URL=your_beta_supabase_url
VITE_SUPABASE_ANON_KEY=your_beta_supabase_key

# Payment Configuration
VITE_KOMOJU_ENABLED=false
VITE_STRIPE_ENABLED=true
VITE_PAYMENT_MODE=test

# Beta Testing Features
VITE_BETA_FEATURES=true
VITE_DEBUG_MODE=true
VITE_LOGGING_ENABLED=true
```

### Step 3: Test Payment Flow

With test keys, you can use Stripe's test card numbers:

#### Successful Test Cards
- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

#### Test Scenarios
- **Declined Card**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Expired Card**: `4000000000000069`

#### Test Details
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3-digit number (e.g., 123)
- **ZIP**: Any valid ZIP code

### Step 4: Beta Testing Checklist

#### Payment Testing
- [ ] Test successful card payments
- [ ] Test declined card scenarios
- [ ] Test different card types (Visa, Mastercard, Amex)
- [ ] Test payment confirmation flow
- [ ] Test order completion process

#### Restaurant Flow Testing
- [ ] Restaurant registration with test payments
- [ ] Menu setup and pricing
- [ ] Order processing workflow
- [ ] Payment settlement (test mode)

#### Multilingual Testing
- [ ] Test payment flow in Japanese (primary)
- [ ] Test payment flow in English
- [ ] Test payment flow in Chinese
- [ ] Test payment flow in Korean
- [ ] Verify payment confirmations in all languages

### Step 5: Production Readiness

**Only switch to production keys when:**
- [ ] All beta testing completed successfully
- [ ] Payment flows tested in all supported languages
- [ ] Restaurant onboarding process validated
- [ ] Error handling thoroughly tested
- [ ] Security review completed
- [ ] Legal compliance verified (Japan payment regulations)

### Step 6: Environment Switching

#### For Beta Testing
```bash
# Use beta environment
cp .env.beta .env
npm run dev
```

#### For Production (Later)
```bash
# Use production environment
cp .env.production .env
npm run build
npm run preview
```

## Security Recommendations

### Test Environment
- ✅ Use test Stripe keys
- ✅ Use separate beta database
- ✅ Enable debug logging
- ✅ Test with fake data

### Production Environment (Future)
- ✅ Use production Stripe keys
- ✅ Use production database
- ✅ Disable debug logging
- ✅ Enable monitoring
- ✅ Implement proper error handling

## Beta Testing Payment Scenarios

### Japanese Restaurant Owner Testing
1. **Registration**: Test restaurant signup with Japanese interface
2. **Menu Setup**: Add menu items with yen pricing
3. **Test Orders**: Process test orders from "tourists"
4. **Payment Processing**: Verify payment flow in Japanese

### Tourist Customer Testing
1. **English Customer**: Order and pay in English
2. **Chinese Customer**: Order and pay in Chinese
3. **Korean Customer**: Order and pay in Korean
4. **Mixed Language**: Japanese restaurant, foreign customer

### Error Scenario Testing
1. **Payment Failures**: Test declined cards
2. **Network Issues**: Test connection problems
3. **Language Switching**: Test mid-transaction language changes
4. **Order Cancellations**: Test refund processes (test mode)

## Monitoring During Beta

### Key Metrics to Track
- Payment success rates by language
- User drop-off points in payment flow
- Error rates and types
- Performance in different languages
- Restaurant adoption rates

### Stripe Dashboard Monitoring
- Go to Stripe Dashboard → Payments (Test Mode)
- Monitor test transactions
- Check for failed payments
- Review payment timing

## Support During Beta Testing

### For Restaurant Partners
- **Primary Support**: Japanese language support
- **Payment Issues**: Test mode troubleshooting
- **Training**: How to use test cards for validation

### For Development Team
- **Test Data**: Use Stripe test environment
- **Debugging**: Enable detailed logging
- **Monitoring**: Track beta testing metrics

---

**Remember**: Never use production payment keys during beta testing. Always use Stripe's test environment to ensure safe testing without real financial transactions.