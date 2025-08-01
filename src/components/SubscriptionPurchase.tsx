import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, CreditCard, Building, Zap, Crown, Tag, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import authService, { Subscription } from '@/services/authService';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  duration: string;
}

interface PromoCode {
  type: string;
  discount: number;
  expires: string;
  description: string;
}

interface AppliedPromo extends PromoCode {
  code: string;
}

interface SubscriptionPurchaseProps {
  onSubscriptionPurchased: (subscription: Subscription) => void;
  onCancel: () => void;
}

const SubscriptionPurchase: React.FC<SubscriptionPurchaseProps> = ({
  onSubscriptionPurchased,
  onCancel
}) => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const subscriptionPlans = await authService.getSubscriptionPlans();
      setPlans(subscriptionPlans);
    } catch (err) {
      setError('Failed to load subscription plans');
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll use a mock payment method
      const subscription = await authService.purchaseSubscription(selectedPlan, 'mock_payment_method');
      onSubscriptionPurchased(subscription);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase subscription';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Building className="h-6 w-6" />;
      case 'premium':
        return <Zap className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Building className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'premium':
        return 'border-green-200 bg-green-50';
      case 'enterprise':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-green-100 text-green-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Promotional codes validation
  const VALID_PROMO_CODES: Record<string, PromoCode> = {
    'RESTAURANT2025': { type: 'restaurant', discount: 20, expires: '2025-12-31', description: 'Restaurant Beta Access - 20% off' },
    'BETA-REST-001': { type: 'restaurant', discount: 15, expires: '2025-08-31', description: 'Early Restaurant Access - 15% off' },
    'NAVIKKO-BETA': { type: 'general', discount: 10, expires: '2025-12-31', description: 'General Beta Access - 10% off' },
    'LAUNCH-WEEK': { type: 'limited', discount: 25, expires: '2025-03-31', description: 'Launch Week Special - 25% off' },
    'EARLY-BIRD': { type: 'early', discount: 15, expires: '2025-08-31', description: 'Early Bird Access - 15% off' },
    'PARTNER-001': { type: 'partner', discount: 30, expires: '2025-12-31', description: 'Partner Access - 30% off' },
    'TOURISM-JP': { type: 'tourism', discount: 20, expires: '2025-12-31', description: 'Japan Tourism Partner - 20% off' },
    'DEV-TEST-001': { type: 'developer', discount: 50, expires: '2025-12-31', description: 'Developer Testing - 50% off' },
    'QA-BETA-001': { type: 'qa', discount: 50, expires: '2025-12-31', description: 'QA Testing Access - 50% off' },
    'DEMO-2025': { type: 'demo', discount: 100, expires: '2025-12-31', description: 'Demo Access - Free' },
    'SHOWCASE': { type: 'demo', discount: 100, expires: '2025-12-31', description: 'Showcase Demo - Free' }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError(null);

    if (!code) {
      setPromoError('Please enter a promotional code');
      return;
    }

    const codeData = VALID_PROMO_CODES[code];
    if (!codeData) {
      setPromoError('Invalid promotional code');
      return;
    }

    // Check if code is expired
    const expiryDate = new Date(codeData.expires);
    const now = new Date();
    if (now > expiryDate) {
      setPromoError('This promotional code has expired');
      return;
    }

    setAppliedPromo({ code, ...codeData });
    setPromoCode('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedPromo) return originalPrice;
    const discount = appliedPromo.discount;
    return Math.max(0, originalPrice - (originalPrice * discount / 100));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navikko-secondary mb-4">
          Choose Your Restaurant Subscription Plan
        </h1>
        <p className="text-lg text-navikko-secondary">
          Select a plan to start managing your restaurant with Navikko
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-navikko-primary border-navikko-primary' 
                : 'hover:border-navikko-primary/50'
            } ${getPlanColor(plan.id)}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className={`p-3 rounded-full ${getPlanColor(plan.id)}`}>
                  {getPlanIcon(plan.id)}
                </div>
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-navikko-secondary">
                {appliedPromo ? (
                  <div>
                    <div className="text-lg line-through text-gray-400">
                      ¥{plan.price.toLocaleString()}
                    </div>
                    <div>
                      ¥{calculateDiscountedPrice(plan.price).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <>¥{plan.price.toLocaleString()}</>
                )}
                <span className="text-sm font-normal text-gray-600">/{plan.duration}</span>
              </div>
              {appliedPromo && (
                <Badge className="bg-green-100 text-green-800">
                  {appliedPromo.discount}% OFF
                </Badge>
              )}
              <Badge className={getPlanBadgeColor(plan.id)}>
                {plan.id === 'basic' && 'Most Popular'}
                {plan.id === 'premium' && 'Recommended'}
                {plan.id === 'enterprise' && 'Enterprise'}
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-navikko-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Promotional Code Section */}
      <div className="max-w-md mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5" />
              Promotional Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!appliedPromo ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="promo-code">Enter promotional code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="promo-code"
                      type="text"
                      placeholder="PROMO-CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                    <Button onClick={handleApplyPromo} variant="outline">
                      Apply
                    </Button>
                  </div>
                </div>
                {promoError && (
                  <p className="text-red-600 text-sm">{promoError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">{appliedPromo.code}</div>
                    <div className="text-sm text-green-600">{appliedPromo.description}</div>
                  </div>
                  <Button
                    onClick={handleRemovePromo}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-8 py-3"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePurchase}
          disabled={!selectedPlan || isLoading}
          className="px-8 py-3 bg-navikko-primary hover:bg-navikko-primary/90"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase Subscription
            </div>
          )}
        </Button>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-navikko-secondary mb-3">What's included in all plans:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-navikko-secondary">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Restaurant profile management</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Menu creation and management</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Order management system</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Customer analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Multi-language support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Mobile-responsive interface</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPurchase; 