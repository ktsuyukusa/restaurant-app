import React, { useState, useEffect } from 'react';
import { Admin2FASetup } from '../components/Admin2FASetup';
import { useNavigate } from 'react-router-dom';

export default function Admin2FASetupPage() {
  const navigate = useNavigate();
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
    // Redirect to admin dashboard after setup
    setTimeout(() => {
      navigate('/admin');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isSetupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            2FA Setup Complete!
          </h1>
          <p className="text-gray-600">
            You can now log in with your authenticator app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Admin2FASetup 
        onSetupComplete={handleSetupComplete}
        onCancel={handleCancel}
      />
    </div>
  );
} 