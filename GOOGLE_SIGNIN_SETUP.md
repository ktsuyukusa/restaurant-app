# Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for your multilingual dining app.

## Prerequisites

1. A Google Cloud Console account
2. A web application domain

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity Services API

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Navikko Dining App"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (your email addresses for testing)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:8082` (for your current dev server)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `http://localhost:8082` (for your current dev server)
   - Your production domain
6. Copy the Client ID

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Google Sign-In Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-google-client-id-here` with the Client ID you copied in Step 3.

## Step 5: Test Google Sign-In

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Click on "Sign Up" or "Login"
4. You should see Google Sign-In buttons
5. Test the authentication flow

## Features

The Google Sign-In implementation includes:

- **Automatic user creation**: New users are automatically created when they sign in with Google
- **User type selection**: Users can choose their role (customer, restaurant owner, admin) during signup
- **Profile information**: Automatically retrieves name, email, and profile picture from Google
- **Multilingual support**: Works with all supported languages (English, Japanese, Polish)
- **Error handling**: Proper error messages for failed authentication
- **Session management**: Integrates with the existing authentication system

## Security Notes

- The Google Client ID is safe to expose in the frontend (it's designed for this)
- User data is stored locally in localStorage for demo purposes
- In production, you should integrate with a backend service for secure user management
- Consider implementing additional security measures like CSRF protection

## Troubleshooting

### Common Issues

1. **"Google Sign-In is not available"**
   - Check that the Google Identity Services script is loading
   - Verify your Client ID is correct
   - Ensure your domain is in the authorized origins

2. **"Invalid origin" error**
   - Add your development URL to authorized JavaScript origins
   - Make sure the protocol (http/https) matches

3. **"Access blocked" error**
   - Add your email to test users in OAuth consent screen
   - Verify the app is not in restricted mode

### Debug Mode

To enable debug logging, open browser console and run:
```javascript
localStorage.setItem('debug', 'true');
```

Then refresh the page to see detailed authentication logs.

## Production Deployment

For production deployment:

1. Update authorized origins with your production domain
2. Set up proper environment variables
3. Consider implementing server-side user management
4. Add proper error monitoring and logging
5. Test the authentication flow thoroughly

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Google Cloud Console configuration
3. Test with different browsers and devices
4. Check the Google Identity Services documentation 