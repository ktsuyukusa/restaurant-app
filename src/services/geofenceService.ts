import { getSupabaseClient } from '@/lib/supabase';

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
  private userLocation: { lat: number; lng: number } | null = null;
  private isInQuietHours = false;
  private cooldownUntil: number = 0;

  constructor() {
    this.checkQuietHours();
    setInterval(() => this.checkQuietHours(), 60000); // Check every minute
  }

  // Initialize geofencing with user consent
  async initialize(userConsent: boolean): Promise<boolean> {
    if (!userConsent) {
      console.log('User declined location consent');
      return false;
    }

    try {
      // Request location permission
      const position = await this.getCurrentPosition();
      if (!position) return false;

      this.userLocation = position;
      
      // Register geofences for nearby restaurants
      await this.registerNearbyGeofences();
      
      // Start background monitoring
      this.startBackgroundMonitoring();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize geofencing:', error);
      return false;
    }
  }

  // Get current position with high accuracy
  private async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Register geofences for nearby restaurants
  private async registerNearbyGeofences(): Promise<void> {
    if (!this.userLocation) return;

    try {
      const supabase = getSupabaseClient();
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name_ja, name_en, latitude, longitude, is_active')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching restaurants:', error);
        return;
      }

      // Calculate distances and sort by proximity
      const nearbyRestaurants = restaurants
        .filter(restaurant => restaurant.latitude && restaurant.longitude)
        .map(restaurant => ({
          ...restaurant,
          distance: this.calculateDistance(
            this.userLocation!.lat,
            this.userLocation!.lng,
            restaurant.latitude,
            restaurant.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, this.config.maxGeofences);

      // Register geofences for the nearest restaurants
      for (const restaurant of nearbyRestaurants) {
        await this.registerGeofence(restaurant);
      }
    } catch (error) {
      console.error('Error registering geofences:', error);
    }
  }

  // Register a single geofence
  private async registerGeofence(restaurant: any): Promise<void> {
    if (this.activeGeofences.has(restaurant.id)) return;

    try {
      // Use browser geolocation API for geofencing simulation
      // In a real mobile app, this would use native geofencing APIs
      const geofenceId = `geofence_${restaurant.id}`;
      this.activeGeofences.add(restaurant.id);

      // Store geofence data for monitoring
      this.alertHistory.set(restaurant.id, []);

      console.log(`Registered geofence for ${restaurant.name_ja || restaurant.name_en}`);
    } catch (error) {
      console.error('Error registering geofence:', error);
    }
  }

  // Start background monitoring
  private startBackgroundMonitoring(): void {
    // Monitor location changes and check proximity
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.checkProximityAlerts();
        },
        (error) => {
          console.error('Location monitoring error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // Update every 30 seconds
        }
      );
    }
  }

  // Check for proximity alerts
  private async checkProximityAlerts(): Promise<void> {
    if (!this.userLocation || this.isInQuietHours || Date.now() < this.cooldownUntil) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name_ja, name_en, latitude, longitude')
        .in('id', Array.from(this.activeGeofences));

      if (error || !restaurants) return;

      for (const restaurant of restaurants) {
        if (!restaurant.latitude || !restaurant.longitude) continue;

        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          restaurant.latitude,
          restaurant.longitude
        );

        // Check each alert distance
        for (const alertDistance of this.config.alertDistances) {
          if (distance <= alertDistance) {
            await this.triggerProximityAlert(restaurant, distance, alertDistance);
            break; // Only trigger one alert per restaurant
          }
        }
      }
    } catch (error) {
      console.error('Error checking proximity alerts:', error);
    }
  }

  // Trigger proximity alert
  private async triggerProximityAlert(
    restaurant: any,
    distance: number,
    alertDistance: number
  ): Promise<void> {
    const restaurantId = restaurant.id;
    const alertHistory = this.alertHistory.get(restaurantId) || [];
    const now = Date.now();

    // Check if we've already alerted for this distance today
    const todayAlerts = alertHistory.filter(
      alert => 
        alert.alertType === this.getAlertType(alertDistance) &&
        this.isSameDay(alert.timestamp, now)
    );

    if (todayAlerts.length > 0) return;

    // Determine alert type based on distance
    const alertType = this.getAlertType(alertDistance);
    
    // Create alert
    const alert: ProximityAlert = {
      restaurantId,
      restaurantName: restaurant.name_ja || restaurant.name_en,
      distance,
      timestamp: now,
      alertType,
    };

    // Add to history
    alertHistory.push(alert);
    this.alertHistory.set(restaurantId, alertHistory);

    // Show notification
    await this.showProximityNotification(alert);

    // Set cooldown
    this.cooldownUntil = now + (this.config.cooldownMinutes * 60 * 1000);
  }

  // Get alert type based on distance
  private getAlertType(distance: number): 'gentle' | 'reminder' | 'alarm' {
    if (distance <= 50) return 'alarm';
    if (distance <= 100) return 'reminder';
    return 'gentle';
  }

  // Show proximity notification
  private async showProximityNotification(alert: ProximityAlert): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const title = this.getAlertTitle(alert.alertType);
      const body = `${alert.restaurantName} is ${Math.round(alert.distance)}m away!`;
      
      new Notification(title, {
        body,
        icon: '/logo/NAVIkko Green.png',
        tag: `proximity_${alert.restaurantId}`,
        requireInteraction: alert.alertType === 'alarm',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showProximityNotification(alert);
      }
    }
  }

  // Get alert title based on type
  private getAlertTitle(alertType: string): string {
    switch (alertType) {
      case 'alarm':
        return '🚨 Very Close Restaurant!';
      case 'reminder':
        return '🍜 Nearby Restaurant!';
      default:
        return '📍 Restaurant Nearby';
    }
  }

  // Check if in quiet hours
  private checkQuietHours(): void {
    const now = new Date();
    const hour = now.getHours();
    this.isInQuietHours = hour >= this.config.quietHoursStart || hour < this.config.quietHoursEnd;
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  }

  // Check if two timestamps are on the same day
  private isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

  // Update user preferences
  updatePreferences(preferences: {
    cooldownMinutes?: number;
    quietHoursStart?: number;
    quietHoursEnd?: number;
    alertsEnabled?: boolean;
  }): void {
    if (preferences.cooldownMinutes !== undefined) {
      this.config.cooldownMinutes = preferences.cooldownMinutes;
    }
    if (preferences.quietHoursStart !== undefined) {
      this.config.quietHoursStart = preferences.quietHoursStart;
    }
    if (preferences.quietHoursEnd !== undefined) {
      this.config.quietHoursEnd = preferences.quietHoursEnd;
    }
  }

  // Mute specific restaurant
  muteRestaurant(restaurantId: string): void {
    this.activeGeofences.delete(restaurantId);
    this.alertHistory.delete(restaurantId);
  }

  // Unmute specific restaurant
  unmuteRestaurant(restaurantId: string): void {
    // Re-register geofence for this restaurant
    this.registerNearbyGeofences();
  }

  // Get current status
  getStatus(): {
    activeGeofences: number;
    isInQuietHours: boolean;
    cooldownActive: boolean;
    userLocation: { lat: number; lng: number } | null;
  } {
    return {
      activeGeofences: this.activeGeofences.size,
      isInQuietHours: this.isInQuietHours,
      cooldownActive: Date.now() < this.cooldownUntil,
      userLocation: this.userLocation,
    };
  }

  // Cleanup
  cleanup(): void {
    this.activeGeofences.clear();
    this.alertHistory.clear();
    this.userLocation = null;
  }
}

export const geofenceService = new GeofenceService(); 