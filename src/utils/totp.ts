// TOTP (Time-based One-Time Password) implementation using jsotp
import { TOTP as jsTOTP } from 'jsotp';

export interface TOTPConfig {
  secret: string;
  digits: number;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
}

export class TOTP {
  private config: TOTPConfig;

  constructor(config: Partial<TOTPConfig> = {}) {
    this.config = {
      secret: config.secret || this.generateSecret(),
      digits: config.digits || 6,
      period: config.period || 30,
      algorithm: config.algorithm || 'SHA1'
    };
  }

  // Generate a secure secret for TOTP
  generateSecret(): string {
    return jsTOTP.genSecret();
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    return jsTOTP.getTOTP(this.config.secret);
  }

  // Generate TOTP code for a specific counter
  async generateCodeForCounter(counter: number): Promise<string> {
    return jsTOTP.getTOTP(this.config.secret);
  }

  // Verify a TOTP code
  async verifyCode(code: string, window: number = 1): Promise<boolean> {
    return jsTOTP.verifyTOTP(this.config.secret, code);
  }

  // Get QR code URL for mobile apps
  getQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    return jsTOTP.getURL(this.config.secret, accountName, issuer);
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code
  getRemainingTime(): number {
    const now = Math.floor(Date.now() / 1000);
    const period = this.config.period;
    return period - (now % period);
  }
}

// Utility functions
export const generateTOTPSecret = (): string => {
  return jsTOTP.genSecret();
};

export const verifyTOTPCode = async (secret: string, code: string, window: number = 1): Promise<boolean> => {
  return jsTOTP.verifyTOTP(secret, code);
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  return jsTOTP.getTOTP(secret);
}; 