import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  EyeOff
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import authService, { SignupData as AuthSignupData, LoginData as AuthLoginData } from '@/services/authService';
import { validateAdminCode } from '@/config/adminCodes';
import SubscriptionPurchase from './SubscriptionPurchase';
import PaymentMethodRegistration from './PaymentMethodRegistration';
import GoogleSignIn from './GoogleSignIn';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  userType: 'customer' | 'restaurant_owner' | 'admin';
  // Customer specific fields
  locationConsent?: boolean;
  // Restaurant owner specific fields
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  cuisine?: string;
  // Admin specific fields
  adminCode?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { setUserRole } = useAppContext();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionPurchase, setShowSubscriptionPurchase] = useState(false);
  const [showPaymentMethodRegistration, setShowPaymentMethodRegistration] = useState(false);
  const [signupStep, setSignupStep] = useState<'userType' | 'details' | 'subscription' | 'payment' | 'complete'>('userType');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [signupData, setSignupData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    userType: 'customer'
  });

  const [loginData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: ''
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
      const authSignupData: AuthSignupData = {
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        phone: signupData.phone,
        userType: signupData.userType,
        locationConsent: signupData.userType === 'customer' ? signupData.locationConsent : undefined,
        restaurantInfo: signupData.userType === 'restaurant_owner' ? {
          name: signupData.restaurantName!,
          address: signupData.restaurantAddress!,
          phone: signupData.restaurantPhone!,
          cuisine: signupData.cuisine || 'Other'
        } : undefined,
        adminCode: signupData.userType === 'admin' ? signupData.adminCode : undefined
      };

      const user = await authService.signup(authSignupData);
      setUserRole(user.userType);
      
      // Handle post-signup flow based on user type
      if (user.userType === 'customer') {
        // Customer registration complete - no payment required initially
        onClose();
        resetForm();
      } else if (user.userType === 'restaurant_owner') {
        setShowSubscriptionPurchase(true);
      } else {
        // Admin - complete signup
        onClose();
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authLoginData: AuthLoginData = {
        email: loginData.email,
        password: loginData.password
      };

      const user = await authService.login(authLoginData);
      setUserRole(user.userType);
      onClose();
      
      // Reset form
      setLoginFormData({
        email: '',
        password: ''
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignupField = (field: keyof SignupFormData, value: string | boolean) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const updateLoginField = (field: keyof LoginFormData, value: string) => {
    setLoginFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSignupData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      userType: 'customer'
    });
    setSignupStep('userType');
  };

  const handleSubscriptionPurchased = () => {
    setShowSubscriptionPurchase(false);
    onClose();
    resetForm();
  };

  const handlePaymentMethodAdded = () => {
    setShowPaymentMethodRegistration(false);
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('auth.welcome')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.enter_email')}
                        value={loginData.email}
                        onChange={(e) => updateLoginField('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.enter_password')}
                        value={loginData.password}
                        onChange={(e) => updateLoginField('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.logging_in') : t('auth.login')}
                  </Button>
                </form>

                {/* Google Sign-In for Login */}
                <div className="mt-4">
                  <GoogleSignIn
                    userType="customer"
                    onSuccess={(user) => {
                      onClose();
                      setLoginFormData({ email: '', password: '' });
                    }}
                    onError={(error) => setError(error)}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* User Type Selection */}
                  <div className="space-y-2">
                    <Label>{t('auth.i_am_a')}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = signupData.userType === type.id;
                        
                        return (
                          <div
                            key={type.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-navikko-primary bg-navikko-primary/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateSignupField('userType', type.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{t(`auth.${type.id}`)}</span>
                              {isSelected && (
                                <Badge className="bg-navikko-primary text-white text-xs">
                                  {t('auth.selected')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{t(`auth.${type.id}_desc`)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('auth.full_name')}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t('auth.enter_full_name')}
                        value={signupData.name}
                        onChange={(e) => updateSignupField('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">{t('auth.phone_number')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder={t('auth.enter_phone')}
                          value={signupData.phone}
                          onChange={(e) => updateSignupField('phone', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.enter_email')}
                        value={signupData.email}
                        onChange={(e) => updateSignupField('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.create_password')}
                          value={signupData.password}
                          onChange={(e) => updateSignupField('password', e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">{t('auth.confirm_password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.confirm_password_placeholder')}
                          value={signupData.confirmPassword}
                          onChange={(e) => updateSignupField('confirmPassword', e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Specific Fields */}
                  {signupData.userType === 'customer' && (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('auth.customer_preferences')}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="location-consent"
                            checked={signupData.locationConsent || false}
                            onChange={(e) => updateSignupField('locationConsent', e.target.checked)}
                            className="mt-1 rounded"
                          />
                          <div>
                            <Label htmlFor="location-consent" className="font-medium">
                              {t('auth.location_consent')}
                            </Label>
                            <p className="text-sm text-blue-700 mt-1">
                              {t('auth.location_consent_desc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restaurant Owner Specific Fields */}
                  {signupData.userType === 'restaurant_owner' && (
                    <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {t('auth.restaurant_information')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="restaurant-name">{t('auth.restaurant_name')}</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="restaurant-name"
                              type="text"
                              placeholder={t('auth.enter_restaurant_name')}
                              value={signupData.restaurantName || ''}
                              onChange={(e) => updateSignupField('restaurantName', e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="restaurant-phone">{t('auth.restaurant_phone')}</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="restaurant-phone"
                              type="tel"
                              placeholder={t('auth.enter_restaurant_phone')}
                              value={signupData.restaurantPhone || ''}
                              onChange={(e) => updateSignupField('restaurantPhone', e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="restaurant-address">{t('auth.restaurant_address')}</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="restaurant-address"
                            type="text"
                            placeholder={t('auth.enter_restaurant_address')}
                            value={signupData.restaurantAddress || ''}
                            onChange={(e) => updateSignupField('restaurantAddress', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="restaurant-cuisine">{t('auth.cuisine_type')}</Label>
                        <Select 
                          value={signupData.cuisine || ''} 
                          onValueChange={(value) => updateSignupField('cuisine', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('auth.select_cuisine_type')} />
                          </SelectTrigger>
                          <SelectContent>
                            {cuisines.map((cuisine) => (
                              <SelectItem key={cuisine} value={cuisine}>
                                {cuisine}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Admin Specific Fields */}
                  {signupData.userType === 'admin' && (
                    <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        {t('auth.admin_verification')}
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="admin-code">{t('auth.admin_code')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="admin-code"
                            type="password"
                            placeholder={t('auth.enter_admin_code')}
                            value={signupData.adminCode || ''}
                            onChange={(e) => updateSignupField('adminCode', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-purple-600">
                          {t('auth.admin_code_desc')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Terms and Privacy Policy Agreement */}
                  <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agree-terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 rounded"
                        required
                      />
                      <div className="text-sm">
                        <Label htmlFor="agree-terms" className="font-medium">
                          {t('auth.agree_to_terms')}
                        </Label>
                        <div className="mt-1 space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowTermsOfService(true)}
                            className="text-navikko-primary hover:underline text-sm"
                          >
                            {t('auth.terms_of_service')}
                          </button>
                          <span className="text-gray-500">and</span>
                          <button
                            type="button"
                            onClick={() => setShowPrivacyPolicy(true)}
                            className="text-navikko-primary hover:underline text-sm"
                          >
                            {t('auth.privacy_policy')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.signing_up') : t('auth.signup')}
                  </Button>
                </form>

                {/* Google Sign-In for Signup */}
                <div className="mt-4">
                  <GoogleSignIn
                    userType={signupData.userType}
                    onSuccess={(user) => {
                      if (user.userType === 'customer') {
                        onClose();
                        resetForm();
                      } else if (user.userType === 'restaurant_owner') {
                        setShowSubscriptionPurchase(true);
                      } else {
                        onClose();
                        resetForm();
                      }
                    }}
                    onError={(error) => setError(error)}
                    locationConsent={signupData.locationConsent}
                    restaurantInfo={signupData.userType === 'restaurant_owner' ? {
                      name: signupData.restaurantName || '',
                      address: signupData.restaurantAddress || '',
                      phone: signupData.restaurantPhone || '',
                      cuisine: signupData.cuisine || 'Other'
                    } : undefined}
                    adminCode={signupData.adminCode}
                    phone={signupData.phone}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Subscription Purchase Modal */}
      {showSubscriptionPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SubscriptionPurchase
              onSubscriptionPurchased={handleSubscriptionPurchased}
              onCancel={() => setShowSubscriptionPurchase(false)}
            />
          </div>
        </div>
      )}
      
      {/* Payment Method Registration Modal */}
      {showPaymentMethodRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentMethodRegistration
              onPaymentMethodAdded={handlePaymentMethodAdded}
              onCancel={() => setShowPaymentMethodRegistration(false)}
            />
          </div>
        </div>
      )}
      
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
    </Dialog>
  );
};

export default AuthModal; 