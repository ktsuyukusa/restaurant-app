import React, { ReactNode } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface SecureRouteProps {
  children: ReactNode;
  requiredRole: 'admin' | 'restaurant_owner' | 'customer';
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

const SecureRoute: React.FC<SecureRouteProps> = ({
  children,
  requiredRole,
  fallback,
  showAccessDenied = true
}) => {
  const { hasRole, isAuthenticated, canAccessAdminFeatures, canAccessRestaurantFeatures, logout } = useAppContext();
  const { t } = useLanguage();

  // Check if user has the required role
  const hasRequiredRole = hasRole(requiredRole);
  
  // Check additional security requirements
  const canAccess = (() => {
    if (!isAuthenticated) return false;
    
    switch (requiredRole) {
      case 'admin':
        return canAccessAdminFeatures;
      case 'restaurant_owner':
        return canAccessRestaurantFeatures;
      case 'customer':
        return hasRequiredRole;
      default:
        return false;
    }
  })();

  if (!isAuthenticated) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <CardTitle>{t('auth.loginRequired')}</CardTitle>
          <CardDescription>
            {t('auth.pleaseLoginToAccess')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = '/'}>
            {t('auth.goToLogin')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasRequiredRole) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-orange-400 mb-4" />
          <CardTitle>{t('auth.insufficientPermissions')}</CardTitle>
          <CardDescription>
            {t('auth.roleRequired', { role: t(`role.${requiredRole}`) })}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = '/'}>
            {t('auth.backToHome')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!canAccess) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <CardTitle>{t('auth.accessDenied')}</CardTitle>
          <CardDescription>
            {requiredRole === 'admin' && t('auth.adminAccessRestricted')}
            {requiredRole === 'restaurant_owner' && t('auth.subscriptionRequired')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {requiredRole === 'admin' && t('auth.adminSecurityMessage')}
            {requiredRole === 'restaurant_owner' && t('auth.subscriptionExpiredMessage')}
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              {t('auth.backToHome')}
            </Button>
            <Button variant="destructive" onClick={logout}>
              {t('auth.logout')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default SecureRoute; 