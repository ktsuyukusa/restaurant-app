import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const OrderCancel: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Payment Cancelled
            </CardTitle>
            <p className="text-gray-600">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happened?</h3>
              <p className="text-sm text-gray-700">
                You cancelled the payment process. Your order has not been placed and no money has been charged.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline" 
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Need Help?</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• If you're having trouble with payment, please contact the restaurant directly</li>
                <li>• You can try placing your order again</li>
                <li>• For technical support, please contact our support team</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderCancel; 