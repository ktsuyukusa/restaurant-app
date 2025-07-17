import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';

// Temporarily remove complex context setup to test basic loading
createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </LanguageProvider>
);