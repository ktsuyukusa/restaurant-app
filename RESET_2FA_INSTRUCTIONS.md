# Reset 2FA Instructions

If you're having trouble with 2FA login, follow these steps to reset your 2FA setup:

## Steps to Reset 2FA:

1. **Open the Reset Tool**:
   - Open `reset-2fa-qr-code.html` in your browser

2. **Generate a New Secret**:
   - Click the "Generate Fresh 2FA Secret" button
   - A new secret and QR code will be generated

3. **Set Up Google Authenticator**:
   - Scan the QR code with Google Authenticator app on your phone
   - OR manually enter the secret displayed on the page

4. **Verify the Setup**:
   - Check that the current code on the page matches what's shown in your Google Authenticator app

5. **Update Database**:
   - Copy the SQL command provided on the page
   - Replace `[NEW_SECRET]` with the actual secret displayed on the page
   - Run the SQL command in your Supabase database

6. **Test Login**:
   - Try logging in with the new 2FA code from your Google Authenticator app

## Troubleshooting:

- If you're seeing errors about "2FA not set up", it means the secret in your database doesn't match what's in Google Authenticator
- If you're seeing "406 (Not Acceptable)" errors, it might be a database access issue
- Make sure to delete any old "Navikko" entries from Google Authenticator before setting up the new one

## Security Notes:

- Keep your 2FA secret secure - anyone with it can generate your 2FA codes
- After setup, delete the `reset-2fa-qr-code.html` file from your server
- The TOTP codes change every 30 seconds
- Make sure your device time is synchronized