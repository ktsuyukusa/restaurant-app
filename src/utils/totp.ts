// TOTP (Time-based One-Time Password) implementation for mobile 2FA
// Similar to GitHub's 2FA system

// Browser-compatible crypto implementation
const crypto = window.crypto;

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    const counter = Math.floor(Date.now() / 1000 / this.config.period);
    return this.generateCodeForCounter(counter);
  }

  // Generate TOTP code for a specific counter
  async generateCodeForCounter(counter: number): Promise<string> {
    // Convert counter to 8-byte buffer
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(counter), false); // false = big-endian

    // Convert secret to Uint8Array
    const secretBytes = new TextEncoder().encode(this.config.secret);

    // Generate HMAC-SHA1
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, buffer);
    const hash = new Uint8Array(signature);

    // Generate 6-digit code
    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);

    const modulo = Math.pow(10, this.config.digits);
    return (code % modulo).toString().padStart(this.config.digits, '0');
  }

  // Verify a TOTP code
  async verifyCode(code: string, window: number = 1): Promise<boolean> {
    const counter = Math.floor(Date.now() / 1000 / this.config.period);
    
    for (let i = -window; i <= window; i++) {
      const expectedCode = await this.generateCodeForCounter(counter + i);
      if (code === expectedCode) {
        return true;
      }
    }
    
    return false;
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