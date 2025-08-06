import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './app/navigation/AppNavigator';
import { initializeAppStateListener } from './app/services/supabase';

export default function App() {
  React.useEffect(() => {
    // Initialize app state listener for session management
    initializeAppStateListener();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
