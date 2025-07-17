# Environment Variables Setup

Create a `.env` file in your project root with the following content:

```env
# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

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