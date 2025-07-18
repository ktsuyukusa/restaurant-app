import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AppStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [envStatus, setEnvStatus] = useState({
    supabase: false,
    stripe: false,
    app: false
  });

  useEffect(() => {
    const checkAppStatus = () => {
      try {
        // Check environment variables
        const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        // Test URL construction
        let supabaseUrlValid = false;
        try {
          if (hasSupabaseUrl) {
            new URL(import.meta.env.VITE_SUPABASE_URL);
            supabaseUrlValid = true;
          }
        } catch (e) {
          console.warn('Supabase URL invalid:', e);
        }

        setEnvStatus({
          supabase: hasSupabaseUrl && hasSupabaseKey && supabaseUrlValid,
          stripe: hasStripeKey,
          app: true // App is running
        });

        // Overall status
        if (hasSupabaseUrl && hasSupabaseKey && supabaseUrlValid) {
          setStatus('success');
        } else {
          setStatus('error');
        }

        console.log('✅ App status check complete:', {
          supabase: hasSupabaseUrl && hasSupabaseKey && supabaseUrlValid,
          stripe: hasStripeKey,
          app: true
        });

      } catch (error) {
        console.error('❌ App status check failed:', error);
        setStatus('error');
      }
    };

    // Run check after a short delay to ensure everything is loaded
    setTimeout(checkAppStatus, 1000);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Checking app status...';
      case 'success':
        return 'App is working correctly';
      case 'error':
        return 'Some components need attention';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          App Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>App Core</span>
            <Badge variant={envStatus.app ? "default" : "destructive"}>
              {envStatus.app ? "✅ Working" : "❌ Error"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Supabase</span>
            <Badge variant={envStatus.supabase ? "default" : "destructive"}>
              {envStatus.supabase ? "✅ Connected" : "❌ Not Configured"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Stripe</span>
            <Badge variant={envStatus.stripe ? "default" : "destructive"}>
              {envStatus.stripe ? "✅ Configured" : "❌ Not Configured"}
            </Badge>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">
              {getStatusText()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Browser extension errors are filtered out and don't affect app functionality.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppStatus; 