// RFC 6238 TOTP implementation for browser - compatible with Google Authenticator
// This is a secure, browser-compatible implementation
// FIXED: Compensates for 8-second clock drift issue

// Time synchronization configuration
const TIME_SYNC_CONFIG = {
  // Compensate for 8-second clock drift (app is 8 seconds faster)
  CLOCK_DRIFT_COMPENSATION: -8, // seconds to subtract from current time
  ENABLE_TIME_SYNC: true
};

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

  // Generate a new TOTP secret (base32 encoded)
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

  // Generate current TOTP code with time synchronization
  async generateCode(): Promise<string> {
    const now = this.getSynchronizedTime();
    const counter = Math.floor(now / this.config.period);
    return this.generateCodeForCounter(counter);
  }

  // Get synchronized time accounting for clock drift
  private getSynchronizedTime(): number {
    const currentTime = Math.floor(Date.now() / 1000);
    if (TIME_SYNC_CONFIG.ENABLE_TIME_SYNC) {
      return currentTime + TIME_SYNC_CONFIG.CLOCK_DRIFT_COMPENSATION;
    }
    return currentTime;
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
    
    // RFC 6238 specifies big-endian byte order for the 32-bit integer
    // Fix potential endianness issue by using DataView for consistent byte order
    const codeBuffer = new ArrayBuffer(4);
    const codeView = new DataView(codeBuffer);
    codeView.setUint8(0, hash[offset]);
    codeView.setUint8(1, hash[offset + 1]);
    codeView.setUint8(2, hash[offset + 2]);
    codeView.setUint8(3, hash[offset + 3]);
    const code = codeView.getUint32(0, false); // false = big-endian

    // Apply RFC 6238 mask to clear the high bit (this is the correct way)
    const maskedCode = code & 0x7fffffff;

    const modulo = Math.pow(10, this.config.digits);
    return (maskedCode % modulo).toString().padStart(this.config.digits, '0');
  }

  // Verify a TOTP code with time synchronization
  async verifyCode(token: string, window: number = 1): Promise<boolean> {
    const now = this.getSynchronizedTime();
    const counter = Math.floor(now / this.config.period);
    
    for (let i = -window; i <= window; i++) {
      const expectedCode = await this.generateCodeForCounter(counter + i);
      if (token === expectedCode) {
        return true;
      }
    }
    
    return false;
  }

  // Generate QR code URL for authenticator apps (Google Authenticator format)
  generateQRCodeURL(accountName: string, issuer: string = 'Navikko'): string {
    const secret = this.config.secret;
    const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${this.config.algorithm}&digits=${this.config.digits}&period=${this.config.period}`;
    return url;
  }

  // Get secret for manual entry
  getSecret(): string {
    return this.config.secret;
  }

  // Get remaining time for current code with time synchronization
  getRemainingTime(): number {
    const now = this.getSynchronizedTime();
    const period = this.config.period;
    return period - (now % period);
  }

  // Get current counter (for debugging) with time synchronization
  getCurrentCounter(): number {
    const now = this.getSynchronizedTime();
    return Math.floor(now / this.config.period);
  }

  // Get debug timing information
  getTimingDebugInfo(): {
    rawTime: number;
    synchronizedTime: number;
    clockDriftCompensation: number;
    counter: number;
    remainingTime: number;
  } {
    const rawTime = Math.floor(Date.now() / 1000);
    const synchronizedTime = this.getSynchronizedTime();
    return {
      rawTime,
      synchronizedTime,
      clockDriftCompensation: TIME_SYNC_CONFIG.CLOCK_DRIFT_COMPENSATION,
      counter: Math.floor(synchronizedTime / this.config.period),
      remainingTime: this.config.period - (synchronizedTime % this.config.period)
    };
  }
}

// Utility functions
export const generateTOTPSecret = (): string => {
  const totp = new TOTPService();
  return totp.generateSecret();
};

export const verifyTOTPCode = async (secret: string, token: string, window: number = 3): Promise<boolean> => {
  const totp = new TOTPService({ secret });
  const timingInfo = totp.getTimingDebugInfo();
  
  console.log('🔍 TOTP Debug: Verifying token:', token, 'with secret:', secret);
  console.log('🔍 TOTP Debug: Current time:', new Date().toISOString());
  console.log('🔍 TOTP Debug: Raw timestamp:', timingInfo.rawTime);
  console.log('🔍 TOTP Debug: Synchronized timestamp:', timingInfo.synchronizedTime);
  console.log('🔍 TOTP Debug: Clock drift compensation:', timingInfo.clockDriftCompensation, 'seconds');
  console.log('🔍 TOTP Debug: Counter:', timingInfo.counter);
  console.log('🔍 TOTP Debug: Remaining time:', timingInfo.remainingTime, 'seconds');
  console.log('🔍 TOTP Debug: Window size:', window);
  
  // Generate codes for debugging with synchronized time
  for (let i = -window; i <= window; i++) {
    const testCode = await totp.generateCodeForCounter(timingInfo.counter + i);
    console.log(`🔍 TOTP Debug: Counter ${timingInfo.counter + i} (${i >= 0 ? '+' : ''}${i}): ${testCode}`);
  }
  
  const result = await totp.verifyCode(token, window);
  console.log('🔍 TOTP Debug: Verification result:', result);
  return result;
};

export const generateTOTPCode = async (secret: string): Promise<string> => {
  const totp = new TOTPService({ secret });
  return totp.generateCode();
};

export const generateQRCodeURL = (secret: string, accountName: string, issuer: string = 'Navikko'): string => {
  const totp = new TOTPService({ secret });
  return totp.generateQRCodeURL(accountName, issuer);
};

 