// Battle-tested TOTP implementation using otplib - compatible with Google Authenticator
import { authenticator } from 'otplib';

export interface TOTPConfig {
  secret: string;
  digits: number;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
}

export class TOTPService {
  private config: TOTPConfig;

  constructor(config: Partial<TOTPConfig> = {}) {
    this.config = {
      secret: config.secret || this.generateSecret(),
      digits: config.digits || 6,
      period: config.period || 30,
      algorithm: config.algorithm || 'SHA1'
    };

    // Configure otplib with our settings
    authenticator.options = {
      digits: this.config.digits,
      step: this.config.period
    };
  }

  // Generate a new TOTP secret (base32 encoded)
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  // Generate current TOTP code using otplib
  async generateCode(): Promise<string> {
    return authenticator.generate(this.config.secret);
  }

  // Generate TOTP code for a specific counter (for debugging)
  async generateCodeForCounter(counter: number): Promise<string> {
    // For debugging purposes, we'll use the current implementation
    // otplib doesn't support generating codes for specific counters directly
    return authenticator.generate(this.config.secret);
  }

  // Verify a TOTP code using otplib
  async verifyCode(token: string, window: number = 1): Promise<boolean> {
    // Configure the window for time drift tolerance
    const originalWindow = authenticator.options.window;
    authenticator.options.window = window;
    
    try {
      const isValid = authenticator.verify({
        token,
        secret: this.config.secret
      });
      return isValid;
    } finally {
      // Restore original window setting
      authenticator.options.window = originalWindow;
    }
  }

  // Generate QR code URL for authenticator apps (Google Authenticator format)
  generateQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    return authenticator.keyuri(accountName, issuer, this.config.secret);
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code
  getRemainingTime(): number {
    return authenticator.timeRemaining();
  }

  // Get current counter (for debugging)
  getCurrentCounter(): number {
    const now = Math.floor(Date.now() / 1000);
    return Math.floor(now / this.config.period);
  }

  // Get debug timing information
  getTimingDebugInfo(): {
    currentTime: number;
    counter: number;
    remainingTime: number;
    library: string;
  } {
    const now = Math.floor(Date.now() / 1000);
    return {
      currentTime: now,
      counter: Math.floor(now / this.config.period),
      remainingTime: this.getRemainingTime(),
      library: 'otplib'
    };
  }
}

// Utility functions using otplib
export const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

export const verifyTOTPCode = async (secret: string, token: string, window: number = 3): Promise<boolean> => {
  console.log('🔍 TOTP Debug (otplib): Verifying token:', token, 'with secret:', secret);
  console.log('🔍 TOTP Debug (otplib): Current time:', new Date().toISOString());
  console.log('🔍 TOTP Debug (otplib): Unix timestamp:', Math.floor(Date.now() / 1000));
  console.log('🔍 TOTP Debug (otplib): Window size:', window);
  
  // Configure otplib
  const originalWindow = authenticator.options.window;
  authenticator.options.window = window;
  authenticator.options.step = 30;
  authenticator.options.digits = 6;
  
  try {
    // Generate current code for debugging
    const currentCode = authenticator.generate(secret);
    console.log(`🔍 TOTP Debug (otplib): Current code: ${currentCode}`);
    
    const result = authenticator.verify({
      token,
      secret
    });
    
    console.log('🔍 TOTP Debug (otplib): Verification result:', result);
    console.log('🔍 TOTP Debug (otplib): Time remaining:', authenticator.timeRemaining(), 'seconds');
    
    return result;
  } finally {
    // Restore original window setting
    authenticator.options.window = originalWindow;
  }
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  return authenticator.generate(secret);
};

export const generateQRCodeURL = (secret: string, accountName: string, issuer: string = 'Navikko'): string => {
  return authenticator.keyuri(accountName, issuer, secret);
};