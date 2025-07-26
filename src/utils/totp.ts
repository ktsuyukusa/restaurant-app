// RFC 6238 TOTP implementation - exact same as Google Authenticator and GitHub
// No external dependencies, pure browser JavaScript

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Convert base32 string to Uint8Array (RFC 4648)
  private base32ToBytes(base32: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (let i = 0; i < base32.length; i++) {
      const char = base32[i].toUpperCase();
      const index = alphabet.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 0xFF);
        bits -= 8;
      }
    }

    return new Uint8Array(bytes);
  }

  // Generate current TOTP code
  async generateCode(): Promise<string> {
    const counter = Math.floor(Date.now() / 1000 / this.config.period);
    return this.generateCodeForCounter(counter);
  }

  // Generate TOTP code for a specific counter (RFC 6238)
  async generateCodeForCounter(counter: number): Promise<string> {
    // Convert counter to 8-byte buffer (big-endian)
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(counter), false); // false = big-endian

    // Convert secret to bytes
    const secretBytes = this.base32ToBytes(this.config.secret);

    // Generate HMAC-SHA1 (Google Authenticator uses SHA1)
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, buffer);
    const hash = new Uint8Array(signature);

    // Generate 6-digit code using RFC 6238 standard
    const offset = hash[hash.length - 1] & 0xf;
    
    // Ensure we don't go out of bounds
    if (offset + 3 >= hash.length) {
      throw new Error('Invalid hash length for TOTP generation');
    }
    
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

  // Get QR code URL for mobile apps (Google Authenticator format)
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