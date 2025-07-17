// Security Headers Configuration
// This file provides security headers for the application

export interface SecurityHeaders {
  [key: string]: string;
}

// Content Security Policy (CSP) configuration
const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'", // Required for some React features
    'https://accounts.google.com', // Google Sign-In
    'https://www.googletagmanager.com', // Google Analytics (if used)
    'https://maps.googleapis.com', // Google Maps
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    'https://fonts.googleapis.com', // Google Fonts
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com', // Google Fonts
  ],
  'img-src': [
    "'self'",
    'data:', // For data URLs
    'https:', // For external images
    'blob:', // For file uploads
  ],
  'connect-src': [
    "'self'",
    'https://api.supabase.co', // Supabase API
    'https://komoju.com', // KOMOJU API
    'https://api.pay.jp', // PAY.JP API
    'https://maps.googleapis.com', // Google Maps API
    'https://nominatim.openstreetmap.org', // OpenStreetMap API
  ],
  'frame-src': [
    "'self'",
    'https://komoju.com', // KOMOJU payment iframe
    'https://pay.jp', // PAY.JP payment iframe
  ],
  'object-src': ["'none'"], // Prevent object/embed tags
  'base-uri': ["'self'"], // Restrict base URI
  'form-action': ["'self'"], // Restrict form submissions
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
};

// Generate CSP header string
const generateCSP = (): string => {
  return Object.entries(CSP_POLICY)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const getSecurityHeaders = (): SecurityHeaders => {
  return {
    // Content Security Policy
    'Content-Security-Policy': generateCSP(),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),
    
    // Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Cache Control for sensitive pages
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
};

// Headers for specific routes
export const getRouteSpecificHeaders = (route: string): SecurityHeaders => {
  const baseHeaders = getSecurityHeaders();
  
  // Admin routes need additional security
  if (route.includes('/admin') || route.includes('/dashboard')) {
    return {
      ...baseHeaders,
      // Additional headers for admin areas
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }
  
  // Payment routes need specific headers
  if (route.includes('/payment') || route.includes('/checkout')) {
    return {
      ...baseHeaders,
      // Allow frames for payment providers
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': generateCSP().replace(
        "'frame-ancestors': [\"'none'\"]",
        "'frame-ancestors': [\"'self'\"]"
      ),
    };
  }
  
  return baseHeaders;
};

// Security middleware for development
export const applySecurityHeaders = (): void => {
  if (typeof window !== 'undefined') {
    // Client-side security measures
    console.log('Security headers applied');
    
    // Disable right-click context menu (optional)
    // document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable text selection (optional)
    // document.addEventListener('selectstart', (e) => e.preventDefault());
    
    // Prevent drag and drop of images (optional)
    // document.addEventListener('dragstart', (e) => e.preventDefault());
  }
};

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

// Rate limiting simulation (for client-side)
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  
  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

// Export rate limiter instance
export const rateLimiter = new RateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 minutes 