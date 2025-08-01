# Navikko Promotional Codes

## Overview
Promotional codes for Navikko access and subscription discounts. These codes should be integrated directly into the payment/subscription system rather than as a separate beta gating mechanism.

## Restaurant Access Codes
- `RESTAURANT2025` - Restaurant Beta Access (expires 2025-12-31)
- `BETA-REST-001` - Early Restaurant Access (expires 2025-08-31)

## General Access Codes
- `NAVIKKO-BETA` - General Beta Access (expires 2025-12-31)
- `LAUNCH-WEEK` - Launch Week Special (expires 2025-03-31)
- `EARLY-BIRD` - Early Bird Access (expires 2025-08-31)

## Partner Codes
- `PARTNER-001` - Partner Access (expires 2025-12-31)
- `TOURISM-JP` - Japan Tourism Partner (expires 2025-12-31)

## Developer/Testing Codes
- `DEV-TEST-001` - Developer Testing (expires 2025-12-31)
- `QA-BETA-001` - QA Testing Access (expires 2025-12-31)

## Demo Codes
- `DEMO-2025` - Demo Access (expires 2025-12-31)
- `SHOWCASE` - Showcase Demo (expires 2025-12-31)

## Implementation Notes

### Where to Use These Codes:
1. **Subscription Purchase Flow** - Apply discounts during payment
2. **Registration Process** - Optional promo code field for special access
3. **Admin Panel** - Manual code validation for special cases

### Code Types and Benefits:
- **Restaurant codes**: Free trial period or discount on restaurant plans
- **Partner codes**: Special pricing or extended trials
- **Demo codes**: Temporary access for presentations
- **Developer codes**: Full access for testing purposes

### Integration Points:
- `src/components/SubscriptionPurchase.tsx` - Add promo code input
- `src/services/subscriptionService.ts` - Validate and apply codes
- `src/components/AuthModal.tsx` - Optional promo code field during signup

### Security Considerations:
- Validate codes server-side
- Track usage to prevent abuse
- Set expiration dates
- Log all code usage for analytics

## Migration from Beta System

### Remove:
- `beta-promo-system.html` - Separate beta gating page
- Any routing to `/beta` endpoint
- localStorage manipulation from beta system

### Keep:
- The promotional codes themselves
- Code validation logic (move to subscription service)
- Usage tracking and analytics

### Integrate Into:
- Main authentication flow
- Subscription purchase process
- Admin management system