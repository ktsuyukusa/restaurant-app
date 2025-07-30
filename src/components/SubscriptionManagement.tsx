import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { subscriptionService, type Subscription, type SubscriptionPlan, type SubscriptionPricing } from '../services/subscriptionService';
import { stripeService } from '../services/stripeService';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionManagementProps {
  restaurantId: string;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ restaurantId }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current subscription
      const currentSub = await subscriptionService.getRestaurantSubscription(restaurantId);
      setSubscription(currentSub);

      // Load available plans (pricing for Japan as default)
      const plans = await subscriptionService.getPricingForCountry('JP');
      setAvailablePlans(plans);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    try {
      setUpgrading(planId);
      setError(null);

      // Create checkout session
      const { sessionId, url } = await stripeService.createCheckoutSession({
        priceId: planId,
        userId: user.id,
        restaurantId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
        countryCode: 'JP', // This should be dynamic based on user location
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start upgrade process');
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) return;

    try {
      const { url } = await stripeService.createPortalSession(
        subscription.stripe_customer_id,
        window.location.href
      );
      window.location.href = url;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError('Failed to open subscription management');
    }
  };

  const formatPrice = (amount: number, currency: string = 'JPY') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      trialing: { color: 'bg-blue-100 text-blue-800', label: 'Trial' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', label: 'Past Due' },
      canceled: { color: 'bg-red-100 text-red-800', label: 'Canceled' },
      incomplete: { color: 'bg-gray-100 text-gray-800', label: 'Incomplete' },
    };

    const config = statusConfig[status] || statusConfig.incomplete;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPlanFeatures = (planType: string) => {
    const features = {
      starter: [
        'Up to 50 menu items',
        'Basic order management',
        'Email support',
        'Mobile app access',
      ],
      standard: [
        'Up to 200 menu items',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Multi-location support',
      ],
      premium: [
        'Unlimited menu items',
        'Advanced integrations',
        '24/7 phone support',
        'Custom development',
        'Dedicated account manager',
      ],
    };

    return features[planType as keyof typeof features] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold capitalize">{subscription.plan_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge(subscription.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="font-semibold">
                  {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString('ja-JP')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleManageSubscription} variant="outline">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {subscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.plan_id;
            const features = getPlanFeatures(plan.plan_id);
            
            return (
              <Card key={plan.id} className={isCurrentPlan ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{plan.plan_id}</span>
                    {isCurrentPlan && <Badge>Current</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">
                      {subscriptionService.formatPrice(plan.price_monthly, plan.currency)}
                    </span>
                    <span className="text-sm text-gray-600">
                      /month
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrentPlan && (
                    <Button
                      onClick={() => handleUpgrade(plan.stripe_price_id || plan.id)}
                      disabled={upgrading === plan.id}
                      className="w-full"
                    >
                      {upgrading === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        subscription ? 'Upgrade' : 'Get Started'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Usage Information */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Menu Items</p>
                <p className="font-semibold">Loading...</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders This Month</p>
                <p className="font-semibold">Loading...</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="font-semibold">Loading...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManagement;