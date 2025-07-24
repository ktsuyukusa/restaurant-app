import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { generateTOTPSecret, verifyTOTPCode, TOTP } from '@/utils/totp';
import { useLanguage } from '@/contexts/LanguageContext';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (secret: string) => void;
  onVerify: (code: string) => Promise<boolean>;
  mode: 'setup' | 'verify';
  userEmail?: string;
}

export default function TwoFactorAuthModal({
  isOpen,
  onClose,
  onSetupComplete,
  onVerify,
  mode,
  userEmail
}: TwoFactorAuthModalProps) {
  const { t } = useLanguage();
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);

  // Generate new secret when setup mode opens
  useEffect(() => {
    if (mode === 'setup' && isOpen && !secret) {
      const newSecret = generateTOTPSecret();
      setSecret(newSecret);
      
      const totp = new TOTP({ secret: newSecret });
      const qrUrl = totp.getQRCodeURL(userEmail || 'admin@navikko.com', 'Navikko Admin');
      setQrCodeUrl(qrUrl);
    }
  }, [mode, isOpen, secret, userEmail]);

  // Update remaining time for current code
  useEffect(() => {
    if (mode === 'verify' && isOpen) {
      const interval = setInterval(() => {
        const totp = new TOTP({ secret });
        setRemainingTime(totp.getRemainingTime());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode, isOpen, secret]);

  const handleSetupVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = verifyTOTPCode(secret, verificationCode);
      
      if (isValid) {
        setSuccess('2FA setup successful!');
        setTimeout(() => {
          onSetupComplete(secret);
          onClose();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await onVerify(verificationCode);
      
      if (isValid) {
        setSuccess('Verification successful!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setSuccess('Secret copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const generateNewSecret = () => {
    const newSecret = generateTOTPSecret();
    setSecret(newSecret);
    
    const totp = new TOTP({ secret: newSecret });
    const qrUrl = totp.getQRCodeURL(userEmail || 'admin@navikko.com', 'Navikko Admin');
    setQrCodeUrl(qrUrl);
    
    setVerificationCode('');
    setError('');
    setSuccess('New secret generated!');
  };

  if (mode === 'setup') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🔐 {t('2fa.setup_title') || 'Set Up Two-Factor Authentication'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {t('2fa.setup_description') || 'Scan the QR code with your authenticator app to set up 2FA for enhanced security.'}
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">QR Code</CardTitle>
                    <CardDescription>
                      Scan this QR code with your authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {qrCodeUrl && (
                      <div className="p-4 bg-white rounded-lg">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                          alt="2FA QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Manual Entry</CardTitle>
                    <CardDescription>
                      Enter this secret manually in your authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={secret} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={copySecretToClipboard}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Account</Label>
                      <Input 
                        value={userEmail || 'admin@navikko.com'} 
                        readOnly 
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input 
                        value="Navikko Admin" 
                        readOnly 
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  {t('2fa.verification_code') || 'Verification Code'}
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">
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
                  onClick={generateNewSecret}
                  variant="outline"
                  className="flex-1"
                >
                  Generate New Secret
                </Button>
                <Button 
                  onClick={handleSetupVerification}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Complete Setup'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Verify mode
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔐 {t('2fa.verify_title', { defaultValue: 'Two-Factor Authentication' })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              {t('2fa.verify_description', { defaultValue: 'Enter the 6-digit code from your authenticator app to continue.' })}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="verify-code">
              {t('2fa.verification_code', { defaultValue: 'Verification Code' })}
            </Label>
            <Input
              id="verify-code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg font-mono"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Code expires in:</span>
              <Badge variant="outline">{remainingTime}s</Badge>
            </div>
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

          <Button 
            onClick={handleVerifyCode}
            disabled={isVerifying || verificationCode.length !== 6}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 