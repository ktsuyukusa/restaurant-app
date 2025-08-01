# Navikko.com Deployment Guide

## Overview

This guide covers deploying the Navikko website to navikko.com using Vercel, with integrated promotional code system.

## Architecture

- **Main App**: `restaurant-app-xi-ashy.vercel.app` (React app)
- **Website**: `navikko.com` (Static website with beta access)
- **Beta System**: Promotional code-based access control
- **Platform**: Vercel (unified deployment)

## Pre-Deployment Setup

### 1. Domain Configuration

1. **Domain navikko.com** ✅ Already configured
2. **DNS Configuration** ✅ Already set up correctly:
   ```
   A Record: @ → 216.198.79.1 (Automatic)
   CNAME: www → 2554f00ea03d9e40.vercel-dns-017.com (Automatic)
   ```
   **Note**: Keep your existing DNS settings - they are correct for Vercel!

### 2. Vercel Project Setup

1. **Create new Vercel project** for the website:
   ```bash
   # In your project root
   vercel --prod
   ```

2. **Configure custom domain**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings > Domains
   - Add `navikko.com` and `www.navikko.com`

## Deployment Steps

### Step 1: Prepare Website Files

Ensure your website structure is ready:
```
website/
├── index.html                 # Main multilingual website
├── production-website.html    # Full production version
└── assets/                   # Static assets
```

### Step 2: Configure Vercel

The `vercel.json` file is already configured with:
- Static file serving from `website/` directory
- Redirects to main app
- Security headers
- Caching policies

### Step 3: Deploy via GitHub (Recommended)

Since your Vercel deployment is connected to GitHub:

1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Add website with promotional code system"
   git push origin main
   ```

2. **Vercel will automatically deploy** from GitHub
3. **Monitor deployment** in Vercel Dashboard
4. **Verify deployment**:
   ```bash
   curl -I https://navikko.com
   ```

**Note**: This ensures consistent deployments and maintains your GitHub workflow.

## Beta Testing System

### Promotional Codes

The system includes pre-configured promotional codes:

#### Restaurant Beta Codes
- `RESTAURANT2025` - Restaurant Beta Access (expires 2025-12-31)
- `BETA-REST-001` - Early Restaurant Access (expires 2025-08-31)

#### General Access
- `NAVIKKO-BETA` - General Beta Access (expires 2025-12-31)
- `LAUNCH-WEEK` - Launch Week Special (expires 2025-03-31)
- `EARLY-BIRD` - Early Bird Access (expires 2025-08-31)

#### Partner Codes
- `PARTNER-001` - Partner Access (expires 2025-12-31)
- `TOURISM-JP` - Japan Tourism Partner (expires 2025-12-31)

#### Developer/Testing
- `DEV-TEST-001` - Developer Testing (expires 2025-12-31)
- `QA-BETA-001` - QA Testing Access (expires 2025-12-31)

#### Demo Codes
- `DEMO-2025` - Demo Access (expires 2025-12-31)
- `SHOWCASE` - Showcase Demo (expires 2025-12-31)

### Promotional Code Integration

Promotional codes are now integrated directly into the main application:

1. **Registration Flow**: Optional promo code field during signup
2. **Subscription Purchase**: Discount codes during payment
3. **Admin Panel**: Manual code validation for special access

See `PROMOTIONAL_CODES.md` for available codes and implementation details.

## URL Structure

- `navikko.com` → Main website (Japanese/English)
- `navikko.com/app` → Redirect to main React app
- `navikko.com/demo` → Redirect to demo environment
- `navikko.com/dev` → Redirect to development environment

## Environment Configuration

### Production Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Main app URL (update when custom domain is ready)
NEXT_PUBLIC_APP_URL=https://restaurant-app-xi-ashy.vercel.app

# Beta access settings
NEXT_PUBLIC_BETA_ENABLED=true
NEXT_PUBLIC_BETA_CODES_ENABLED=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Security Features

### Headers Configuration

The deployment includes security headers:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy for safe script execution

### Caching Strategy

- **Static assets**: 1 year cache with immutable flag
- **HTML files**: No cache, must revalidate
- **API responses**: Appropriate cache headers

## Monitoring and Analytics

### Access Logging

The promotional code system logs access attempts:
- Valid/invalid code attempts
- User agent and referrer information
- Timestamp and code type
- Stored in database for analytics

### Production Monitoring

Consider adding:
- Google Analytics for website traffic
- Vercel Analytics for performance monitoring
- Error tracking (Sentry, LogRocket, etc.)

## Maintenance

### Regular Tasks

1. **Monitor promotional code usage**
2. **Update expired codes** quarterly
3. **Review access logs** for suspicious activity
4. **Update website content** as needed
5. **Monitor domain and SSL certificate** renewal

### Code Updates

To update promotional codes:
1. Edit `PROMOTIONAL_CODES.md` for reference
2. Update the promotional code validation in the subscription service
3. Commit and push to GitHub:
   ```bash
   git add PROMOTIONAL_CODES.md src/services/subscriptionService.ts
   git commit -m "Update promotional codes"
   git push origin main
   ```
4. Vercel will auto-deploy from GitHub

### Content Updates

To update website content:
1. Edit `website/index.html` or `website/production-website.html`
2. Test locally: `npx serve website`
3. Commit and push to GitHub:
   ```bash
   git add website/
   git commit -m "Update website content"
   git push origin main
   ```
4. Vercel will auto-deploy from GitHub

## Troubleshooting

### Common Issues

1. **Domain not resolving**
   - Check DNS configuration
   - Verify Vercel domain settings
   - Wait for DNS propagation (up to 48 hours)

2. **Beta codes not working**
   - Check code spelling and case sensitivity
   - Verify expiry dates
   - Clear localStorage if needed

3. **Redirects not working**
   - Check `vercel.json` routing configuration
   - Verify target URLs are accessible

### Support Contacts

- **Domain Issues**: Domain registrar support
- **Vercel Issues**: Vercel support or documentation
- **App Issues**: Main app repository issues

## Next Steps

1. **Custom Domain Setup**: Configure navikko.com in Vercel
2. **SSL Certificate**: Automatic via Vercel
3. **Analytics Setup**: Google Analytics integration
4. **SEO Optimization**: Meta tags, sitemap, robots.txt
5. **Performance Monitoring**: Core Web Vitals tracking

## Beta Testing Strategy

### Phase 1: Limited Beta (Current)
- Use promotional codes for controlled access
- Target: Restaurant owners and partners
- Duration: 3-6 months

### Phase 2: Open Beta
- Remove promotional code requirement
- Public access with registration
- Duration: 2-3 months

### Phase 3: Production Launch
- Full public access
- Remove beta branding
- Launch marketing campaigns

---

**Last Updated**: January 2025
**Version**: 1.0
**Contact**: beta@navikko.com