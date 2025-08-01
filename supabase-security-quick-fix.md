# Quick Fix for Supabase Security Warnings

## 🚨 Two Security Issues to Fix:

### 1. **Leaked Password Protection Disabled**
**Issue**: Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. This is currently disabled.

**Fix**: Go to your Supabase Dashboard:
1. Navigate to **Authentication** (main page)
2. Try these sections to find the leaked password protection setting:
   - **"Password settings in email provider"** - Check here first
   - **"General user signup"** - May contain password policies
   - **"User sessions"** - Sometimes contains security settings
3. Look for settings like:
   - **"Leaked Password Protection"**
   - **"Password breach protection"**
   - **"HaveIBeenPwned integration"**
   - **"Compromised password detection"**
4. **Enable** the setting when found
5. Click **Save**

**Alternative**: If not found in dashboard, use SQL method below.

### 2. **Insufficient MFA Options**
**Issue**: Your project has too few multi-factor authentication (MFA) options configured.

**Fix**: Go to your Supabase Dashboard:
1. Navigate to **Authentication** (main page)
2. Click on **"Multifactor authentication"** from the settings list
3. Enable additional MFA methods:
   - ✅ **TOTP (Time-based One-Time Password)** - Enable this
   - ✅ **Phone/SMS** - Enable if you want SMS verification
   - ✅ **Email** - Should already be enabled
4. Set **Minimum MFA factors required**: `1` (recommended)
5. Click **Save**

## 🔧 SQL Method (Recommended if Dashboard Settings Not Found)

If you can't find the settings in the dashboard, run these in your Supabase SQL Editor:

```sql
-- Enable leaked password protection (HaveIBeenPwned integration)
INSERT INTO auth.config (parameter, value)
VALUES ('enable_leaked_password_protection', 'true')
ON CONFLICT (parameter)
DO UPDATE SET value = 'true';

-- Alternative approach - update auth settings
UPDATE auth.instances
SET raw_base_config = jsonb_set(
  COALESCE(raw_base_config, '{}'),
  '{GOTRUE_SECURITY_CAPTCHA_ENABLED}',
  'true'
);

-- Enable additional security features
INSERT INTO auth.config (parameter, value) VALUES
('password_min_length', '8'),
('password_require_letters', 'true'),
('password_require_numbers', 'true'),
('password_require_symbols', 'false'),
('password_require_uppercase', 'false'),
('password_require_lowercase', 'false')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;
```

**Note**: The exact SQL commands may vary depending on your Supabase version. If these don't work, the dashboard method is safer.

## ✅ Verification

After applying the fixes:
1. Go back to **Security Advisor**
2. Click **Refresh** 
3. Both warnings should disappear
4. You should see **0 warnings** in the dashboard

## 🛡️ Additional Security Recommendations

While fixing the warnings, consider also:
- Set **Session timeout** to 1 hour (3600 seconds)
- Enable **Refresh token rotation**
- Set **Password minimum length** to 12 characters
- Require **uppercase, lowercase, numbers, and symbols** in passwords

These settings are in **Authentication** → **Settings** → **Security Settings**.