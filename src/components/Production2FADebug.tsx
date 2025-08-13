import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TOTPService, generateTOTPCode } from '@/utils/totpService';

interface Production2FADebugProps {
  isVisible?: boolean;
}

export const Production2FADebug: React.FC<Production2FADebugProps> = ({ isVisible = false }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [testCode, setTestCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);
  const [isTesting, setIsTesting] = useState(false);

  // Enter the exact Base32 secret stored in your admin record to test
  const [databaseSecret, setDatabaseSecret] = useState('');

  const addDebugInfo = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runDebugChecks = async () => {
    setDebugInfo([]);
    addDebugInfo('=== Production 2FA Debug Started (v2.1) ===', 'info');
    if (!databaseSecret) {
      addDebugInfo('❌ No database secret provided. Paste your Base32 secret to test.', 'error');
      return;
    }
    addDebugInfo(`🔑 Using database secret: [hidden]`, 'info');

    // Check 1: TOTP Implementation
    try {
      const currentCode = await generateTOTPCode(databaseSecret);
      setGeneratedCode(currentCode);
      addDebugInfo(`✅ TOTP implementation working. Current code: ${currentCode}`, 'success');
    } catch (error) {
      addDebugInfo(`❌ TOTP implementation failed: ${error}`, 'error');
    }

    // Check 2: Crypto API availability
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      addDebugInfo('✅ Web Crypto API available', 'success');
    } else {
      addDebugInfo('❌ Web Crypto API not available', 'error');
    }

    // Check 3: Base32 decoding
    try {
      // Test base32 decoding by generating a code
      generateTOTPCode(databaseSecret);
      addDebugInfo('✅ Base32 decoding working correctly', 'success');
    } catch (error) {
      addDebugInfo(`❌ Base32 decoding failed: ${error}`, 'error');
    }

    // Check 4: Time synchronization
    const now = Date.now();
    addDebugInfo(`📅 Current timestamp: ${now}`, 'info');
    addDebugInfo(`🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`, 'info');

    // Check 5: Browser compatibility
    const userAgent = navigator.userAgent;
    addDebugInfo(`🌐 Browser: ${userAgent}`, 'info');

    // Check 6: localStorage availability
    try {
      const testKey = '2fa_debug_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      addDebugInfo('✅ localStorage available', 'success');
    } catch (error) {
      addDebugInfo('❌ localStorage not available', 'error');
    }

    // Check 7: Environment variables
    const envVars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
    };

    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        addDebugInfo(`✅ ${key}: Configured`, 'success');
      } else {
        addDebugInfo(`❌ ${key}: Missing`, 'error');
      }
    });

    addDebugInfo('=== Debug Checks Complete ===', 'info');
  };

  const testCodeValidation = async () => {
    if (!testCode || testCode.length !== 6) {
      addDebugInfo('❌ Please enter a 6-digit code', 'error');
      return;
    }

    setIsTesting(true);
    addDebugInfo(`🧪 Testing code: ${testCode}`, 'info');
    if (!databaseSecret) {
      addDebugInfo('❌ No database secret provided. Paste your Base32 secret to test.', 'error');
      return;
    }

    try {
      const totpService = new TOTPService({ secret: databaseSecret });
      const isValid = await totpService.verifyCode(testCode);
      
      if (isValid) {
        addDebugInfo(`✅ Code ${testCode} is VALID!`, 'success');
      } else {
        addDebugInfo(`❌ Code ${testCode} is INVALID`, 'error');
        
        // Generate expected codes for comparison
        const currentCode = await totpService.generateCode();
        const remaining = totpService.getRemainingTime();
        addDebugInfo(`📱 Expected current code: ${currentCode} (expires in ${remaining}s)`, 'info');
      }
    } catch (error) {
      addDebugInfo(`❌ Code validation error: ${error}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const generateCurrentCode = async () => {
    try {
      if (!databaseSecret) {
        addDebugInfo('❌ No database secret provided. Paste your Base32 secret to generate a code.', 'error');
        return;
      }
      const totpService = new TOTPService({ secret: databaseSecret });
      const code = await totpService.generateCode();
      const remaining = totpService.getRemainingTime();
      
      setGeneratedCode(code);
      setTestCode(code);
      addDebugInfo(`📱 Generated current code: ${code} (expires in ${remaining}s)`, 'success');
    } catch (error) {
      addDebugInfo(`❌ Failed to generate code: ${error}`, 'error');
    }
  };

  // Update remaining time
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
         const totpService = new TOTPService({ secret: databaseSecret });
        setRemainingTime(totpService.getRemainingTime());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Production 2FA Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This debug tool tests the 2FA implementation in the actual production environment. 
            Use this to verify that your authenticator app codes match what the system expects.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={runDebugChecks} variant="outline">
            Run Debug Checks
          </Button>
          <Button onClick={generateCurrentCode} variant="outline">
            Generate Current Code
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Admin TOTP Secret (Base32)</h3>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Paste the Base32 secret from your admin record"
                value={databaseSecret}
                onChange={(e) => setDatabaseSecret(e.target.value.trim().toUpperCase())}
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Test Your Authenticator Code</h3>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code from your app"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
              <Button 
                onClick={testCodeValidation}
                disabled={isTesting || testCode.length !== 6}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Test Code'}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Expected Code</h3>
            <div className="space-y-2">
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-mono font-bold">{generatedCode || '------'}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Expires in: <Badge variant="outline">{remainingTime}s</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Compare this with your authenticator app code
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">Click "Run Debug Checks" to start debugging</p>
            ) : (
              <div className="space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-sm font-mono">
                    {info}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Database Secret:</strong> {databaseSecret ? '[hidden]' : '(not set)'}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Deployment URL:</strong> {window.location.origin}</p>
          <p><strong>Debug Version:</strong> 2.1</p>
        </div>
      </CardContent>
    </Card>
  );
}; 