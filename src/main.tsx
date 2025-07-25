import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';

// Simple error handler to filter out browser extension errors
window.onerror = function(message, source, lineno, colno, error) {
  // Filter out browser extension errors
  if (source && (
    source.includes('content-script') ||
    source.includes('content.js') ||
    source.includes('chrome-extension') ||
    source.includes('moz-extension')
  )) {
    console.warn('Browser extension error filtered out:', { message, source, lineno, colno });
    return true; // Prevent default error handling
  }
  
  // Log legitimate app errors
  console.error('App error:', { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = function(event) {
  // Filter out browser extension promise rejections
  if (event.reason && (
    event.reason.message?.includes('content-script') ||
    event.reason.stack?.includes('content.js')
  )) {
    console.warn('Browser extension promise rejection filtered out:', event.reason);
    event.preventDefault(); // Prevent default handling
    return;
  }
  
  // Log legitimate promise rejections
  console.error('Unhandled promise rejection:', event.reason);
};

console.log('🔧 App starting...');

createRoot(document.getElementById("root")!).render(
      <App />
);