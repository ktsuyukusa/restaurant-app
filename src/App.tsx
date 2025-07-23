import React from 'react';
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
import CommercialTransactionAct from '@/components/CommercialTransactionAct';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/commercial-transaction-act" element={<CommercialTransactionAct />} />
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
  );
}

export default App;