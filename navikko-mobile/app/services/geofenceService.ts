import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSupabaseClient } from './supabase';

interface GeofenceConfig {
  maxGeofences: number;
  defaultRadius: number;
  alertDistances: number[];
  cooldownMinutes: number;
  quietHoursStart: number;
  quietHoursEnd: number;
}

interface ProximityAlert {
  restaurantId: string;
  restaurantName: string;
  distance: number;
  timestamp: number;
  alertType: 'gentle' | 'reminder' | 'alarm';
}

interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  cuisine: string;
  address: string;
}

class GeofenceService {
  private config: GeofenceConfig = {
    maxGeofences: 15, // Stay under iOS 18 limit
    defaultRadius: 200, // meters
    alertDistances: [200, 100, 50],
    cooldownMinutes: 5,
    quietHoursStart: 22, // 10 PM
    quietHoursEnd: 8, // 8 AM
  };

  private activeGeofences: Set<string> = new Set();
  private alertHistory: Map<string, ProximityAlert[]> = new Map();
  private isInitialized = false;
  private userLocation: Location.LocationObject | null = null;

  constructor() {
    this.setupNotifications();
  }

  private async setupNotifications() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return false;
      }

      // Request background location permissions
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.log('Background location permission denied');
        return false;
      }

      // Get initial location
      this.userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Start location updates
      await this.startLocationUpdates();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize geofencing service:', error);
      return false;
    }
  }

  private async startLocationUpdates() {
    const LOCATION_TASK_NAME = 'background-location-task';
    
    // Define the background task
    TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
      if (error) {
        console.error('Background location task error:', error);
        return;
      }
      
      if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        const location = locations[0];
        this.userLocation = location;
        this.checkProximityAlerts(location);
      }
    });

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000, // 30 seconds
      distanceInterval: 50, // 50 meters
      foregroundService: {
        notificationTitle: 'Navikko Location',
        notificationBody: 'Tracking location for restaurant alerts',
      },
    });
  }

  async setupGeofences(restaurants: Restaurant[]): Promise<void> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return;
    }

    // Clear existing geofences
    await this.clearGeofences();

    // Sort restaurants by distance and take the closest ones
    const sortedRestaurants = restaurants
      .filter(restaurant => restaurant.latitude && restaurant.longitude)
      .sort((a, b) => {
        const distA = this.calculateDistance(
          this.userLocation!.coords.latitude,
          this.userLocation!.coords.longitude,
          a.latitude,
          a.longitude
        );
        const distB = this.calculateDistance(
          this.userLocation!.coords.latitude,
          this.userLocation!.coords.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      })
      .slice(0, this.config.maxGeofences);

    // Set up geofences for the closest restaurants
    for (const restaurant of sortedRestaurants) {
      await this.addGeofence(restaurant);
    }
  }

  private async addGeofence(restaurant: Restaurant): Promise<void> {
    try {
      const geofenceId = `restaurant-${restaurant.id}`;
      
      await Location.startGeofencingAsync(geofenceId, [{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        radius: this.config.defaultRadius,
        notifyOnEnter: true,
        notifyOnExit: false,
      }]);

      this.activeGeofences.add(restaurant.id);
      console.log(`Geofence added for restaurant: ${restaurant.name}`);
    } catch (error) {
      console.error(`Failed to add geofence for restaurant ${restaurant.id}:`, error);
    }
  }

  private async clearGeofences(): Promise<void> {
    try {
      await Location.stopGeofencingAsync();
      this.activeGeofences.clear();
      console.log('All geofences cleared');
    } catch (error) {
      console.error('Failed to clear geofences:', error);
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async checkProximityAlerts(location: Location.LocationObject): Promise<void> {
    if (!this.userLocation) return;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if we're in quiet hours
    if (currentHour >= this.config.quietHoursStart || currentHour < this.config.quietHoursEnd) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude, cuisine')
        .eq('status', 'open');

      if (error || !restaurants) return;

      for (const restaurant of restaurants) {
        if (!restaurant.latitude || !restaurant.longitude) continue;

        const distance = this.calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          restaurant.latitude,
          restaurant.longitude
        );

        // Check if we should send an alert
        const shouldAlert = this.shouldSendAlert(restaurant.id, distance);
        if (shouldAlert) {
          await this.sendProximityAlert(restaurant, distance);
        }
      }
    } catch (error) {
      console.error('Error checking proximity alerts:', error);
    }
  }

  private shouldSendAlert(restaurantId: string, distance: number): boolean {
    const alerts = this.alertHistory.get(restaurantId) || [];
    const now = Date.now();
    const cooldownMs = this.config.cooldownMinutes * 60 * 1000;

    // Check if we're within alert distance
    const isWithinAlertDistance = this.config.alertDistances.some(
      alertDistance => distance <= alertDistance
    );

    if (!isWithinAlertDistance) return false;

    // Check cooldown
    const lastAlert = alerts[alerts.length - 1];
    if (lastAlert && (now - lastAlert.timestamp) < cooldownMs) {
      return false;
    }

    return true;
  }

  private async sendProximityAlert(restaurant: any, distance: number): Promise<void> {
    const alert: ProximityAlert = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      distance: Math.round(distance),
      timestamp: Date.now(),
      alertType: distance <= 50 ? 'alarm' : distance <= 100 ? 'reminder' : 'gentle',
    };

    // Store alert in history
    const alerts = this.alertHistory.get(restaurant.id) || [];
    alerts.push(alert);
    this.alertHistory.set(restaurant.id, alerts);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Restaurant Nearby! 🍽️',
        body: `${restaurant.name} is ${Math.round(distance)}m away`,
        data: { restaurantId: restaurant.id, distance },
      },
      trigger: null, // Send immediately
    });

    console.log(`Proximity alert sent for ${restaurant.name} at ${distance}m`);
  }

  async updateUserLocation(location: Location.LocationObject): Promise<void> {
    this.userLocation = location;
    await this.checkProximityAlerts(location);
  }

  async stop(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync('background-location-task');
      await this.clearGeofences();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error stopping geofencing service:', error);
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<GeofenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): GeofenceConfig {
    return { ...this.config };
  }

  // Get alert history for a specific restaurant
  getAlertHistory(restaurantId: string): ProximityAlert[] {
    return this.alertHistory.get(restaurantId) || [];
  }

  // Clear alert history for a specific restaurant
  clearAlertHistory(restaurantId: string): void {
    this.alertHistory.delete(restaurantId);
  }
}

// Export singleton instance
export const geofenceService = new GeofenceService();
export default geofenceService; 