import { getSupabaseClient } from '@/lib/supabase';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone?: string;
  cuisine?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_range?: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  is_available: boolean;
  created_at: string;
}

class RestaurantService {
  private static instance: RestaurantService;

  private constructor() {}

  public static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService();
    }
    return RestaurantService.instance;
  }

  // Get all active restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching restaurants:', error);
        throw new Error('Failed to fetch restaurants');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurants:', error);
      throw error;
    }
  }

  // Get restaurant by ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getRestaurantById:', error);
      return null;
    }
  }

  // Get menu items for a restaurant
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('menus')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('category, name');

      if (error) {
        console.error('Error fetching menu items:', error);
        throw new Error('Failed to fetch menu items');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMenuItems:', error);
      throw error;
    }
  }

  // Get menu item by ID
  async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('menus')
        .select('*')
        .eq('id', id)
        .eq('is_available', true)
        .single();

      if (error) {
        console.error('Error fetching menu item:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMenuItemById:', error);
      return null;
    }
  }

  // Search restaurants by name or cuisine
  async searchRestaurants(query: string): Promise<Restaurant[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`)
        .order('name');

      if (error) {
        console.error('Error searching restaurants:', error);
        throw new Error('Failed to search restaurants');
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchRestaurants:', error);
      throw error;
    }
  }

  // Get restaurants by cuisine
  async getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .eq('cuisine', cuisine)
        .order('name');

      if (error) {
        console.error('Error fetching restaurants by cuisine:', error);
        throw new Error('Failed to fetch restaurants by cuisine');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurantsByCuisine:', error);
      throw error;
    }
  }

  // Get restaurants near a location (simple distance calculation)
  async getRestaurantsNearLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Restaurant[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching restaurants for location search:', error);
        throw new Error('Failed to fetch restaurants for location search');
      }

      // Filter restaurants within the specified radius
      const nearbyRestaurants = (data || []).filter(restaurant => {
        if (!restaurant.latitude || !restaurant.longitude) return false;
        
        const distance = this.calculateDistance(
          lat, lng,
          restaurant.latitude, restaurant.longitude
        );
        
        return distance <= radiusKm;
      });

      return nearbyRestaurants.sort((a, b) => {
        const distanceA = this.calculateDistance(lat, lng, a.latitude!, a.longitude!);
        const distanceB = this.calculateDistance(lat, lng, b.latitude!, b.longitude!);
        return distanceA - distanceB;
      });
    } catch (error) {
      console.error('Error in getRestaurantsNearLocation:', error);
      throw error;
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Get all available cuisines
  async getCuisines(): Promise<string[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('restaurants')
        .select('cuisine')
        .eq('is_active', true)
        .not('cuisine', 'is', null);

      if (error) {
        console.error('Error fetching cuisines:', error);
        throw new Error('Failed to fetch cuisines');
      }

      const cuisines = [...new Set(data?.map(r => r.cuisine).filter(Boolean))];
      return cuisines.sort();
    } catch (error) {
      console.error('Error in getCuisines:', error);
      throw error;
    }
  }

  // Get menu categories for a restaurant
  async getMenuCategories(restaurantId: string): Promise<string[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('menus')
        .select('category')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching menu categories:', error);
        throw new Error('Failed to fetch menu categories');
      }

      const categories = [...new Set(data?.map(m => m.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error in getMenuCategories:', error);
      throw error;
    }
  }
}

export default RestaurantService.getInstance(); 