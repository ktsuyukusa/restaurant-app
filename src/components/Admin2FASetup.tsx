import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOTP } from 'jsotp';
import { getSupabaseClient } from '@/lib/supabase';

interface Admin2FASetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

export const Admin2FASetup: React.FC<Admin2FASetupProps> = ({ onSetupComplete, onCancel }) => {
  const [totp, setTotp] = useState<TOTP | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // Try to get secret from database first, then localStorage, then generate new one
    const loadSecret = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get user ID first
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', 'wasando.tsuyukusa@gmail.com')
          .single();
        
        if (userData) {
          // Get admin access data
          const { data: adminData } = await supabase
            .from('admin_access')
            .select('two_factor_secret, two_factor_enabled')
            .eq('user_id', userData.id)
            .single();
          
          if (adminData?.two_factor_secret) {
            // Use existing secret from database
            console.log('2FA Setup: Using existing secret from database:', adminData.two_factor_secret);
            
            const totp = new TOTP({ secret: adminData.two_factor_secret });
            const qrUrl = `otpauth://totp/Navikko%20Admin:wasando.tsuyukusa@gmail.com?secret=${secret}&issuer=Navikko%20Admin`;
            
            setTotp(totp);
            setSecret(adminData.two_factor_secret);
            setQrCodeUrl(qrUrl);
            
            localStorage.setItem('admin_totp_secret', adminData.two_factor_secret);
            
            console.log('2FA Setup: Set UI secret to:', adminData.two_factor_secret);
            return;
          }
        }
      } catch (error) {
        console.warn('Could not load secret from database:', error);
      }
      
      // Fallback to localStorage
      let existingSecret = localStorage.getItem('admin_totp_secret');
      
      if (!existingSecret) {
        // Generate new secret only if none exists anywhere
        existingSecret = new TOTP().generateSecret();
        localStorage.setItem('admin_totp_secret', existingSecret);
      }
      
      // Create TOTP instance with the exact secret
      const totp = new TOTP({ secret: existingSecret });
              const qrUrl = `otpauth://totp/Navikko%20Admin:wasando.tsuyukusa@gmail.com?secret=${secret}&issuer=Navikko%20Admin`;
      
      setTotp(totp);
      setSecret(existingSecret);
      setQrCodeUrl(qrUrl);
      
      console.log('2FA Setup: Using secret:', existingSecret);
      console.log('2FA Setup: Set UI secret to:', existingSecret);
    };
    
    loadSecret();
  }, []);

  const handleVerifyCode = async () => {
    if (!totp || !verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      console.log('2FA Verification: Checking code:', verificationCode, 'with secret:', secret);
      console.log('2FA Verification: TOTP instance secret:', totp.getSecret());
      console.log('2FA Verification: UI secret state:', secret);
      const isValid = totp.verify(verificationCode);
      
      if (isValid) {
        // Update the database with the new secret using Supabase
        try {
          const supabase = getSupabaseClient();
          
          const { error } = await supabase
            .from('admin_access')
            .update({
              two_factor_secret: secret,
              two_factor_enabled: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', (
              await supabase
                .from('users')
                .select('id')
                .eq('email', 'wasando.tsuyukusa@gmail.com')
                .single()
            ).data.id);
          
          if (error) {
            console.error('Failed to update database with 2FA secret:', error);
            setError('Database update failed. Please try again.');
            return;
          } else {
            console.log('✅ Database updated successfully with new 2FA secret:', secret);
          }
        } catch (dbError) {
          console.warn('Database update failed, but 2FA setup is still valid:', dbError);
        }
        
        setSuccess('2FA setup successful! You can now log in with your authenticator app.');
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSuccess('Secret copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const generateNewSecret = async () => {
    // Clear old secret and generate new one
    localStorage.removeItem('admin_totp_secret');
    
            const newSecret = TOTP.generateSecret();
        const newTotp = new TOTP(newSecret);
    const qrUrl = `otpauth://totp/Navikko%20Admin:wasando.tsuyukusa@gmail.com?secret=${newSecret}&issuer=Navikko%20Admin`;
    
    setTotp(newTotp);
    setSecret(newSecret);
    setQrCodeUrl(qrUrl);
    
    localStorage.setItem('admin_totp_secret', newSecret);
    setVerificationCode('');
    setError('');
    setSuccess('New secret generated! Please scan the new QR code.');
    
    // Update the database with the new secret
    try {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'wasando.tsuyukusa@gmail.com')
        .single();
      if (userData) {
        await supabase
          .from('admin_access')
          .update({
            two_factor_secret: newSecret,
            two_factor_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.id);
      }
    } catch (error) {
      console.warn('Could not update database with new secret:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Set Up Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) to set up 2FA for enhanced security.
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                alt="2FA QR Code"
                className="w-48 h-48"
              />
            </div>
            
                          <div className="text-center">
                <Label className="text-sm font-medium">Manual Entry Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={secret} 
                    readOnly 
                    className="font-mono text-sm"
                    style={{ minWidth: '300px' }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Secret length: {secret?.length || 0} characters
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copySecret}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this secret if you can't scan the QR code
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateNewSecret}
                  className="mt-2"
                >
                  Generate New Secret
                </Button>
              </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-lg font-mono"
          />
          <p className="text-xs text-gray-500">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleVerifyCode} 
            disabled={isVerifying || !verificationCode}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Complete Setup'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isVerifying}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 