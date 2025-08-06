# Navikko Production Release Strategy

## Overview
This document outlines the comprehensive strategy to finalize and release Navikko as a production-ready web and mobile application.

## Current State Assessment

### ✅ **Completed Features**
- **Web Application**: Fully functional React app with TypeScript
- **Backend**: Supabase database with proper schema and RLS policies
- **Payments**: Stripe integration with webhook handling
- **Authentication**: User/Admin roles with 2FA for admins
- **Multi-language**: 11-language support as specified
- **Restaurant Management**: Complete CRUD operations
- **Order System**: Menu browsing, cart, checkout, order tracking
- **Reservation System**: Basic booking functionality
- **Admin Dashboard**: Restaurant and user management
- **Security**: IP allowlist, 2FA, proper authentication

### ❌ **Missing Critical Features**
- **Mobile App**: React Native/Expo application
- **Geofencing**: Battery-safe proximity alerts
- **Background Location**: iOS/Android background services
- **Enhanced Reservations**: Timeslot generation, external booking
- **Advanced Payment**: QR code support, multiple providers

## Phase 1: Mobile App Development (4-6 weeks)

### Week 1-2: Setup & Core Structure
```bash
# Create Expo project
npx create-expo-app@latest navikko-mobile --template blank-typescript
cd navikko-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install expo-location expo-notifications expo-task-manager
npm install @supabase/supabase-js @stripe/stripe-react-native
npm install react-i18next i18next expo-localization
npm install @react-native-async-storage/async-storage
npm install react-native-maps
npm install expo-background-fetch expo-background-task
npm install expo-device expo-constants
```

### Week 3-4: Core Screens Implementation
- **MapListScreen**: Restaurant discovery with map integration
- **RestaurantDetailsScreen**: Restaurant info, photos, actions
- **MenuScreen**: Menu browsing with categories and items
- **CartCheckoutScreen**: Order review and Stripe checkout
- **ReservationsScreen**: Calendar view with timeslot selection
- **ActivityScreen**: Order and reservation history
- **SettingsScreen**: User preferences and location settings

### Week 5-6: Advanced Features
- **Geofencing**: Implement proximity alerts (200m, 100m, 50m)
- **Background Location**: Battery-optimized location tracking
- **Push Notifications**: Proximity alerts and order updates
- **Offline Support**: Cache restaurant data and menus

## Phase 2: Enhanced Web Features (2-3 weeks)

### Week 1: Geofencing Integration
- Integrate the `geofenceService.ts` into the web app
- Add location permission management
- Implement proximity alert notifications
- Add user preference controls (quiet hours, cooldown)

### Week 2: Enhanced Reservations
- Integrate the `reservationService.ts`
- Add timeslot generation based on restaurant hours
- Implement external booking provider integration
- Add reservation management for restaurant owners

### Week 3: Advanced Payment Features
- Add QR code payment support
- Implement multiple payment provider support
- Add payment method registration
- Enhance order status tracking

## Phase 3: Production Infrastructure (2 weeks)

### Week 1: Server Infrastructure
```bash
# Create server directory
mkdir server
cd server

# Initialize Node.js server
npm init -y
npm install express stripe cors helmet
npm install @types/node @types/express typescript

# Create server structure
server/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── payments.ts
│   │   ├── webhooks.ts
│   │   └── health.ts
│   ├── services/
│   │   ├── stripe.ts
│   │   └── geofencing.ts
│   └── middleware/
│       ├── auth.ts
│       └── validation.ts
├── package.json
└── tsconfig.json
```

### Week 2: Deployment & CI/CD
- **Vercel**: Deploy web app and server functions
- **EAS Build**: Configure mobile app builds
- **App Store**: Prepare iOS/Android submissions
- **Monitoring**: Set up error tracking and analytics

## Phase 4: Testing & Quality Assurance (2 weeks)

### Week 1: Comprehensive Testing
- **Unit Tests**: Core business logic
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user flows
- **Mobile Testing**: Real device testing on iOS/Android

### Week 2: Performance & Security
- **Performance**: Load testing and optimization
- **Security**: Penetration testing and vulnerability assessment
- **Accessibility**: WCAG compliance
- **Localization**: All 11 languages tested

## Phase 5: Production Launch (1 week)

### Pre-Launch Checklist
- [ ] All acceptance criteria met
- [ ] Mobile apps approved by App Store/Play Store
- [ ] Web app deployed and tested
- [ ] Payment processing verified
- [ ] Database backups configured
- [ ] Monitoring and alerting active
- [ ] Support system ready
- [ ] Documentation complete

### Launch Strategy
1. **Soft Launch**: Limited user group (beta testers)
2. **Gradual Rollout**: Increase user base over 2 weeks
3. **Full Launch**: Public release with marketing campaign

## Technical Implementation Details

