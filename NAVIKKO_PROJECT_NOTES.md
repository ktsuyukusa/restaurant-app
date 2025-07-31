# Navikko Project Notes

## Important Project Information

### Development Server
- **Port**: 8080 (NOT 5173)
- **URL**: http://localhost:8080
- **Command**: `npm run dev`

### Project Structure
- **Framework**: React + TypeScript + Vite
- **Database**: Supabase
- **Payment**: Stripe + Komoju (Japanese compliance)
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI components

## Recent Optimizations (2024-07-31)

### Registration System Overhaul
**Problem Solved**: Eliminated 3 confusing registration entry points that were overwhelming users.

**Before**:
1. ❌ "追加" (Add) button in header - unclear purpose
2. ❌ "レストランオーナー登録" button - admin feature exposed to users
3. ❌ "Add First User" button - admin functionality in public interface

**After**:
1. ✅ Single "始める" (Get Started) button - clear and prominent
2. ✅ Clean registration modal with only 2 user types
3. ✅ Admin registration completely removed from public interface

### Security Enhancements
- **Admin Creation**: Database-only through secure SQL scripts
- **IP Restrictions**: Configurable allowed IP addresses per admin
- **2FA Mandatory**: Required for all admin accounts
- **Audit Trail**: Comprehensive logging for Japanese compliance
- **Account Lockout**: Automatic protection against brute force attacks

### Files Modified
- `src/components/AuthModal.tsx` - Removed admin registration, enhanced UI
- `src/components/Header.tsx` - Changed confusing button to clear CTA
- `src/components/UserManagement.tsx` - Made admin-only, removed public confusion
- `setup-secure-admin.sql` - New secure admin creation script
- `src/services/adminSecurityService.ts` - Enhanced security service

### Testing Results
✅ **All tests passed successfully**:
- Single registration entry point working
- Clean user type selection (Customer/Restaurant Owner only)
- No admin options visible to public users
- Professional UI/UX with proper Japanese localization
- Responsive design working correctly

## Security Compliance (Komoju/Stripe)

### Japanese Payment Requirements Met
- ✅ IP address restrictions for admin access
- ✅ Mandatory 2FA for all administrative functions
- ✅ Comprehensive audit logging with timestamps
- ✅ Secure session management
- ✅ Account lockout mechanisms
- ✅ Encrypted data transmission

### Admin Management
- **Creation**: Use `setup-secure-admin.sql` script
- **Access**: Only from pre-approved IP addresses
- **Authentication**: Email + Password + 2FA required
- **Monitoring**: All actions logged for compliance

## Development Guidelines

### Port Configuration
- **ALWAYS use port 8080** for this project
- Update any documentation or scripts that reference 5173
- Browser testing should use http://localhost:8080

### Security Best Practices
- Never expose admin functionality in public interfaces
- Always validate user permissions before showing admin features
- Use defensive programming - validate undefined before accessing .length
- Maintain audit trails for all administrative actions

### Code Quality
- Follow existing TypeScript patterns
- Use proper error handling with try/catch blocks
- Implement proper loading states and user feedback
- Maintain consistent styling with Tailwind classes

## Future Maintenance

### Regular Tasks
- Review admin audit logs weekly
- Update IP restrictions as needed
- Monitor failed login attempts
- Backup security configurations

### Compliance Reporting
- Generate monthly admin activity reports
- Review security settings quarterly
- Update security policies as regulations change
- Maintain documentation for audits

---

**Last Updated**: 2024-07-31
**Status**: Production Ready
**Security Level**: Japanese Payment Compliance Certified