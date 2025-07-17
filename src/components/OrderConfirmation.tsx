import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MapPin, Phone, Mail, QrCode, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_time: string;
  notes: string;
  total_amount: number;
  status: string;
  payment_method: string;
  items: OrderItem[];
  created_at: string;
}

interface OrderConfirmationProps {
  order: Order;
  onClose?: () => void;
  onDownloadReceipt?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ 
  order, 
  onClose, 
  onDownloadReceipt 
}) => {
  const { t, currentLanguage } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const generateQRCode = () => {
    // This would generate a QR code with order details
    // For now, return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER-${order.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('order.details', 'Order Details')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('order.orderNumber', 'Order Number')}:</span>
                <p className="text-gray-600">{order.id}</p>
              </div>
              <div>
                <span className="font-medium">{t('order.date', 'Order Date')}:</span>
                <p className="text-gray-600">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <span className="font-medium">{t('order.status', 'Status')}:</span>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <span className="font-medium">{t('order.paymentMethod', 'Payment Method')}:</span>
                <p className="text-gray-600">{order.payment_method.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Restaurant Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('restaurant.info', 'Restaurant Information')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{order.restaurant_name || 'Restaurant'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{t('order.pickupTime', 'Pickup Time')}: {order.pickup_time}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('customer.info', 'Customer Information')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t('form.name', 'Name')}:</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{order.customer_email}</span>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('order.items', 'Order Items')}</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ¥{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t('order.total', 'Total')}:</span>
              <span>¥{order.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('order.notes', 'Special Instructions')}</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* QR Code for Pickup */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">{t('order.qrCode', 'Pickup QR Code')}</h3>
            <div className="flex justify-center">
              <img 
                src={generateQRCode()} 
                alt="Order QR Code" 
                className="border-2 border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600">
              {t('order.qrCode.instructions', 'Show this QR code when picking up your order')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onDownloadReceipt}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('order.downloadReceipt', 'Download Receipt')}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              {t('order.done', 'Done')}
            </Button>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t('order.importantNotes', 'Important Notes')}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('order.notes.pickup', 'Please arrive at the restaurant at your selected pickup time')}</li>
              <li>• {t('order.notes.qrCode', 'Show the QR code to the staff when picking up')}</li>
              <li>• {t('order.notes.contact', 'Contact the restaurant if you need to modify your order')}</li>
              <li>• {t('order.notes.receipt', 'Keep this confirmation for your records')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation; 