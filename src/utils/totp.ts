// TOTP (Time-based One-Time Password) implementation using speakeasy
import speakeasy from 'speakeasy';

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
    return speakeasy.generateSecret({
      length: 32,
      name: 'Navikko',
      issuer: 'Navikko'
    }).base32!;
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    return speakeasy.totp({
      secret: this.config.secret,
      digits: this.config.digits,
      step: this.config.period,
      algorithm: this.config.algorithm
    });
  }

  // Generate TOTP code for a specific counter
  async generateCodeForCounter(counter: number): Promise<string> {
    return speakeasy.totp({
      secret: this.config.secret,
      digits: this.config.digits,
      step: this.config.period,
      algorithm: this.config.algorithm,
      counter: counter
    });
  }

  // Verify a TOTP code
  async verifyCode(code: string, window: number = 1): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: this.config.secret,
      token: code,
      window: window,
      step: this.config.period,
      algorithm: this.config.algorithm
    });
  }

  // Get QR code URL for mobile apps
  getQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    return speakeasy.otpauthURL({
      secret: this.config.secret,
      label: accountName,
      issuer: issuer,
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period
    });
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
  const totp = new TOTP();
  return totp.generateSecret();
};

export const verifyTOTPCode = async (secret: string, code: string, window: number = 1): Promise<boolean> => {
  const totp = new TOTP({ secret });
  return totp.verifyCode(code, window);
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  const totp = new TOTP({ secret });
  return totp.generateCode();
}; 