### Mobile App Architecture
```
navikko-mobile/
├── app/
│   ├── screens/
│   │   ├── MapListScreen.tsx
│   │   ├── RestaurantDetailsScreen.tsx
│   │   ├── MenuScreen.tsx
│   │   ├── CartCheckoutScreen.tsx
│   │   ├── ReservationsScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── RestaurantCard.tsx
│   │   ├── MenuItem.tsx
│   │   ├── LocationPermission.tsx
│   │   └── ProximityAlert.tsx
│   ├── services/
│   │   ├── location.ts
│   │   ├── geofence.ts
│   │   ├── alerts.ts
│   │   ├── payments.ts
│   │   └── api.ts
│   ├── hooks/
│   │   ├── useLocation.ts
│   │   ├── useGeofencing.ts
│   │   └── useProximityAlerts.ts
│   └── navigation/
│       ├── AppNavigator.tsx
│       ├── ConsumerNavigator.tsx
│       └── OwnerNavigator.tsx
├── i18n/
│   ├── en.json
│   ├── ja.json
│   ├── zh.json
│   ├── ko.json
│   ├── th.json
│   ├── vi.json
│   ├── ms.json
│   ├── id.json
│   ├── pl.json
│   ├── es.json
│   └── ro.json
└── server/
    ├── index.ts
    ├── stripe.ts
    └── .env.example
```

### Database Schema Updates
```sql
-- Add geofencing support
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alerts_enabled BOOLEAN DEFAULT true,
  background_alerts_enabled BOOLEAN DEFAULT false,
  quiet_hours_start INTEGER DEFAULT 22,
  quiet_hours_end INTEGER DEFAULT 8,
  cooldown_minutes INTEGER DEFAULT 5,
  muted_venue_ids TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  battery_mode TEXT DEFAULT 'balanced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add restaurant hours
CREATE TABLE IF NOT EXISTS restaurant_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, day_of_week)
);

-- Add blocked timeslots
CREATE TABLE IF NOT EXISTS blocked_timeslots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, date, time)
);

-- Add external booking providers
CREATE TABLE IF NOT EXISTS external_booking_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT,
  supports_availability BOOLEAN DEFAULT false,
  supports_booking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Environment Configuration
```env
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
VITE_APP_NAME=Navikko
VITE_API_BASE_URL=https://api.navikko.com

# Mobile App Environment
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
EXPO_PUBLIC_APP_NAME=Navikko
EXPO_PUBLIC_API_BASE_URL=https://api.navikko.com

# Server Environment
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

## Acceptance Criteria Verification

### Discovery & Alerts
- [ ] 200m geofence triggers gentle notification
- [ ] 100m and 50m escalate appropriately
- [ ] Quiet hours and cooldowns respected
- [ ] iOS geofence limit (≤18) maintained

### Reservations
- [ ] Users can book with confirmation
- [ ] Owners can confirm/deny reservations
- [ ] Users can cancel within policy
- [ ] Optional deposits work via Stripe

### Ordering
- [ ] Menu browsing with modifiers
- [ ] Cart and checkout flow
- [ ] Stripe payment processing
- [ ] Order status updates
- [ ] Kitchen view for owners

### Stripe Integration
- [ ] End-to-end payment success
- [ ] Webhook updates order status
- [ ] Failed/cancelled flows handled
- [ ] Real keys tested

### Roles & Security
- [ ] Visitor/User/Owner/Admin permissions
- [ ] Admin IP allowlist enforced
- [ ] 2FA required for admin access
- [ ] No public admin signup

### Plans & Features
- [ ] Free plan gates reservations/ordering
- [ ] Pro plan enables features
- [ ] Business plan unlocks full limits
- [ ] Upgrade via external portal

### i18n Support
- [ ] All 11 languages render correctly
- [ ] Chinese fields only show when enabled
- [ ] Content supports multiple languages
- [ ] Admin reviews before publish

### Privacy & Battery
- [ ] No path history stored
- [ ] Local data deletion available
- [ ] Background permission handled gracefully
- [ ] Battery-optimized location updates

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 4-6 weeks | Mobile app with core features |
| Phase 2 | 2-3 weeks | Enhanced web features |
| Phase 3 | 2 weeks | Production infrastructure |
| Phase 4 | 2 weeks | Testing and QA |
| Phase 5 | 1 week | Production launch |

**Total Timeline: 11-14 weeks**

## Risk Mitigation

### Technical Risks
- **Mobile App Complexity**: Start with MVP, iterate
- **Geofencing Performance**: Implement battery optimization
- **Payment Integration**: Thorough testing with Stripe
- **Database Performance**: Monitor and optimize queries

### Business Risks
- **App Store Approval**: Follow guidelines strictly
- **User Adoption**: Beta testing and feedback
- **Payment Processing**: Compliance and security
- **Scalability**: Monitor and scale infrastructure

## Success Metrics

### Technical Metrics
- App crash rate < 1%
- API response time < 200ms
- Payment success rate > 99%
- Location accuracy within 10m

### Business Metrics
- User registration rate
- Restaurant onboarding rate
- Order completion rate
- User retention rate

## Conclusion

This comprehensive strategy ensures Navikko is released as a production-ready application meeting all specified requirements. The phased approach allows for iterative development while maintaining quality and meeting the acceptance criteria.

The mobile app will provide the location-first experience users expect, while the enhanced web app serves as a powerful management platform for restaurant owners and administrators. 