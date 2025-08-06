# Mobile App Setup Guide for Navikko

## Overview
Create a React Native mobile app using Expo to complement the existing web application.

## Step 1: Initialize Expo Project

```bash
# Create new Expo project
npx create-expo-app@latest navikko-mobile --template blank-typescript

# Navigate to project
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

## Step 2: Configure App Structure

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

## Step 3: Core Mobile Features

### Location Services
- Background location tracking
- Geofencing (200m, 100m, 50m alerts)
- Battery-optimized location updates
- Permission management

### Proximity Alerts
- Background notifications
- Quiet hours support
- Per-venue mute functionality
- Cooldown management

### Payment Integration
- Stripe Checkout redirect
- In-app browser for payments
- Payment status polling

## Step 4: Mobile-Specific Features

### Battery Optimization
- Adaptive location update intervals
- Background task management
- Power-saving modes

### Offline Support
- Cache restaurant data
- Offline menu viewing
- Sync when online

### Push Notifications
- Proximity alerts
- Order status updates
- Reservation confirmations

## Step 5: Testing & Deployment

### Development
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Production Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Environment Variables

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Location Services
EXPO_PUBLIC_DEFAULT_LATITUDE=36.2342
EXPO_PUBLIC_DEFAULT_LONGITUDE=138.4792

# App Configuration
EXPO_PUBLIC_APP_NAME=Navikko
EXPO_PUBLIC_API_BASE_URL=https://api.navikko.com
```

## Integration with Existing Web App

### Shared Components
- Reuse business logic from web app
- Share API endpoints
- Common database schema
- Unified payment processing

### Data Synchronization
- Real-time updates via Supabase
- Cross-platform user sessions
- Shared restaurant data
- Unified order management 