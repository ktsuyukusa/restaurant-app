import speakeasy from 'speakeasy';

export interface TOTPConfig {
  secret: string;
  digits: number;
  period: number;
  algorithm: 'sha1' | 'sha256' | 'sha512';
}

export class TOTPService {
  private config: TOTPConfig;

  constructor(config: Partial<TOTPConfig> = {}) {
    this.config = {
      secret: config.secret || this.generateSecret(),
      digits: config.digits || 6,
      period: config.period || 30,
      algorithm: config.algorithm || 'sha1'
    };
  }

  // Generate a new TOTP secret
  generateSecret(): string {
    return speakeasy.generateSecret({
      name: 'Navikko Admin',
      issuer: 'Navikko',
      length: 32
    }).base32!;
  }

  // Generate current TOTP code
  generateCode(): string {
    return speakeasy.totp({
      secret: this.config.secret,
      digits: this.config.digits,
      period: this.config.period,
      algorithm: this.config.algorithm
    });
  }

  // Verify a TOTP code
  verifyCode(token: string, window: number = 1): boolean {
    return speakeasy.totp.verify({
      secret: this.config.secret,
      encoding: 'base32',
      token: token,
      window: window,
      digits: this.config.digits,
      period: this.config.period,
      algorithm: this.config.algorithm
    });
  }

  // Generate QR code URL for authenticator apps
  generateQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
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

  // Get current counter (for debugging)
  getCurrentCounter(): number {
    return Math.floor(Date.now() / 1000 / this.config.period);
  }
}

// Utility functions
export const generateTOTPSecret = (): string => {
  return speakeasy.generateSecret({
    name: 'Navikko Admin',
    issuer: 'Navikko',
    length: 32
  }).base32!;
};

export const verifyTOTPCode = (secret: string, token: string, window: number = 1): boolean => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: window,
    digits: 6,
    period: 30,
    algorithm: 'sha1'
  });
};

export const generateTOTPCode = (secret: string): string => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    digits: 6,
    period: 30,
    algorithm: 'sha1'
  });
};

export const generateQRCodeURL = (secret: string, accountName: string, issuer: string = 'Navikko'): string => {
  return speakeasy.otpauthURL({
    secret: secret,
    encoding: 'base32',
    label: accountName,
    issuer: issuer,
    algorithm: 'sha1',
    digits: 6,
    period: 30
  });
};

 