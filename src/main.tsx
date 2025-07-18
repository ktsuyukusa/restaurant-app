import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';

// Global error handler to filter out browser extension errors
const originalErrorHandler = window.onerror;
const originalUnhandledRejectionHandler = window.onunhandledrejection;

// Override the URL constructor to catch invalid URLs
const OriginalURL = window.URL;
window.URL = function(url: string | URL, base?: string | URL) {
  try {
    // Log URL construction attempts
    console.log('🔗 URL construction attempt:', { url, base, stack: new Error().stack });
    
    // Check if URL is valid before constructing
    if (typeof url === 'string' && (!url || url.trim() === '')) {
      console.warn('⚠️ Empty URL detected, returning dummy URL object');
      return new OriginalURL('https://localhost');
    }
    
    return new OriginalURL(url, base);
  } catch (error) {
    console.error('❌ URL construction failed:', { url, base, error });
    // Return a dummy URL object to prevent crashes
    return new OriginalURL('https://localhost');
  }
} as any;

// Copy static methods
window.URL.createObjectURL = OriginalURL.createObjectURL;
window.URL.revokeObjectURL = OriginalURL.revokeObjectURL;

window.onerror = function(message, source, lineno, colno, error) {
  // Filter out browser extension errors
  if (source && (
    source.includes('content-script') ||
    source.includes('content.js') ||
    source.includes('www.navikko.com') ||
    source.includes('chrome-extension') ||
    source.includes('moz-extension')
  )) {
    console.warn('Browser extension error filtered out:', { message, source, lineno, colno });
    return true; // Prevent default error handling
  }
  
  // Handle URL construction errors specifically
  if (message && message.includes('Failed to construct \'URL\': Invalid URL')) {
    console.warn('URL construction error caught and handled:', { message, source, lineno, colno });
    return true; // Prevent default error handling
  }
  
  // Log legitimate app errors
  console.error('App error:', { message, source, lineno, colno, error });
  
  // Call original handler if it exists
  if (originalErrorHandler) {
    return originalErrorHandler(message, source, lineno, colno, error);
  }
  return false;
};

window.onunhandledrejection = function(event) {
  // Filter out browser extension promise rejections
  if (event.reason && (
    event.reason.message?.includes('content-script') ||
    event.reason.message?.includes('www.navikko.com') ||
    event.reason.stack?.includes('content.js')
  )) {
    console.warn('Browser extension promise rejection filtered out:', event.reason);
    event.preventDefault(); // Prevent default handling
    return;
  }
  
  // Handle URL-related promise rejections
  if (event.reason && event.reason.message?.includes('Invalid URL')) {
    console.warn('URL-related promise rejection caught and handled:', event.reason);
    event.preventDefault();
    return;
  }
  
  // Log legitimate promise rejections
  console.error('Unhandled promise rejection:', event.reason);
  
  // Call original handler if it exists
  if (originalUnhandledRejectionHandler) {
    originalUnhandledRejectionHandler(event);
  }
};

console.log('🔧 Global error handlers configured with URL override');

// Temporarily remove complex context setup to test basic loading
createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </LanguageProvider>
);