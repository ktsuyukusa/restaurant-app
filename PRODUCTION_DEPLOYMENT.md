# Production Deployment Guide

## Overview

This guide covers deploying the Navikko production website and application for the Japanese restaurant market with full 11-language support.

## Production Website

### Website Features
- **Primary Language**: Japanese (default)
- **Supported Languages**: 11 total
  - 🇯🇵 Japanese (ja) - Primary
  - 🇺🇸 English (en)
  - 🇨🇳 Chinese (zh)
  - 🇰🇷 Korean (ko)
  - 🇹🇭 Thai (th)
  - 🇻🇳 Vietnamese (vi)
  - 🇲🇾 Malay (ms)
  - 🇮🇩 Indonesian (id)
  - 🇵🇱 Polish (pl)
  - 🇪🇸 Spanish (es)
  - 🇷🇴 Romanian (ro)

### Website Structure
```
website/
├── index.html              # Main production website
├── production-website.html # Alternative version
└── assets/
    ├── logo/
    │   └── Navikko2.svg    # Brand logo
    └── images/             # Marketing images
```

### Deployment Options

#### Option 1: Static Hosting (Recommended)
**Platforms**: Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront

**Steps**:
1. Upload `website/` folder contents to hosting platform
2. Set `index.html` as the main entry point
3. Configure custom domain (e.g., `navikko.com`)
4. Enable HTTPS/SSL
5. Set up CDN for global performance

**Netlify Example**:
```bash
# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --dir=website --prod
```

#### Option 2: Traditional Web Server
**Platforms**: Apache, Nginx, IIS

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name navikko.com www.navikko.com;
    root /var/www/navikko;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript text/html;
}
```

### SEO Configuration

#### Meta Tags (Already Included)
- Language-specific titles
- Proper meta descriptions
- Favicon configuration
- Open Graph tags (recommended to add)

#### Recommended Additions
```html
<!-- Add to <head> section -->
<meta property="og:title" content="Navikko - 多言語レストランアプリ">
<meta property="og:description" content="日本のレストラン向け多言語対応アプリ">
<meta property="og:image" content="/logo/Navikko2.svg">
<meta property="og:url" content="https://navikko.com">
<meta name="twitter:card" content="summary_large_image">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Navikko",
  "description": "Multilingual restaurant app for Japanese restaurants",
  "applicationCategory": "RestaurantApp",
  "operatingSystem": "Web, iOS, Android"
}
</script>
```

## Application Deployment

### Environment Setup

#### Production Environment Variables
```bash
# Core Application
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key

# Language Configuration
VITE_DEFAULT_LANGUAGE=ja
VITE_SUPPORTED_LANGUAGES=ja,en,zh,ko,th,vi,ms,id,pl,es,ro

# API Configuration
VITE_API_BASE_URL=https://api.navikko.com
VITE_APP_URL=https://app.navikko.com
```

#### Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

#### Supabase Production Configuration
1. **Create Production Project**
   ```sql
   -- Run the database schema
   \i database-schema-update.sql
   ```

2. **Configure RLS Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   -- ... (continue for all tables)
   ```

3. **Set Up Authentication**
   - Configure OAuth providers (Google, Apple)
   - Set up email templates in Japanese
   - Configure redirect URLs

#### Environment-Specific Settings
```javascript
// src/config/production.ts
export const productionConfig = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },
  stripe: {
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  app: {
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en', 'zh', 'ko', 'th', 'vi', 'ms', 'id', 'pl', 'es', 'ro'],
    baseUrl: 'https://app.navikko.com',
  },
};
```

### Payment Integration

#### Stripe Production Setup
1. **Live Keys Configuration**
   ```bash
   # Set live Stripe keys
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...  # Server-side only
   ```

2. **Webhook Configuration**
   ```bash
   # Stripe webhook endpoint
   https://api.navikko.com/webhooks/stripe
   
   # Required events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   ```

3. **Japanese Payment Methods**
   - Enable JCB cards
   - Configure Konbini payments
   - Set up bank transfers (if needed)

### Monitoring & Analytics

#### Error Tracking
```javascript
// Sentry configuration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});
```

#### Analytics Setup
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Security Configuration

#### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
">
```

#### HTTPS Configuration
- Force HTTPS redirects
- Set up HSTS headers
- Configure secure cookies

### Performance Optimization

#### CDN Setup
- Configure CloudFlare or AWS CloudFront
- Enable image optimization
- Set up proper caching headers

#### Caching Strategy
```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML files
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## Launch Checklist

### Pre-Launch
- [ ] All 11 language versions tested
- [ ] Japanese as default language confirmed
- [ ] Stripe live keys configured
- [ ] Database production setup complete
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Analytics tracking active
- [ ] Error monitoring setup
- [ ] Performance testing completed

### Post-Launch
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Verify language switching
- [ ] Test mobile responsiveness
- [ ] Monitor page load speeds
- [ ] Check SEO indexing
- [ ] Verify email notifications

## Support & Maintenance

### Regular Tasks
- Monitor Supabase usage and billing
- Update Stripe webhook endpoints
- Review error logs weekly
- Update language translations as needed
- Monitor payment success rates

### Emergency Contacts
- Supabase Support: support@supabase.io
- Stripe Support: support@stripe.com
- Domain/Hosting Provider support

## Scaling Considerations

### Traffic Growth
- Monitor Supabase connection limits
- Consider read replicas for database
- Implement Redis caching if needed
- Set up load balancing for high traffic

### Feature Expansion
- Plan for additional languages
- Consider regional payment methods
- Prepare for mobile app deployment
- Plan API rate limiting

---

**Note**: This deployment guide assumes production readiness. Ensure all beta testing is complete before following these production deployment steps.