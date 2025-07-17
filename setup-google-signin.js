#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Google Sign-In Setup Helper');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_GOOGLE_CLIENT_ID')) {
    console.log('✅ Google Client ID is configured');
    console.log('\n📝 Current configuration:');
    console.log(envContent);
  } else {
    console.log('❌ Google Client ID is not configured');
    console.log('\n📝 Add this line to your .env file:');
    console.log('VITE_GOOGLE_CLIENT_ID=your-google-client-id-here');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Create a .env file in your project root with:');
  console.log('VITE_GOOGLE_CLIENT_ID=your-google-client-id-here');
  
  // Create .env file with template
  const envTemplate = `# Google Sign-In Configuration
# Get your Google Client ID from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('\n✅ Created .env file with template');
    console.log('📝 Please replace "your-google-client-id-here" with your actual Google Client ID');
  } catch (error) {
    console.log('\n❌ Failed to create .env file:', error.message);
  }
}

console.log('\n🔗 Quick Setup Links:');
console.log('• Google Cloud Console: https://console.cloud.google.com/apis/credentials');
console.log('• Setup Guide: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid');
console.log('• Authorized Origins: Add http://localhost:8082 for development');

console.log('\n📋 Setup Steps:');
console.log('1. Go to Google Cloud Console');
console.log('2. Create a new project or select existing');
console.log('3. Enable Google Identity Services API');
console.log('4. Configure OAuth consent screen');
console.log('5. Create OAuth 2.0 Client ID (Web application)');
console.log('6. Add authorized origins: http://localhost:8082');
console.log('7. Copy the Client ID');
console.log('8. Update .env file with your Client ID');
console.log('9. Restart your development server');

console.log('\n🚀 After setup, restart your dev server with: npm run dev'); 