import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AppLayout from '@/components/AppLayout';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderCancel from '@/pages/OrderCancel';
import CommercialTransactionAct from '@/pages/CommercialTransactionAct';
import Admin2FASetup from '@/pages/Admin2FASetup';
import { Production2FADebug } from '@/components/Production2FADebug';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Main app routes */}
              <Route path="/" element={<AppLayout />} />
              <Route path="/restaurants" element={<AppLayout />} />
              <Route path="/restaurant/:id" element={<AppLayout />} />
              <Route path="/cart" element={<AppLayout />} />
              <Route path="/profile" element={<AppLayout />} />
              
              {/* Restaurant owner routes */}
              <Route path="/dashboard" element={<AppLayout />} />
              <Route path="/orders" element={<AppLayout />} />
              <Route path="/menu-management" element={<AppLayout />} />
              <Route path="/subscription" element={<AppLayout />} />
              
              {/* Admin routes */}
              <Route path="/users" element={<AppLayout />} />
              <Route path="/reservations" element={<AppLayout />} />
              
              {/* Static pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/commercial-transaction-act" element={<CommercialTransactionAct />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-cancel" element={<OrderCancel />} />
              <Route path="/admin-2fa-setup" element={<Admin2FASetup />} />
              <Route path="/2fa-debug" element={<Production2FADebug isVisible={true} />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;