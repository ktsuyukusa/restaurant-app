# Finding Supabase Authentication Settings

## 🔍 **You're Currently Looking At**: Database → Tables (RLS Policies)
The screenshot shows Row Level Security policies for your database tables, which is different from Authentication settings.

## 🎯 **Where to Find Authentication Settings**:

### Step 1: Navigate to Authentication
1. In your Supabase dashboard sidebar, look for **"Authentication"** (not "Database")
2. Click on **"Authentication"** - this should be a main menu item

### Step 2: Look for These Sections
Once in Authentication, you should see a list similar to what you showed earlier:
- ✅ **"General user signup"**
- ✅ **"Password settings in email provider"** ← **Check this one first**
- ✅ **"User sessions"**
- ✅ **"Refresh tokens"**
- ✅ **"Bot and abuse protection"** (you already checked - only has Captcha)
- ✅ **"SMTP settings"**
- ✅ **"Access token expiry"**
- ✅ **"Multifactor authentication"** ← **Check this one for MFA**
- ✅ **"Third party authentication"**
- ✅ **"Max request duration"**
- ✅ **"Max direct database connections"**

## 🎯 **What to Look For**:

### For Leaked Password Protection:
- **"Password settings in email provider"** - Most likely location
- Look for toggles like:
  - "Enable leaked password protection"
  - "Check against HaveIBeenPwned"
  - "Password breach detection"

### For MFA Options:
- **"Multifactor authentication"** section
- Enable additional factors beyond just email

## 🔧 **If Still Not Found**:
Use the SQL method from the previous guide - it's more reliable than hunting through the UI.

## 📍 **Current Location vs Target Location**:
- ❌ **You're currently at**: Database → Tables → RLS Policies
- ✅ **You need to go to**: Authentication → Settings sections

Navigate back to the main dashboard and look for "Authentication" in the sidebar.