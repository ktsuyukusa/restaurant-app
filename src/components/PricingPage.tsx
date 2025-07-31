import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, CreditCard, Shield, Users, Menu, BarChart3, Calendar, MapPin, Smartphone, QrCode, Bell } from 'lucide-react';
import { subscriptionService, type SubscriptionPricing } from '../services/subscriptionService';

interface PricingPageProps {
  countryCode?: string;
}

export const PricingPage: React.FC<PricingPageProps> = ({ countryCode = 'JP' }) => {
  const [pricing, setPricing] = useState<SubscriptionPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(countryCode);

  const supportedCountries = [
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  ];

  const loadPricing = useCallback(async () => {
    try {
      setLoading(true);
      const pricingData = await subscriptionService.getPricingForCountry(selectedCountry);
      setPricing(pricingData);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const getPlanFeatures = (planId: string) => {
    const features = {
      starter: [
        'Up to 50 menu items',
        'Basic order management',
        'Email support',
        'Mobile app access',
        '5 languages supported',
        'Basic analytics',
        'QR code ordering',
        'Basic customer notifications',
        'Simple reservation system',
        'Basic reporting dashboard'
      ],
      standard: [
        'Up to 200 menu items',
        'Advanced order management',
        'Priority email support',
        'Custom branding',
        '10 languages supported',
        'Advanced analytics',
        'Reservation system',
        'Multi-location support',
        'Customer loyalty program',
        'Advanced reporting dashboard',
        'Push notifications',
        'Social media integration',
        'Basic marketing tools',
        'Customer feedback system'
      ],
      premium: [
        'Unlimited menu items',
        'Full order management suite',
        '24/7 phone support',
        'Custom development',
        'All languages supported',
        'Real-time analytics',
        'Advanced reservation system',
        'API access',
        'Dedicated account manager',
        'White-label solution',
        'AI-powered recommendations',
        'Advanced marketing automation',
        'Customer segmentation',
        'Loyalty program customization',
        'Multi-channel ordering',
        'Advanced inventory management',
        'Staff management system',
        'Performance benchmarking'
      ],
    };

    return features[planId as keyof typeof features] || [];
  };

  const getPlanDescription = (planId: string) => {
    const descriptions = {
      starter: 'Perfect for small restaurants getting started with multilingual service',
      standard: 'Ideal for growing restaurants with multiple needs and locations',
      premium: 'Complete solution for enterprise restaurants with advanced requirements',
    };

    return descriptions[planId as keyof typeof descriptions] || '';
  };

  const getPopularPlan = () => 'standard';

  const handleGetStarted = () => {
    // Redirect to the promotional code system
    window.location.href = '/beta';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transparent pricing tailored to your region. No hidden fees.
          </p>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
            <p className="font-semibold">Restaurant Owner Testing Program</p>
            <p className="text-sm">Use promotional codes for free trial access (14-day free trial included with all plans)</p>
          </div>

          {/* Country Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {supportedCountries.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry === country.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCountry(country.code)}
                className="flex items-center gap-2"
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricing.map((plan) => {
              const features = getPlanFeatures(plan.plan_id);
              const description = getPlanDescription(plan.plan_id);
              const isPopular = plan.plan_id === getPopularPlan();

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    isPopular
                      ? 'ring-2 ring-blue-500 shadow-xl scale-105'
                      : 'shadow-lg hover:shadow-xl transition-shadow'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold capitalize">
                      {plan.plan_id}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {subscriptionService.formatPrice(plan.price_monthly, plan.currency)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save {Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)}% with yearly billing
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={handleGetStarted}
                      className={`w-full ${
                        isPopular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      Get Started
                    </Button>

                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-500">
                        14-day free trial • No credit card required
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Use promotional code for restaurant owner testing
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
            <p className="text-gray-600">
              Support for 12+ languages and regional payment methods across Asia and Europe.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Payments</h3>
            <p className="text-gray-600">
              Multiple payment options including Stripe, PayPal, and local payment methods.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-600">
              Bank-level security with 2FA, data encryption, and compliance certifications.
            </p>
          </div>
        </div>

        {/* Restaurant Owner Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Benefits for Restaurant Owners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Menu className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Multilingual Menu</h3>
              <p className="text-sm text-gray-600">Reach international customers with translated menus</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Track customer behavior and optimize your offerings</p>
            </div>
            <div className="text-center">
              <Calendar className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Reservation System</h3>
              <p className="text-sm text-gray-600">Manage bookings efficiently with our integrated system</p>
            </div>
            <div className="text-center">
              <Smartphone className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Mobile Ordering</h3>
              <p className="text-sm text-gray-600">Enable customers to order directly from their phones</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept credit cards, PayPal, and local payment methods depending on your region.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes, all plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How do I get a promotional code?</h3>
              <p className="text-gray-600 text-sm">
                Restaurant owners can request promotional codes for testing by contacting our team. 
                Club members and partners receive exclusive codes with extended trial periods.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens after the trial period?</h3>
              <p className="text-gray-600 text-sm">
                After your trial period ends, you can continue with a paid subscription or downgrade to a free plan 
                with limited features. We'll notify you before your trial ends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;