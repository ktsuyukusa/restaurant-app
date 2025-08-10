import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, QrCode, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    status: string;
    date: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify the payment
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${window.location.origin}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          // Payment is verified, you could fetch order details here
          setOrderDetails({
            orderId: `ORDER-${Date.now()}`,
            status: 'paid',
            date: new Date().toLocaleDateString(),
          });
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    // Generate and download receipt
    const receipt = `
      Order Receipt
      =============
      Order ID: ${orderDetails?.orderId}
      Date: ${orderDetails?.date}
      Status: ${orderDetails?.status}
      
      Thank you for your order!
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderDetails?.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navikko-primary mx-auto mb-4"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              {t('order.confirmation.title', 'Order Confirmed!')}
            </CardTitle>
            <p className="text-gray-600">
              {t('order.confirmation.subtitle', 'Your order has been successfully placed and paid for.')}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">{t('order.details', 'Order Details')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('order.orderNumber', 'Order Number')}:</span>
                  <span className="font-mono">{orderDetails?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('order.date', 'Order Date')}:</span>
                  <span>{orderDetails?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('order.status', 'Status')}:</span>
                  <span className="text-green-600 font-semibold">{orderDetails?.status}</span>
                </div>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t('order.qrCode', 'Pickup QR Code')}
              </h3>
              <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">{t('order.qrCode.instructions', 'Show this QR code when picking up your order')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={downloadReceipt}
                variant="outline" 
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('order.downloadReceipt', 'Download Receipt')}
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('order.done', 'Done')}
              </Button>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">{t('order.importantNotes', 'Important Notes')}</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• {t('order.notes.pickup', 'Please arrive at the restaurant at your selected pickup time')}</li>
                <li>• {t('order.notes.qrCode', 'Show the QR code to the staff when picking up')}</li>
                <li>• {t('order.notes.contact', 'Contact the restaurant if you need to modify your order')}</li>
                <li>• {t('order.notes.receipt', 'Keep this confirmation for your records')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;  