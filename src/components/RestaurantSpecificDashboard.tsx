import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Restaurant {
  id: string;
  name: string;
  name_en?: string;
  name_ja?: string;
  name_zh?: string;
  name_ko?: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerCount: number;
  menuItemsCount: number;
}

const RestaurantSpecificDashboard: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    customerCount: 0,
    menuItemsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
      fetchStats();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant data",
          variant: "destructive",
        });
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Fetch orders for this restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Fetch menu items for this restaurant
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (menuError) {
        console.error('Error fetching menu items:', menuError);
      }

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending')?.length || 0;
      const completedOrders = orders?.filter(order => order.status === 'completed')?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const menuItemsCount = menuItems?.length || 0;

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue,
        customerCount: totalOrders, // Simplified - could be more sophisticated
        menuItemsCount
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const getRestaurantName = () => {
    if (!restaurant) return 'Restaurant';
    
    switch (currentLanguage) {
      case 'ja':
        return restaurant.name_ja || restaurant.name;
      case 'en':
        return restaurant.name_en || restaurant.name;
      default:
        return restaurant.name;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navikko-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/restaurants')}
            className="text-navikko-primary hover:bg-navikko-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Restaurants
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-navikko-secondary mb-2">
          {getRestaurantName()} - {t('dashboard.title', 'Restaurant Dashboard')}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.welcome', 'Restaurant management dashboard with orders, menu, and analytics.')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => navigate(`/restaurant/${restaurantId}/orders`)}
          className="h-16 flex items-center justify-center gap-3 bg-navikko-primary hover:bg-navikko-primary/90"
        >
          <Calendar className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">Manage Orders</div>
            <div className="text-sm opacity-90">{stats.pendingOrders} pending</div>
          </div>
        </Button>
        
        <Button
          onClick={() => navigate(`/restaurant/${restaurantId}/menu`)}
          variant="outline"
          className="h-16 flex items-center justify-center gap-3 border-navikko-primary text-navikko-primary hover:bg-navikko-primary/10"
        >
          <BookOpen className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">Manage Menu</div>
            <div className="text-sm opacity-70">{stats.menuItemsCount} items</div>
          </div>
        </Button>
        
        <Button
          onClick={() => navigate(`/restaurant/${restaurantId}/analytics`)}
          variant="outline"
          className="h-16 flex items-center justify-center gap-3 border-navikko-primary text-navikko-primary hover:bg-navikko-primary/10"
        >
          <BarChart3 className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">View Analytics</div>
            <div className="text-sm opacity-70">Performance data</div>
          </div>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_orders', 'Total Orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.pending_orders', 'Pending Orders')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.need_attention', 'Need attention')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_revenue', 'Total Revenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ¥{stats.averageOrderValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItemsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active menu items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.pendingOrders > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              {t('dashboard.alerts', 'Alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                {stats.pendingOrders} orders pending for this restaurant
              </p>
              <p className="text-xs text-yellow-600">
                {t('dashboard.review_process_orders', 'Review and process orders')}
              </p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => navigate(`/restaurant/${restaurantId}/orders`)}
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RestaurantSpecificDashboard;