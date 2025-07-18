# Environment Variables

This project uses environment variables to configure various settings. Create a `.env` file in the root directory with the following variables:

## Required Environment Variables

### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Optional Environment Variables

### Application Configuration
- `VITE_APP_NAME`: Application name (defaults to "Navikko")
- `VITE_LOGO_URL`: URL for the application logo

### Map Configuration
- `VITE_DEFAULT_LATITUDE`: Default latitude for maps (defaults to 36.248)
- `VITE_DEFAULT_LONGITUDE`: Default longitude for maps (defaults to 138.248)
- `VITE_MAP_BBOX_OFFSET`: Map bounding box offset (defaults to 0.01)

### External Photo URLs (AZ Dining)
- `VITE_AZ_DINING_EXTERIOR`: Exterior photo URL for AZ Dining
- `VITE_AZ_DINING_INTERIOR`: Interior photo URL for AZ Dining
- `VITE_AZ_DINING_CARBONARA`: Carbonara dish photo URL
- `VITE_AZ_DINING_TRUFFLE`: Truffle dish photo URL
- `VITE_AZ_DINING_CARD`: Card/thumbnail photo URL
- `VITE_AZ_DINING_MENU`: Menu photo URL

### Payment Integration
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for payment processing

### Security Configuration
- `VITE_ALLOWED_ADMIN_IPS`: Comma-separated list of IP addresses allowed for admin access (optional)
- `VITE_ENABLE_2FA`: Enable two-factor authentication for admin users (defaults to true)
- `VITE_MAX_LOGIN_ATTEMPTS`: Maximum login attempts before account lockout (defaults to 10)
- `VITE_LOCKOUT_DURATION`: Account lockout duration in minutes (defaults to 30)
- `VITE_SESSION_TIMEOUT`: Session timeout in hours (defaults to 24)

### Admin Access Codes (Production)
- `VITE_ADMIN_CODE_PROD`: Production admin access code
- `VITE_SUPER_ADMIN_CODE_PROD`: Production super admin access code
- `VITE_MODERATOR_CODE`: Production moderator access code
- `VITE_SUPPORT_CODE`: Production support access code

## Example .env file

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=Navikko
VITE_LOGO_URL=https://your-cdn.com/logo.png

# Map Configuration
VITE_DEFAULT_LATITUDE=36.248
VITE_DEFAULT_LONGITUDE=138.248
VITE_MAP_BBOX_OFFSET=0.01

# External Photo URLs (AZ Dining)
VITE_AZ_DINING_EXTERIOR=https://example.com/exterior.jpg
VITE_AZ_DINING_INTERIOR=https://example.com/interior.jpg
VITE_AZ_DINING_CARBONARA=https://example.com/carbonara.jpg
VITE_AZ_DINING_TRUFFLE=https://example.com/truffle.jpg
VITE_AZ_DINING_CARD=https://example.com/card.jpg
VITE_AZ_DINING_MENU=https://example.com/menu.jpg

# Payment Integration
VITE_KOMOJU_API_KEY=your-komoju-api-key-here
VITE_PAYJP_API_KEY=your-payjp-api-key-here

# Security Configuration
VITE_ALLOWED_ADMIN_IPS=192.168.1.100,10.0.0.50
VITE_ENABLE_2FA=true
VITE_MAX_LOGIN_ATTEMPTS=10
VITE_LOCKOUT_DURATION=30
VITE_SESSION_TIMEOUT=24

# Admin Access Codes (Production - CHANGE THESE!)
VITE_ADMIN_CODE_PROD=your_secure_admin_code_here
VITE_SUPER_ADMIN_CODE_PROD=your_secure_super_admin_code_here
VITE_MODERATOR_CODE=your_secure_moderator_code_here
VITE_SUPPORT_CODE=your_secure_support_code_here
```

## Security Notes

### Admin IP Restrictions
- Set `VITE_ALLOWED_ADMIN_IPS` to restrict admin access to specific IP addresses
- Format: comma-separated list (e.g., "192.168.1.100,10.0.0.50")
- Leave empty to allow admin access from any IP (not recommended for production)

### Two-Factor Authentication
- `VITE_ENABLE_2FA=true` enables 2FA for all admin users
- 2FA codes are sent via email (in production, implement SMS or authenticator app)
- Codes expire after 5 minutes

### Account Lockout
- `VITE_MAX_LOGIN_ATTEMPTS=10` sets the maximum failed login attempts
- `VITE_LOCKOUT_DURATION=30` sets lockout duration in minutes
- Lockout is enforced per email address

### Session Management
- `VITE_SESSION_TIMEOUT=24` sets session timeout in hours
- Sessions are automatically cleared after timeout
- Users must re-authenticate after session expiration

## Production Security Checklist

- [ ] Change all admin codes from default values
- [ ] Set up IP restrictions for admin access
- [ ] Enable two-factor authentication
- [ ] Configure proper session timeouts
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure Content Security Policy
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- The application will fall back to hardcoded defaults if environment variables are not provided
- The `.env` file is ignored by git for security reasons
- Create a `.env.example` file with your actual values for team reference 