const { authenticator } = require('otplib');

console.log('🔐 Generating 2FA Secret using OTPLib (Battle-Tested Library)');
console.log('='.repeat(60));

// Generate new secret using otplib
const secret = authenticator.generateSecret();
const qrUrl = authenticator.keyuri('admin@navikko.com', 'Navikko', secret);

console.log('📱 New TOTP Secret (OTPLib):');
console.log(secret);
console.log('');

console.log('🔗 QR Code URL:');
console.log(qrUrl);
console.log('');

console.log('💾 Database Update SQL:');
const sqlCommand = `UPDATE admin_access SET two_factor_secret = '${secret}', two_factor_enabled = true WHERE user_id = (SELECT id FROM users WHERE email = 'admin@navikko.com');`;
console.log(sqlCommand);
console.log('');

console.log('🕐 Current TOTP Code (OTPLib):');
const currentCode = authenticator.generate(secret);
const timeRemaining = authenticator.timeRemaining();
console.log(`Code: ${currentCode}`);
console.log(`Time Remaining: ${timeRemaining} seconds`);
console.log('');

console.log('🔍 Debug Information (OTPLib):');
console.log(`Library: otplib (battle-tested)`);
console.log(`Current Time: ${new Date().toISOString()}`);
console.log(`Unix Timestamp: ${Math.floor(Date.now() / 1000)}`);
console.log(`Secret: ${secret}`);
console.log('');

console.log('📋 Manual Setup Instructions:');
console.log('1. Remove old entry: Delete any existing "Navikko" entry from Google Authenticator');
console.log('2. Add new entry manually:');
console.log('   - Open Google Authenticator');
console.log('   - Tap the "+" button');
console.log('   - Select "Enter a setup key"');
console.log('   - Account name: admin@navikko.com');
console.log('   - Your key: Copy the secret above');
console.log('   - Type of key: Time based');
console.log('3. Verify setup: Check that the current code matches above');
console.log('4. Update database: Run the SQL command above');
console.log('5. Test login: Try logging in with the new code');
console.log('');

console.log('✅ OTPLib 2FA setup generated successfully!');
console.log('This uses the same battle-tested library as many production applications.');