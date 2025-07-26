import { TOTP as JSTOTP } from 'jsotp';

export interface TOTPConfig {
  secret: string;
  digits: number;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
}

export class TOTP {
  private config: TOTPConfig;
  private jsotp: JSTOTP;

  constructor(config: Partial<TOTPConfig> = {}) {
    this.config = {
      secret: config.secret || this.generateSecret(),
      digits: config.digits || 6,
      period: config.period || 30,
      algorithm: config.algorithm || 'SHA1'
    };
    
    this.jsotp = new JSTOTP(this.config.secret, {
      digits: this.config.digits,
      period: this.config.period,
      algorithm: this.config.algorithm
    });
  }

  generateSecret(): string {
    return JSTOTP.generateSecret();
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    return this.jsotp.getToken();
  }

  // Generate TOTP code for a specific counter
  async generateCodeForCounter(counter: number): Promise<string> {
    return this.jsotp.getToken(counter);
  }

  // Verify a TOTP code
  async verifyCode(code: string, window: number = 1): Promise<boolean> {
    return this.jsotp.verifyToken(code, window);
  }

  // Get QR code URL for mobile apps
  getQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    const secret = this.config.secret;
    const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${this.config.algorithm}&digits=${this.config.digits}&period=${this.config.period}`;
    return url;
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code
  getRemainingTime(): number {
    return this.jsotp.getRemainingTime();
  }
}

// Utility functions
export const generateTOTPSecret = (): string => {
  return JSTOTP.generateSecret();
};

export const verifyTOTPCode = async (secret: string, code: string, window: number = 1): Promise<boolean> => {
  const totp = new JSTOTP(secret);
  return totp.verifyToken(code, window);
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  const totp = new JSTOTP(secret);
  return totp.getToken();
}; 