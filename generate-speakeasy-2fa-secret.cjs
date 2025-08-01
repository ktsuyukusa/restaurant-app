const speakeasy = require('speakeasy');

console.log('🔐 Generating 2FA Secret using Speakeasy (Battle-Tested Backend Library)');
console.log('='.repeat(70));

// Generate new secret using speakeasy - the proper backend way
const secret = speakeasy.generateSecret({
  name: 'admin@navikko.com',
  issuer: 'Navikko'
});

console.log('📱 New TOTP Secret (Speakeasy Backend):');
console.log(secret.base32);
console.log('');

console.log('🔗 QR Code URL:');
console.log(secret.otpauth_url);
console.log('');

console.log('💾 Database Update SQL:');
const sqlCommand = `UPDATE admin_access SET two_factor_secret = '${secret.base32}', two_factor_enabled = true WHERE user_id = (SELECT id FROM users WHERE email = 'admin@navikko.com');`;
console.log(sqlCommand);
console.log('');

console.log('🕐 Current TOTP Code (Speakeasy Backend):');
const currentCode = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32',
  digits: 6,
  step: 30,
  algorithm: 'sha1'
});

// Calculate remaining time
const now = Math.floor(Date.now() / 1000);
const timeStep = Math.floor(now / 30);
const nextStep = (timeStep + 1) * 30;
const remainingTime = nextStep - now;

console.log(`Code: ${currentCode}`);
console.log(`Time Remaining: ${remainingTime} seconds`);
console.log('');

console.log('🔍 Debug Information (Speakeasy Backend):');
console.log(`Library: speakeasy (battle-tested backend)`);
console.log(`Current Time: ${new Date().toISOString()}`);
console.log(`Unix Timestamp: ${Math.floor(Date.now() / 1000)}`);
console.log(`Secret: ${secret.base32}`);
console.log(`ASCII Secret: ${secret.ascii}`);
console.log(`Hex Secret: ${secret.hex}`);
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

console.log('✅ Speakeasy 2FA setup generated successfully!');
console.log('This uses the industry-standard backend library for proper server-side TOTP.');
console.log('Speakeasy runs in the backend and only displays results on the frontend.');