import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/hooks/useAppContext';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  duration: string;
  popular?: boolean;
  recommended?: boolean;
}

const SubscriptionManagement: React.FC = () => {
  const { t } = useLanguage();
  const { user, setUser } = useAppContext();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 5000,
      currency: 'JPY',
      duration: 'monthly',
      features: [
        'Menu Management',
        'Order Management', 
        'Basic Analytics',
        'Email Support',
        'Up to 100 orders/month',
        'Basic reporting'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 10000,
      currency: 'JPY',
      duration: 'monthly',
      popular: true,
      features: [
        'All Basic Features',
        'Advanced Analytics',
        'Multi-language Support',
        'Priority Support',
        'Custom Branding',
        'Unlimited orders',
        'Advanced reporting',
        'Customer insights'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 25000,
      currency: 'JPY',
      duration: 'monthly',
      recommended: true,
      features: [
        'All Premium Features',
        'API Access',
        'White-label Solution',
        'Dedicated Support',
        'Custom Integration',
        'Multi-location support',
        'Advanced security',
        'Custom development'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(planId);
    try {
      // For demo purposes, we'll simulate payment processing
      const subscription = await authService.purchaseSubscription(planId, 'demo_payment_method');
      
      // Update user with new subscription
      if (user) {
        const updatedUser = { ...user, subscription };
        setUser(updatedUser);
      }

      toast({
        title: "Subscription Successful!",
        description: `You are now subscribed to the ${plans.find(p => p.id === planId)?.name}`,
      });

    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getCurrentPlan = () => {
    return user?.subscription?.plan;
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlan() === planId;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Zap className="w-6 h-6" />;
      case 'premium':
        return <Star className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Subscription Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your restaurant. All plans include our core features with different levels of support and capabilities.
        </p>
      </div>

      {/* Current Subscription Status */}
      {user?.subscription && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Current Subscription: {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
                </h3>
                <p className="text-blue-700">
                  Status: <Badge variant={user.subscription.status === 'active' ? 'default' : 'destructive'}>
                    {user.subscription.status}
                  </Badge>
                </p>
                <p className="text-blue-700">
                  Expires: {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  ¥{user.subscription.price.toLocaleString()}
                </p>
                <p className="text-blue-700">per month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
            } ${
              plan.recommended ? 'ring-2 ring-purple-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1">
                  Recommended
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold">¥{plan.price.toLocaleString()}</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  isCurrentPlan(plan.id) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : plan.recommended 
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan(plan.id) || isLoading === plan.id}
              >
                {isLoading === plan.id ? (
                  'Processing...'
                ) : isCurrentPlan(plan.id) ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Why Choose Navikko?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Easy to Use</h4>
            <p className="text-gray-600 text-sm">
              Intuitive interface designed specifically for restaurant management
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold mb-2">Multi-language Support</h4>
            <p className="text-gray-600 text-sm">
              Serve customers in their preferred language
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold mb-2">24/7 Support</h4>
            <p className="text-gray-600 text-sm">
              Get help whenever you need it with our dedicated support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement; 