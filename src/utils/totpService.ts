// Battle-tested TOTP implementation using speakeasy - industry standard backend solution
import * as speakeasy from 'speakeasy';

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
  }

  // Generate a new TOTP secret (base32 encoded) using speakeasy
  generateSecret(): string {
    const secret = speakeasy.generateSecret({
      name: 'Navikko Admin',
      issuer: 'Navikko'
    });
    return secret.base32;
  }

  // Generate current TOTP code using speakeasy
  async generateCode(): Promise<string> {
    return speakeasy.totp({
      secret: this.config.secret,
      encoding: 'base32',
      digits: this.config.digits,
      step: this.config.period,
      algorithm: this.config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512'
    });
  }

  // Generate TOTP code for a specific counter (for debugging)
  async generateCodeForCounter(counter: number): Promise<string> {
    const time = counter * this.config.period;
    return speakeasy.totp({
      secret: this.config.secret,
      encoding: 'base32',
      digits: this.config.digits,
      step: this.config.period,
      algorithm: this.config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512',
      time: time
    });
  }

  // Verify a TOTP code using speakeasy with proper time window
  async verifyCode(token: string, window: number = 1): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: this.config.secret,
      encoding: 'base32',
      token: token,
      digits: this.config.digits,
      step: this.config.period,
      algorithm: this.config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512',
      window: window
    });
  }

  // Generate QR code URL for authenticator apps (Google Authenticator format)
  generateQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    return speakeasy.otpauthURL({
      secret: this.config.secret,
      label: `${issuer}:${accountName}`,
      issuer: issuer,
      type: 'totp',
      digits: this.config.digits,
      period: this.config.period,
      algorithm: this.config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512'
    });
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code
  getRemainingTime(): number {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(now / this.config.period);
    const nextStep = (timeStep + 1) * this.config.period;
    return nextStep - now;
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
      library: 'speakeasy (battle-tested)'
    };
  }
}

// Utility functions using speakeasy
export const generateTOTPSecret = (): string => {
  const secret = speakeasy.generateSecret({
    name: 'Navikko Admin',
    issuer: 'Navikko'
  });
  return secret.base32;
};

export const verifyTOTPCode = async (secret: string, token: string, window: number = 3): Promise<boolean> => {
  console.log('🔍 TOTP Debug (speakeasy): Verifying token:', token, 'with secret:', secret);
  console.log('🔍 TOTP Debug (speakeasy): Current time:', new Date().toISOString());
  console.log('🔍 TOTP Debug (speakeasy): Unix timestamp:', Math.floor(Date.now() / 1000));
  console.log('🔍 TOTP Debug (speakeasy): Window size:', window);
  
  try {
    // Generate current code for debugging
    const currentCode = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 6,
      step: 30,
      algorithm: 'sha1'
    });
    console.log(`🔍 TOTP Debug (speakeasy): Current code: ${currentCode}`);
    
    const result = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      digits: 6,
      step: 30,
      algorithm: 'sha1',
      window: window
    });
    
    console.log('🔍 TOTP Debug (speakeasy): Verification result:', result);
    
    // Calculate remaining time
    const now = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(now / 30);
    const nextStep = (timeStep + 1) * 30;
    const remainingTime = nextStep - now;
    console.log('🔍 TOTP Debug (speakeasy): Time remaining:', remainingTime, 'seconds');
    
    return result;
  } catch (error) {
    console.error('🔍 TOTP Debug (speakeasy): Error during verification:', error);
    return false;
  }
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    digits: 6,
    step: 30,
    algorithm: 'sha1'
  });
};

export const generateQRCodeURL = (secret: string, accountName: string, issuer: string = 'Navikko'): string => {
  return speakeasy.otpauthURL({
    secret: secret,
    label: `${issuer}:${accountName}`,
    issuer: issuer,
    type: 'totp',
    digits: 6,
    period: 30,
    algorithm: 'sha1'
  });
};