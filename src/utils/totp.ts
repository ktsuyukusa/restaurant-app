import { authenticator } from 'otplib';

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

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    return authenticator.generate(this.config.secret);
  }

  // Generate TOTP code for a specific counter
  async generateCodeForCounter(counter: number): Promise<string> {
    return authenticator.generate(this.config.secret, { step: this.config.period, window: 0, counter });
  }

  // Verify a TOTP code
  async verifyCode(code: string, window: number = 1): Promise<boolean> {
    return authenticator.verify({ token: code, secret: this.config.secret, window });
  }

  // Get QR code URL for mobile apps
  getQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    return authenticator.keyuri(accountName, issuer, this.config.secret);
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code
  getRemainingTime(): number {
    return authenticator.timeUsed(this.config.period) * this.config.period;
  }
}

// Utility functions
export const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

export const verifyTOTPCode = async (secret: string, code: string, window: number = 1): Promise<boolean> => {
  return authenticator.verify({ token: code, secret, window });
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  return authenticator.generate(secret);
}; 