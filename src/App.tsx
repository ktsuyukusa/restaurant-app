import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/AppLayout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderCancel from '@/pages/OrderCancel';
import CommercialTransactionAct from '@/pages/CommercialTransactionAct';
import './App.css';

function App() {
  return (
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
  );
}

export default App;