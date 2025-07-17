@echo off
echo 🔧 Google Sign-In Setup Helper
echo ================================
echo.

if exist .env (
    echo ✅ .env file already exists
    echo.
    echo 📝 Current configuration:
    type .env
    echo.
) else (
    echo ❌ .env file not found
    echo.
    echo 📝 Creating .env file with template...
    echo # Google Sign-In Configuration > .env
    echo # Get your Google Client ID from: https://console.cloud.google.com/apis/credentials >> .env
    echo VITE_GOOGLE_CLIENT_ID=your-google-client-id-here >> .env
    echo. >> .env
    echo # Supabase Configuration (if using Supabase) >> .env
    echo VITE_SUPABASE_URL=https://your-project.supabase.co >> .env
    echo VITE_SUPABASE_ANON_KEY=your-anon-key-here >> .env
    echo ✅ Created .env file with template
    echo.
)

echo 🔗 Quick Setup Links:
echo • Google Cloud Console: https://console.cloud.google.com/apis/credentials
echo • Setup Guide: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
echo • Authorized Origins: Add http://localhost:8082 for development
echo.
echo 📋 Setup Steps:
echo 1. Go to Google Cloud Console
echo 2. Create a new project or select existing
echo 3. Enable Google Identity Services API
echo 4. Configure OAuth consent screen
echo 5. Create OAuth 2.0 Client ID (Web application)
echo 6. Add authorized origins: http://localhost:8082
echo 7. Copy the Client ID
echo 8. Update .env file with your Client ID
echo 9. Restart your development server
echo.
echo 🚀 After setup, restart your dev server with: npm run dev
echo.
pause 