import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  Store, 
  Crown, 
  Mail, 
  Lock, 
  Phone, 
  Building,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import authService, { LoginData as AuthLoginData } from '@/services/authService';
import { SignupData } from '@/utils/types';
import { validateAdminCode } from '@/config/adminCodes';
import GoogleSignIn from './GoogleSignIn';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import TwoFactorAuthModal from './TwoFactorAuthModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignupFormData extends SignupData {
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { login, signup, updateUserAfter2FA } = useAppContext();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<AuthLoginData | null>(null);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [adminUnlockClicks, setAdminUnlockClicks] = useState(0);

  // Login form state
  const [loginData, setLoginData] = useState<AuthLoginData>({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    userType: 'customer',
    locationConsent: false,
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    adminCode: ''
  });

  const userTypes = [
    {
      id: 'customer',
      name: 'Customer',
      description: 'Browse restaurants and place orders',
      icon: User,
      color: 'bg-blue-100 text-blue-800',
      features: ['Browse restaurants', 'Place orders', 'View order history', 'Save favorites']
    },
    {
      id: 'restaurant_owner',
      name: 'Restaurant Owner',
      description: 'Manage your restaurant and orders',
      icon: Store,
      color: 'bg-green-100 text-green-800',
      features: ['Dashboard', 'Order management', 'Menu management', 'Analytics']
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full system access and management',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800',
      features: ['All restaurant features', 'User management', 'System settings', 'Analytics']
    }
  ];

  const cuisines = [
    'Japanese', 'Italian', 'Chinese', 'Korean', 'French', 'Thai', 
    'Indian', 'American', 'Mexican', 'Mediterranean', 'Fusion', 'Other'
  ];

  const updateLoginField = (field: keyof AuthLoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateSignupField = (field: keyof SignupData, value: string | boolean) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.login(loginData);
      login(loginData.email, loginData.password);
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      if (errorMessage === '2FA_REQUIRED') {
        console.log('🔍 AuthModal: 2FA_REQUIRED detected, showing 2FA modal');
        setPendingLoginData(loginData);
        setShowTwoFactorAuth(true);
        setIsLoading(false); // Stop loading when showing 2FA modal
        return; // Don't set error, just show 2FA modal
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (code: string): Promise<boolean> => {
    console.log('🔍 AuthModal: 2FA verification called with code:', code);
    if (!pendingLoginData) {
      console.log('🔍 AuthModal: No pending login data found');
      return false;
    }

    try {
      console.log('🔍 AuthModal: Calling authService.login with 2FA code');
      const user = await authService.login(pendingLoginData, code);
      
      console.log('🔍 AuthModal: Login successful, user authenticated:', user);
      
      // Update app state with the authenticated user
      updateUserAfter2FA(user);
      
      console.log('🔍 AuthModal: Closing 2FA modal and auth modal');
      setShowTwoFactorAuth(false);
      setPendingLoginData(null);
      onClose();
      
      return true;
    } catch (error) {
      console.log('🔍 AuthModal: 2FA verification failed:', error);
      return false;
    }
  };

  const handleResetPassword = async () => {
    if (!loginData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await authService.resetPassword(loginData.email);
      if (error) {
        setError(`Failed to send reset email: ${error.message}`);
      } else {
        setError(null);
        alert('Password reset email sent! Please check your inbox.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to send reset email: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check if user agreed to terms
    if (!agreeToTerms) {
      setError(t('auth.terms_required'));
      return;
    }
    
    setIsLoading(true);

    // Basic validation
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Restaurant owner validation
    if (signupData.userType === 'restaurant_owner') {
      if (!signupData.restaurantName || !signupData.restaurantAddress || !signupData.restaurantPhone) {
        setError('Please fill in all restaurant information');
        setIsLoading(false);
        return;
      }
    }

    // Admin validation
    if (signupData.userType === 'admin') {
      if (!signupData.adminCode || !validateAdminCode(signupData.adminCode)) {
        setError('Invalid admin code');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Transform the signup data to match authService expectations
      const transformedSignupData = {
        ...signupData,
        restaurantInfo: signupData.userType === 'restaurant_owner' ? {
          name: signupData.restaurantName,
          address: signupData.restaurantAddress,
          phone: signupData.restaurantPhone,
          cuisine: 'Other' // Default cuisine type
        } : undefined
      };

      console.log('🔍 AuthModal: Signup data being sent:', transformedSignupData);
      console.log('🔍 AuthModal: Restaurant info:', transformedSignupData.restaurantInfo);

      const user = await authService.signup(transformedSignupData);
      signup(signupData);
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      console.error('🔍 AuthModal: Signup error:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setSignupData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      userType: 'customer',
      locationConsent: false,
      restaurantName: '',
      restaurantAddress: '',
      restaurantPhone: '',
      adminCode: ''
    });
    setError(null);
    setAgreeToTerms(false);
    setShowAdminOption(false);
    setAdminUnlockClicks(0);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {t('auth.welcome', 'Welcome to Navikko')}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login', 'Login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup', 'Sign Up')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t('auth.login_title', 'Login to Your Account')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">{t('auth.email', 'Email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.enter_email', 'Enter your email')}
                        value={loginData.email}
                        onChange={(e) => updateLoginField('email', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">{t('auth.password', 'Password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.enter_password', 'Enter your password')}
                          value={loginData.password}
                          onChange={(e) => updateLoginField('password', e.target.value)}
                          className="pl-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="text-right mt-1">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                          onClick={handleResetPassword}
                        >
                          {t('auth.forgot_password', 'Forgot password?')}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.logging_in', 'Logging in...') : t('auth.login', 'Login')}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {t('auth.or_login_with', 'Or login with')}
                      </p>
                      <GoogleSignIn onSuccess={onClose} userType="customer" />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('auth.create_account', 'Create Your Account')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label
                        onClick={() => {
                          setAdminUnlockClicks(prev => prev + 1);
                          if (adminUnlockClicks >= 4) {
                            setShowAdminOption(true);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {t('auth.account_type', 'Account Type')}
                      </Label>
                      <div className={`grid gap-3 mt-2 ${showAdminOption ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                        <Button
                          type="button"
                          variant={signupData.userType === 'customer' ? 'default' : 'outline'}
                          onClick={() => updateSignupField('userType', 'customer')}
                          className="flex flex-col items-center gap-2 h-auto p-4"
                        >
                          <User className="h-5 w-5" />
                          <span className="text-sm">{t('auth.customer', 'Customer')}</span>
                        </Button>
                        <Button
                          type="button"
                          variant={signupData.userType === 'restaurant_owner' ? 'default' : 'outline'}
                          onClick={() => updateSignupField('userType', 'restaurant_owner')}
                          className="flex flex-col items-center gap-2 h-auto p-4"
                        >
                          <Store className="h-5 w-5" />
                          <span className="text-sm">{t('auth.restaurant_owner', 'Restaurant Owner')}</span>
                        </Button>
                        {showAdminOption && (
                          <Button
                            type="button"
                            variant={signupData.userType === 'admin' ? 'default' : 'outline'}
                            onClick={() => updateSignupField('userType', 'admin')}
                            className="flex flex-col items-center gap-2 h-auto p-4"
                          >
                            <Crown className="h-5 w-5" />
                            <span className="text-sm">{t('auth.admin', 'Admin')}</span>
                          </Button>
                        )}
                      </div>
                      {showAdminOption && (
                        <p className="text-xs text-gray-500 mt-1">
                          Admin option unlocked - Click 5 times to reveal
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-name">{t('auth.name', 'Full Name')}</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder={t('auth.enter_name', 'Enter your full name')}
                          value={signupData.name}
                          onChange={(e) => updateSignupField('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-phone">{t('auth.phone', 'Phone Number')}</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder={t('auth.enter_phone', 'Enter your phone number')}
                          value={signupData.phone}
                          onChange={(e) => updateSignupField('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">{t('auth.email', 'Email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.enter_email', 'Enter your email')}
                        value={signupData.email}
                        onChange={(e) => updateSignupField('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-password">{t('auth.password', 'Password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.enter_password', 'Enter your password')}
                            value={signupData.password}
                            onChange={(e) => updateSignupField('password', e.target.value)}
                            className="pl-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signup-confirm-password">{t('auth.confirm_password', 'Confirm Password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('auth.confirm_password', 'Confirm your password')}
                            value={signupData.confirmPassword}
                            onChange={(e) => updateSignupField('confirmPassword', e.target.value)}
                            className="pl-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {signupData.userType === 'customer' && (
                      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t('auth.location_services', 'Location Services')}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="location-consent"
                              checked={signupData.locationConsent}
                              onCheckedChange={(checked: boolean) => updateSignupField('locationConsent', checked)}
                            />
                            <Label htmlFor="location-consent" className="text-sm">
                              {t('auth.location_consent', 'Allow location access')}
                            </Label>
                          </div>
                          <p className="text-xs text-blue-600">
                            {t('auth.location_consent_desc', 'This helps us show you nearby restaurants and provide location-based recommendations.')}
                          </p>
                        </div>
                      </div>
                    )}

                    {signupData.userType === 'restaurant_owner' && (
                      <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {t('auth.restaurant_information', 'Restaurant Information')}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="restaurant-name">{t('auth.restaurant_name', 'Restaurant Name')}</Label>
                            <Input
                              id="restaurant-name"
                              type="text"
                              placeholder={t('auth.enter_restaurant_name', 'Enter restaurant name')}
                              value={signupData.restaurantName}
                              onChange={(e) => updateSignupField('restaurantName', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="restaurant-phone">{t('auth.restaurant_phone', 'Restaurant Phone')}</Label>
                            <Input
                              id="restaurant-phone"
                              type="tel"
                              placeholder={t('auth.enter_restaurant_phone', 'Enter restaurant phone')}
                              value={signupData.restaurantPhone}
                              onChange={(e) => updateSignupField('restaurantPhone', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="restaurant-address">{t('auth.restaurant_address', 'Restaurant Address')}</Label>
                          <Input
                            id="restaurant-address"
                            type="text"
                            placeholder={t('auth.enter_restaurant_address', 'Enter restaurant address')}
                            value={signupData.restaurantAddress}
                            onChange={(e) => updateSignupField('restaurantAddress', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {signupData.userType === 'admin' && (
                      <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t('auth.admin_verification', 'Admin Verification')}
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="admin-code">{t('auth.admin_code', 'Admin Code')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="admin-code"
                              type="password"
                              placeholder={t('auth.enter_admin_code', 'Enter admin verification code')}
                              value={signupData.adminCode || ''}
                              onChange={(e) => updateSignupField('adminCode', e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                          <p className="text-xs text-purple-600">
                            {t('auth.admin_code_desc', 'Admin code required for system administrator access')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Terms and Privacy Policy Agreement */}
                    <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agree-terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked: boolean) => setAgreeToTerms(checked)}
                          required
                        />
                        <Label htmlFor="agree-terms" className="text-sm">
                          {t('auth.agree_to_terms', 'I agree to the')}{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsOfService(true)}
                            className="text-blue-600 hover:underline"
                          >
                            {t('auth.terms_of_service', 'Terms of Service')}
                          </button>{' '}
                          {t('auth.and', 'and')}{' '}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyPolicy(true)}
                            className="text-blue-600 hover:underline"
                          >
                            {t('auth.privacy_policy', 'Privacy Policy')}
                          </button>
                        </Label>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !agreeToTerms}
                    >
                      {isLoading ? t('auth.creating_account', 'Creating account...') : t('auth.create_account', 'Create Account')}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {t('auth.or_signup_with', 'Or sign up with')}
                      </p>
                      <GoogleSignIn onSuccess={onClose} userType={signupData.userType} />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuthModal
        isOpen={showTwoFactorAuth}
        onClose={() => {
          setShowTwoFactorAuth(false);
          setPendingLoginData(null);
        }}
        onVerify={handle2FAVerification}
        onSetupComplete={() => {}} // No-op for verify mode
        mode="verify"
        userEmail={pendingLoginData?.email || ''}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
      />
    </>
  );
};

export default AuthModal; 