# Environment Variables Setup

Create a `.env` file in your project root with the following content:

```env
# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=https://mzmvlahjtybrdboteyry.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZsYWhqdHlicmRib3RleXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTY2ODEsImV4cCI6MjA2ODAzMjY4MX0.95zziILtcMnzvCwKz4HoWeeFSfqlQSbe_afdTl97VVmA

# Payment Service Keys (Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51HEPeKHDciAfHF4XWMChPT07lSjGrbNhz2ZWhqKszcdG2BOwyZbRHRdYkMKg3OoAGAyIztd3yxY5BMHP7itw8FMd00BRBijcCL

# Google Maps API Key (if using Google Maps)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

VITE_APP_NAME=Navikko
VITE_LOGO_URL=https://www.canva.com/design/DAGtJGufdF0/mYh2U-2EoQPIvJK7Ntwf7A/view?utm_content=DAGtJGufdF0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3a9a6cf222

VITE_DEFAULT_LATITUDE=36.2342
VITE_DEFAULT_LONGITUDE=138.4792
VITE_MAP_BBOX_OFFSET=0.02

VITE_AZ_DINING_MAIN_IMAGE=https://www.instagram.com/p/DH8JUTQzprp/
VITE_AZ_DINING_INTERIOR_IMAGE=https://www.instagram.com/p/DGiOOQ8hzYt/?img_index=1
VITE_AZ_DINING_DISH_IMAGE=https://www.instagram.com/p/DL-VY2UBfgm/?img_index=1
VITE_AZ_DINING_ANOTHER_DISH=https://www.instagram.com/p/DG5OQyMBgKg/
```

## Steps to get your Supabase details:

### 1. Create a Supabase Project (if you don't have one):
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name (e.g., "restaurant-app")
5. Enter a secure database password
6. Choose a region close to your users
7. Click "Create new project"

### 2. Find your Supabase URL and API Keys:
1. Go to your project dashboard in Supabase
2. Click on the **Settings** icon (gear/cog) in the left sidebar
3. Click on **"API"** in the settings menu
4. You'll see two important sections:

#### **Project URL:**
- Look for **"Project URL"** - it looks like: `https://your-project-id.supabase.co`
- Copy this URL and use it for `VITE_SUPABASE_URL`

#### **API Keys:**
- **anon public** - This is your `VITE_SUPABASE_ANON_KEY`
- **service_role secret** - Keep this secret (don't use in frontend)

### 3. Set up your database:
1. In your Supabase dashboard, go to **"SQL Editor"**
2. Copy the contents of `supabase-setup.sql` from your project
3. Paste it into the SQL editor and run it
4. This will create all the necessary tables for your restaurant app

### 4. Configure Authentication (optional):
1. Go to **"Authentication"** → **"Settings"**
2. Configure your authentication providers (Google, etc.)
3. Set up email templates if needed

## Steps to get your Google Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable "Google Identity Services API"
4. Go to "OAuth consent screen" and configure it
5. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
6. Choose "Web application"
7. Add authorized origins:
   - `http://localhost:8082`
   - `https://restaurant-app-xi-ashy.vercel.app`
8. Copy the Client ID and replace `your-google-client-id-here`

## For Vercel Deployment:

Add these environment variables in your Vercel dashboard:
1. Go to your project in Vercel
2. Go to "Settings" > "Environment Variables"
3. Add each variable from your `.env` file 

Navikko 