# Admin Codes Setup Guide

## Overview

The Navikko app uses admin codes to control access to administrative functions. These codes are required when registering as an admin user and provide different levels of system access.

## Current Admin Code System

### Development Codes (Safe to commit)
- **Admin**: `ADMIN2024_DEV`
- **Super Admin**: `SUPER_ADMIN_2024_DEV`
- **Moderator**: `MODERATOR_2024_DEV`
- **Support**: `SUPPORT_2024_DEV`

### Production Codes (MUST BE CHANGED!)
The production codes are currently set to placeholder values and **MUST** be changed before deployment.

## How to Provide Admin Codes

### 1. Environment Variables (Recommended)

Set these environment variables in your deployment platform:

```bash
# Production Admin Codes (CHANGE THESE!)
VITE_ADMIN_CODE_PROD=your_secure_admin_code_here
VITE_SUPER_ADMIN_CODE_PROD=your_secure_super_admin_code_here
VITE_MODERATOR_CODE=your_secure_moderator_code_here
VITE_SUPPORT_CODE=your_secure_support_code_here
```

### 2. Code Generation

Generate secure admin codes using these guidelines:

- **Length**: At least 16 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
- **Uniqueness**: Each code should be unique
- **No patterns**: Avoid predictable patterns

Example secure codes:
```
ADMIN_2024_SECURE_XYZ789
SUPER_ADMIN_2024_ABC123_DEF456
MODERATOR_2024_GHI789_JKL012
SUPPORT_2024_MNO345_PQR678
```

### 3. Code Distribution

#### Secure Distribution Methods:
- **Encrypted email** with password protection
- **Secure messaging apps** (Signal, WhatsApp Business)
- **Password managers** with sharing features
- **Physical delivery** for high-security environments
- **Two-factor authentication** for code access

#### Distribution Checklist:
- [ ] Generate unique codes for each environment
- [ ] Share codes via secure channels only
- [ ] Document who receives which codes
- [ ] Set expiration dates for codes
- [ ] Plan for code rotation

### 4. Access Levels

Different admin codes provide different access levels:

| Code Type | Access Level | Permissions |
|-----------|-------------|-------------|
| Admin | `admin` | User management, restaurant management, system settings, analytics |
| Super Admin | `super_admin` | All admin permissions + additional system access |
| Moderator | `moderator` | Limited user management, content moderation |
| Support | `support` | Customer support tools, limited system access |

## Security Best Practices

### 1. Code Management
- **Never commit production codes** to version control
- **Use environment variables** for production codes
- **Rotate codes regularly** (every 3-6 months)
- **Limit code distribution** to authorized personnel only

### 2. Access Control
- **Log all admin registrations** with timestamps
- **Monitor admin account activity**
- **Implement rate limiting** for admin code attempts
- **Set up alerts** for multiple failed attempts

### 3. Code Storage
- **Encrypt codes** in transit and at rest
- **Use secure key management** services
- **Backup codes securely** with encryption
- **Limit code access** to essential personnel

## Implementation Steps

### For Development:
1. Use the development codes in `src/config/adminCodes.ts`
2. These codes are safe to commit to version control
3. Test admin functionality with these codes

### For Production:
1. Generate secure admin codes
2. Set environment variables in your deployment platform
3. Update the production codes in `src/config/adminCodes.ts`
4. Test admin registration with new codes
5. Document code distribution to authorized personnel

### For Staging/Testing:
1. Use different codes than production
2. Set up separate environment variables
3. Test admin functionality thoroughly
4. Ensure codes are not shared with production

## Troubleshooting

### Common Issues:
- **"Invalid admin code" error**: Check if the code matches exactly (case-sensitive)
- **Environment variables not loading**: Ensure VITE_ prefix is used
- **Codes not working in production**: Verify environment variables are set correctly

### Support:
If you need help with admin code setup, contact the system administrator or refer to the deployment documentation.

## Emergency Procedures

### Code Compromise:
1. Immediately invalidate compromised codes
2. Generate new secure codes
3. Distribute new codes via secure channels
4. Monitor for unauthorized admin registrations
5. Review access logs for suspicious activity

### Lost Codes:
1. Contact system administrator
2. Verify identity through secure channels
3. Generate new codes if necessary
4. Update environment variables
5. Distribute new codes securely 