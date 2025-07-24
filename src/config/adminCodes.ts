// Admin Access Codes Configuration
// This file should be updated with secure codes for each environment

export const ADMIN_CODES = {
  // Development/Testing Codes (for development only)
  development: {
    admin: 'ADMIN2024_DEV',
    superAdmin: 'SUPER_ADMIN_2024_DEV',
    moderator: 'MODERATOR_2024_DEV',
    support: 'SUPPORT_2024_DEV'
  },
  
  // Production Codes (CHANGE THESE FOR PRODUCTION!)
  production: {
    admin: import.meta.env.VITE_ADMIN_CODE_PROD || 'CHANGE_THIS_ADMIN_CODE',
    superAdmin: import.meta.env.VITE_SUPER_ADMIN_CODE_PROD || 'CHANGE_THIS_SUPER_ADMIN_CODE',
    moderator: import.meta.env.VITE_MODERATOR_CODE || 'CHANGE_THIS_MODERATOR_CODE',
    support: import.meta.env.VITE_SUPPORT_CODE || 'CHANGE_THIS_SUPPORT_CODE'
  }
};

// Get admin codes based on environment
export const getAdminCodes = () => {
  // For now, use development codes in all environments
  // TODO: Set up proper production environment variables
  return ADMIN_CODES.development;
};

// Validate admin code
export const validateAdminCode = (code: string): boolean => {
  const codes = getAdminCodes();
  return Object.values(codes).includes(code);
};

// Get admin level from code
export const getAdminLevel = (code: string): 'admin' | 'super_admin' | 'moderator' | 'support' | null => {
  const codes = getAdminCodes();
  
  if (code === codes.superAdmin) return 'super_admin';
  if (code === codes.admin) return 'admin';
  if (code === codes.moderator) return 'moderator';
  if (code === codes.support) return 'support';
  
  return null;
};

// Instructions for setting up admin codes:
/*
1. For Development:
   - Use the codes in ADMIN_CODES.development
   - These are safe to commit to version control

2. For Production:
   - Set environment variables in your deployment platform
   - NEVER commit production codes to version control
   - Use strong, unique codes (at least 16 characters)
   - Consider using a password generator

3. Environment Variables to Set:
   - VITE_ADMIN_CODE_PROD=your_secure_admin_code
   - VITE_SUPER_ADMIN_CODE_PROD=your_secure_super_admin_code
   - VITE_MODERATOR_CODE=your_secure_moderator_code
   - VITE_SUPPORT_CODE=your_secure_support_code

4. Code Distribution:
   - Share codes securely via encrypted channels
   - Use different codes for different environments
   - Rotate codes periodically
   - Keep a secure record of who has access to which codes
*/ 