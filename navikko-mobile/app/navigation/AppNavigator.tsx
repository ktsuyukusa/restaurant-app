import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Services
import { authService, initializeAuthListener } from '../services/supabase';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens to avoid problematic imports
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderText}>Coming soon...</Text>
  </View>
);

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'MapList') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="MapList" 
        component={() => <PlaceholderScreen title="Restaurants" />}
        options={{ title: 'Restaurants' }}
      />
      <Tab.Screen 
        name="Activity" 
        component={() => <PlaceholderScreen title="Activity" />}
        options={{ title: 'Activity' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={() => <PlaceholderScreen title="Settings" />}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={() => <PlaceholderScreen title="Authentication" />} />
    </Stack.Navigator>
  );
};

// Main Stack Navigator
const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RestaurantDetails" 
        component={() => <PlaceholderScreen title="Restaurant Details" />}
        options={{ title: 'Restaurant Details' }}
      />
      <Stack.Screen 
        name="Menu" 
        component={() => <PlaceholderScreen title="Menu" />}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen 
        name="CartCheckout" 
        component={() => <PlaceholderScreen title="Checkout" />}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="Reservations" 
        component={() => <PlaceholderScreen title="Reservations" />}
        options={{ title: 'Reservations' }}
      />
    </Stack.Navigator>
  );
};

// Loading Screen
const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#667eea" />
    <Text style={styles.loadingText}>
      Loading...
    </Text>
  </View>
);

// Error Screen
const ErrorScreen = ({ error }: { error: string }) => (
  <View style={styles.container}>
    <Text style={styles.errorTitle}>Navigation Error</Text>
    <Text style={styles.errorText}>{error}</Text>
  </View>
);

// Main App Navigator
export const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AppNavigator: Starting auth initialization...');
        
        initializeAuthListener();
        
        const { session } = await authService.getCurrentSession();
        console.log('AppNavigator: Auth session:', session ? 'Found' : 'None');
        
        setIsAuthenticated(!!session);
        setIsLoading(false);
      } catch (error) {
        console.error('AppNavigator: Error checking auth state:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStackNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 