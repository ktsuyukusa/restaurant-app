-- Clear localStorage data that might be interfering with 2FA
-- Run this in your browser console:

localStorage.removeItem('admin_totp_secret');
localStorage.removeItem('navikko_user_data');
localStorage.removeItem('navikko_user_role');
localStorage.removeItem('navikko_user_session');
localStorage.removeItem('navikko_user_preferences');

console.log('localStorage cleared'); 