import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Check, 
  Eye, 
  EyeOff,
  Shield,
  Lock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import authService, { PaymentMethod } from '@/services/authService';

interface PaymentMethodRegistrationProps {
  onPaymentMethodAdded: (paymentMethod: PaymentMethod) => void;
  onCancel: () => void;
}

const PaymentMethodRegistration: React.FC<PaymentMethodRegistrationProps> = ({
  onPaymentMethodAdded,
  onCancel
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'card' | 'paypay'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState(false);

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: true
  });

  // PayPay form state
  const [paypayData, setPaypayData] = useState({
    phoneNumber: '',
    isDefault: true
  });

  const updateCardField = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const updatePaypayField = (field: string, value: string) => {
    setPaypayData(prev => ({ ...prev, [field]: value }));
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || 
        !cardData.cvv || !cardData.cardholderName) {
      throw new Error('Please fill in all card details');
    }

    if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      throw new Error('Card number must be 16 digits');
    }

    if (cardData.cvv.length !== 3 && cardData.cvv.length !== 4) {
      throw new Error('CVV must be 3 or 4 digits');
    }

    const currentYear = new Date().getFullYear();
    const expiryYear = parseInt(cardData.expiryYear);
    if (expiryYear < currentYear) {
      throw new Error('Card has expired');
    }
  };

  const validatePaypayData = () => {
    if (!paypayData.phoneNumber) {
      throw new Error('Please enter your PayPay phone number');
    }

    // Basic Japanese phone number validation
    const phoneRegex = /^(\+81|0)[0-9-]{9,}$/;
    if (!phoneRegex.test(paypayData.phoneNumber)) {
      throw new Error('Please enter a valid Japanese phone number');
    }
  };

  const handleAddCard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      validateCardData();

      const paymentMethod = await authService.addPaymentMethod({
        type: 'card',
        last4: cardData.cardNumber.slice(-4),
        brand: getCardBrand(cardData.cardNumber),
        isDefault: cardData.isDefault
      });

      onPaymentMethodAdded(paymentMethod);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayPay = async () => {
    setIsLoading(true);
    setError(null);

    try {
      validatePaypayData();

      const paymentMethod = await authService.addPaymentMethod({
        type: 'paypay',
        isDefault: paypayData.isDefault
      });

      onPaymentMethodAdded(paymentMethod);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i)
  }));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-navikko-secondary mb-2">
          Add Payment Method
        </h1>
        <p className="text-navikko-secondary">
          Choose your preferred payment method for seamless ordering
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'card' | 'paypay')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="paypay" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                PayPay
              </TabsTrigger>
            </TabsList>

            {/* Credit Card Tab */}
            <TabsContent value="card" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      type={showCardNumber ? 'text' : 'password'}
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={(e) => updateCardField('cardNumber', formatCardNumber(e.target.value))}
                      className="pr-10"
                      maxLength={19}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCardNumber(!showCardNumber)}
                    >
                      {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {cardData.cardNumber && (
                    <p className="text-xs text-gray-600">
                      {getCardBrand(cardData.cardNumber)} •••• {cardData.cardNumber.slice(-4)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-month">Expiry Month</Label>
                    <Select value={cardData.expiryMonth} onValueChange={(value) => updateCardField('expiryMonth', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry-year">Expiry Year</Label>
                    <Select value={cardData.expiryYear} onValueChange={(value) => updateCardField('expiryYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => updateCardField('cvv', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Cardholder Name</Label>
                    <Input
                      id="cardholder-name"
                      type="text"
                      placeholder="John Doe"
                      value={cardData.cardholderName}
                      onChange={(e) => updateCardField('cardholderName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="card-default"
                    checked={cardData.isDefault}
                    onChange={(e) => updateCardField('isDefault', e.target.checked.toString())}
                    className="rounded"
                  />
                  <Label htmlFor="card-default">Set as default payment method</Label>
                </div>
              </div>
            </TabsContent>

            {/* PayPay Tab */}
            <TabsContent value="paypay" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paypay-phone">PayPay Phone Number</Label>
                  <Input
                    id="paypay-phone"
                    type="tel"
                    placeholder="+81 90-1234-5678"
                    value={paypayData.phoneNumber}
                    onChange={(e) => updatePaypayField('phoneNumber', e.target.value)}
                  />
                  <p className="text-xs text-gray-600">
                    Enter the phone number associated with your PayPay account
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paypay-default"
                    checked={paypayData.isDefault}
                    onChange={(e) => updatePaypayField('isDefault', e.target.checked.toString())}
                    className="rounded"
                  />
                  <Label htmlFor="paypay-default">Set as default payment method</Label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">PayPay Security</h4>
                      <p className="text-sm text-blue-700">
                        Your PayPay account is protected by biometric authentication and PIN. 
                        No sensitive payment information is stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={activeTab === 'card' ? handleAddCard : handleAddPayPay}
              disabled={isLoading}
              className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Add Payment Method
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Security & Privacy</span>
        </div>
        <p className="text-xs text-gray-600">
          All payment information is encrypted and processed securely. 
          We never store your full card details on our servers.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodRegistration;  