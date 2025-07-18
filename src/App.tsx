import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AppLayout from '@/components/AppLayout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderCancel from '@/pages/OrderCancel';
import './App.css';

// Environment variable test - add this to debug URL issues
console.log('App.tsx - Environment Variables Test:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasStripeKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
  stripeKeyLength: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.length || 0
});

// Test URL construction
try {
  if (import.meta.env.VITE_SUPABASE_URL) {
    new URL(import.meta.env.VITE_SUPABASE_URL);
    console.log('✅ Supabase URL is valid');
  }
} catch (error) {
  console.error('❌ Supabase URL is invalid:', error);
}

// Error boundary to catch and isolate browser extension errors
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Only catch errors from our app, not browser extensions
    if (error.message.includes('content-script') || 
        error.message.includes('www.navikko.com') ||
        error.stack?.includes('content.js')) {
      console.warn('Browser extension error caught and ignored:', error);
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log errors from our app
    if (!error.message.includes('content-script') && 
        !error.message.includes('www.navikko.com') &&
        !errorInfo.componentStack?.includes('content.js')) {
      console.error('App error caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    // Log app initialization
    console.log('🚀 App initialized successfully');
    console.log('📍 Current URL:', window.location.href);
    console.log('🌐 User Agent:', navigator.userAgent);
    
    // Check if we're in a browser extension context
    if (window.chrome && window.chrome.runtime) {
      console.log('⚠️ Running in browser extension context');
    }
    
    // Verify our environment is working
    console.log('✅ App environment check complete');
  }, []);

  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-cancel" element={<OrderCancel />} />
                <Route path="/app/*" element={<AppLayout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AppProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

export default App;