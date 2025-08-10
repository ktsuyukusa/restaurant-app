import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/hooks/useAppContext';
import authService, { GoogleUser, GoogleSignInData } from '@/services/authService';
import TwoFactorAuthModal from './TwoFactorAuthModal';

// GoogleSignIn component with internationalization support and ESLint fixes

interface GoogleSignInProps {
  userType: 'customer' | 'restaurant_owner';
  onSuccess?: (user: unknown) => void;
  onError?: (error: string) => void;
  locationConsent?: boolean;
  restaurantInfo?: unknown;
  adminCode?: string;
  phone?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

interface GoogleSignInResponse {
  credential: string;
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleSignInResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleRenderOptions {
  type?: string;
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
  logo_alignment?: string;
  width?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleRenderOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  userType,
  onSuccess,
  onError,
  locationConsent = false,
  restaurantInfo,
  adminCode,
  phone = '',
  className = '',
  variant = 'outline',
  size = 'default'
}) => {
  const { t } = useLanguage();
  const { setUserRole } = useAppContext();
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState<{ googleUser: GoogleUser; signInData: GoogleSignInData } | null>(null);

  const handleGoogleSignIn = useCallback(async (response: { credential: string }) => {
    try {
      // Validate admin code for admin signup
      if (userType === 'admin' && (!adminCode || adminCode.trim() === '')) {
        throw new Error('Admin code is required for admin registration via Google Sign-In.');
      }

      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      };

      const signInData: GoogleSignInData = {
        userType,
        locationConsent,
        restaurantInfo,
        adminCode,
        phone,
      };

      const user = await authService.signInWithGoogle(googleUser, signInData);
      setUserRole(user.userType);
      
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error: unknown) {
      console.error('Google Sign-In error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Google Sign-In failed';
      if (errorMessage === '2FA_REQUIRED_GOOGLE') {
        // Store pending data and show 2FA modal
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const googleUser: GoogleUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          given_name: payload.given_name,
          family_name: payload.family_name,
        };
        const signInData: GoogleSignInData = {
          userType,
          locationConsent,
          restaurantInfo,
          adminCode,
          phone,
        };
        setPendingGoogleData({ googleUser, signInData });
        setShowTwoFactorAuth(true);
        return;
      }
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [userType, adminCode, locationConsent, restaurantInfo, phone, setUserRole, onSuccess, onError]);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (isInitialized.current || !window.google?.accounts) return;

      // Check if Google Client ID is configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'your-google-client-id-here') {
        // Show setup instructions instead of Google button
        if (buttonRef.current) {
          buttonRef.current.innerHTML = `
            <div class="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-medium text-orange-800">${t('auth.google_setup_required')}</span>
              </div>
              <p class="text-sm text-orange-700 mb-3">
                ${t('auth.google_setup_description')}
              </p>
              <div class="space-y-2 text-xs text-orange-600">
                <p><strong>1.</strong> ${t('auth.google_setup_step1')} <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="underline">Google Cloud Console</a></p>
                <p><strong>2.</strong> ${t('auth.google_setup_step2')}</p>
                <p><strong>3.</strong> ${t('auth.google_setup_step3')} <code class="bg-orange-100 px-1 rounded">http://localhost:8082</code> and <code class="bg-orange-100 px-1 rounded">https://restaurant-app-xi-ashy.vercel.app</code></p>
                <p><strong>4.</strong> ${t('auth.google_setup_step4')} <code class="bg-orange-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID=your-client-id</code></p>
                <p><strong>5.</strong> ${t('auth.google_setup_step5')}</p>
              </div>
              <button
                onclick="window.open('https://console.cloud.google.com/apis/credentials', '_blank')"
                class="mt-3 w-full bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
              >
                ${t('auth.google_setup_button')}
              </button>
            </div>
          `;
        }
        return;
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
      }

      isInitialized.current = true;
    };

    loadGoogleScript();

    return () => {
      // Cleanup if needed
    };
  }, [handleGoogleSignIn, t]);


  const handle2FAVerification = async (code: string): Promise<boolean> => {
    try {
      const user = await authService.completeGoogleSignInWith2FA(code);
      setUserRole(user.userType);
      setShowTwoFactorAuth(false);
      setPendingGoogleData(null);
      
      if (onSuccess) {
        onSuccess(user);
      }
      return true;
    } catch (error: unknown) {
      console.error('2FA verification error:', error);
      const errorMessage = error instanceof Error ? error.message : '2FA verification failed';
      if (onError) {
        onError(errorMessage);
      }
      return false;
    }
  };

  const handleManualGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      if (onError) {
        onError('Google Sign-In is not available. Please try again.');
      }
    }
  };

  return (
    <>
      <div className={className}>
        <div ref={buttonRef} className="w-full" />
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {t('auth.or')}
          </span>
        </div>
      </div>

      {/* Two-Factor Authentication Modal for Google Sign-In */}
      <TwoFactorAuthModal
        isOpen={showTwoFactorAuth}
        onClose={() => {
          setShowTwoFactorAuth(false);
          setPendingGoogleData(null);
        }}
        onSetupComplete={() => {}}
        onVerify={handle2FAVerification}
        mode="verify"
        userEmail={pendingGoogleData?.googleUser.email || ''}
      />
    </>
  );
};

export default GoogleSignIn;  