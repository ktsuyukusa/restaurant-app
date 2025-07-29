import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerCount: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  items: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  time: string;
}

const RestaurantOwnerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    customerCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalOrders: 156,
        pendingOrders: 8,
        completedOrders: 148,
        totalRevenue: 234500,
        averageOrderValue: 1503,
        customerCount: 89
      });
      
      setRecentOrders([
        {
          id: 'order-001',
          customerName: '田中太郎',
          items: 'Carbonara x1, レモンスパゲッティ x1',
          total: 2500,
          status: 'pending',
          time: '14:30'
        },
        {
          id: 'order-002',
          customerName: 'John Smith',
          items: 'Set Menu A x2',
          total: 3600,
          status: 'completed',
          time: '13:15'
        },
        {
          id: 'order-003',
          customerName: '李小明',
          items: 'Seafood Pasta x1',
          total: 1600,
          status: 'pending',
          time: '12:45'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navikko-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navikko-secondary mb-2">
          {t('dashboard.title', 'レストランダッシュボード')}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.welcome', 'お帰りなさい！レストランのパフォーマンス概要をご覧ください。')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_orders', '総注文数')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.orders_growth', '先月比+12%')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pending_orders', '保留中の注文')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.need_attention', '要対応')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_revenue', '総売上')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.revenue_growth', '先月比+8%')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.customers', '顧客数')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.new_customers', '今週+5名の新規顧客')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('dashboard.recent_orders', '最近の注文')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-600">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">¥{order.total}</p>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {t(`dashboard.status.${order.status}`, getStatusText(order.status))}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/orders')}
            >
              {t('dashboard.view_all_orders', 'すべての注文を表示')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.performance', 'パフォーマンス')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.average_order_value', '平均注文額')}</span>
                <span className="font-medium">¥{stats.averageOrderValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.completion_rate', '完了率')}</span>
                <span className="font-medium text-green-600">
                  {Math.round((stats.completedOrders / stats.totalOrders) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.pending_orders', '保留中の注文')}</span>
                <span className="font-medium text-yellow-600">{stats.pendingOrders}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/menu-management')}
            >
              {t('dashboard.manage_menu', 'メニュー管理')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('dashboard.alerts', 'アラート')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingOrders > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    {t('dashboard.orders_pending_count', `${stats.pendingOrders}件の注文が保留中`).replace('{count}', stats.pendingOrders.toString())}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {t('dashboard.review_process_orders', '注文を確認・処理してください')}
                  </p>
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {t('dashboard.menu_update_available', 'メニュー更新が利用可能')}
                </p>
                <p className="text-xs text-blue-600">
                  {t('dashboard.add_seasonal_items', '季節のアイテムを追加')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/restaurants')}
            >
              {t('dashboard.view_restaurant', 'レストランを表示')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard; 