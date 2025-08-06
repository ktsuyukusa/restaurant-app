import { getSupabaseClient } from '@/lib/supabase';

interface ReservationData {
  restaurantId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
  depositRequired?: boolean;
  depositAmount?: number;
}

interface Timeslot {
  time: string;
  available: boolean;
  maxPartySize?: number;
  minPartySize?: number;
}

interface RestaurantHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface ExternalBookingProvider {
  name: string;
  apiUrl: string;
  apiKey?: string;
  supportsAvailability: boolean;
  supportsBooking: boolean;
}

class ReservationService {
  private externalProviders: Map<string, ExternalBookingProvider> = new Map();

  constructor() {
    this.initializeExternalProviders();
  }

  // Initialize external booking providers
  private initializeExternalProviders(): void {
    // Example external providers
    this.externalProviders.set('tablecheck', {
      name: 'TableCheck',
      apiUrl: 'https://api.tablecheck.com',
      supportsAvailability: true,
      supportsBooking: true,
    });

    this.externalProviders.set('opentable', {
      name: 'OpenTable',
      apiUrl: 'https://api.opentable.com',
      supportsAvailability: true,
      supportsBooking: true,
    });
  }

  // Generate available timeslots for a restaurant
  async generateTimeslots(
    restaurantId: string,
    date: string,
    partySize: number = 2
  ): Promise<Timeslot[]> {
    try {
      const supabase = getSupabaseClient();
      
      // Get restaurant hours and existing reservations
      const [hoursResult, reservationsResult] = await Promise.all([
        supabase
          .from('restaurant_hours')
          .select('*')
          .eq('restaurant_id', restaurantId),
        supabase
          .from('reservations')
          .select('reservation_time, party_size')
          .eq('restaurant_id', restaurantId)
          .eq('reservation_date', date)
          .eq('status', 'confirmed')
      ]);

      if (hoursResult.error) {
        console.error('Error fetching restaurant hours:', hoursResult.error);
        return [];
      }

      const dayOfWeek = new Date(date).getDay();
      const dayHours = hoursResult.data?.find(h => h.day_of_week === dayOfWeek);

      if (!dayHours || !dayHours.is_open) {
        return [];
      }

      // Generate timeslots based on opening hours
      const timeslots = this.generateTimeslotsFromHours(
        dayHours.open_time,
        dayHours.close_time,
        partySize
      );

      // Filter out unavailable timeslots based on existing reservations
      const availableTimeslots = this.filterAvailableTimeslots(
        timeslots,
        reservationsResult.data || [],
        partySize
      );

      return availableTimeslots;
    } catch (error) {
      console.error('Error generating timeslots:', error);
      return [];
    }
  }

  // Generate timeslots from opening hours
  private generateTimeslotsFromHours(
    openTime: string,
    closeTime: string,
    partySize: number
  ): Timeslot[] {
    const timeslots: Timeslot[] = [];
    const interval = 30; // 30-minute intervals

    const openHour = parseInt(openTime.split(':')[0]);
    const openMinute = parseInt(openTime.split(':')[1]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const closeMinute = parseInt(closeTime.split(':')[1]);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      timeslots.push({
        time: timeString,
        available: true,
        maxPartySize: 10,
        minPartySize: 1,
      });

      // Add 30 minutes
      currentMinute += interval;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return timeslots;
  }

  // Filter available timeslots based on existing reservations
  private filterAvailableTimeslots(
    timeslots: Timeslot[],
    existingReservations: any[],
    partySize: number
  ): Timeslot[] {
    const restaurantCapacity = 50; // Default capacity, should come from restaurant settings

    return timeslots.map(timeslot => {
      const conflictingReservations = existingReservations.filter(
        reservation => reservation.reservation_time === timeslot.time
      );

      const totalReservedSeats = conflictingReservations.reduce(
        (sum, reservation) => sum + reservation.party_size,
        0
      );

      const availableSeats = restaurantCapacity - totalReservedSeats;
      const available = availableSeats >= partySize;

      return {
        ...timeslot,
        available,
      };
    });
  }

  // Create a new reservation
  async createReservation(data: ReservationData): Promise<{
    success: boolean;
    reservationId?: string;
    error?: string;
    requiresDeposit?: boolean;
    depositAmount?: number;
  }> {
    try {
      const supabase = getSupabaseClient();

      // Check if restaurant requires deposit
      const restaurantResult = await supabase
        .from('restaurants')
        .select('deposit_required, deposit_amount')
        .eq('id', data.restaurantId)
        .single();

      if (restaurantResult.error) {
        return { success: false, error: 'Restaurant not found' };
      }

      const requiresDeposit = restaurantResult.data.deposit_required || false;
      const depositAmount = restaurantResult.data.deposit_amount || 0;

      // Create reservation record
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          restaurant_id: data.restaurantId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          reservation_date: data.date,
          reservation_time: data.time,
          party_size: data.partySize,
          notes: data.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        return { success: false, error: 'Failed to create reservation' };
      }

      // If deposit is required, create payment intent
      if (requiresDeposit && depositAmount > 0) {
        const paymentResult = await this.createDepositPayment(
          reservation.id,
          depositAmount,
          data.customerEmail
        );

        if (!paymentResult.success) {
          return { 
            success: false, 
            error: 'Failed to create deposit payment',
            requiresDeposit: true,
            depositAmount
          };
        }

        return {
          success: true,
          reservationId: reservation.id,
          requiresDeposit: true,
          depositAmount,
        };
      }

      return {
        success: true,
        reservationId: reservation.id,
      };
    } catch (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Create deposit payment
  private async createDepositPayment(
    reservationId: string,
    amount: number,
    customerEmail?: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: reservationId,
          amount: amount,
          currency: 'jpy',
          customer_email: customerEmail,
          items: [{
            name: 'Reservation Deposit',
            price: amount,
            quantity: 1,
          }],
          restaurant_id: reservationId, // Using reservationId as restaurant_id for deposit
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        sessionId: result.sessionId,
      };
    } catch (error) {
      console.error('Error creating deposit payment:', error);
      return { success: false, error: 'Payment service error' };
    }
  }

  // Get reservations for a restaurant (owner view)
  async getRestaurantReservations(
    restaurantId: string,
    date?: string,
    status?: string
  ): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      
      let query = supabase
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (date) {
        query = query.eq('reservation_date', date);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reservations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  // Update reservation status
  async updateReservationStatus(
    reservationId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) {
        console.error('Error updating reservation status:', error);
        return { success: false, error: 'Failed to update status' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Get user reservations
  async getUserReservations(userId: string): Promise<any[]> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          restaurants(
            name_ja,
            name_en,
            address_ja,
            address_en,
            phone
          )
        `)
        .eq('user_id', userId)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) {
        console.error('Error fetching user reservations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      return [];
    }
  }

  // Cancel reservation
  async cancelReservation(
    reservationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      // Check if user owns this reservation
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      // Check if reservation can be cancelled (e.g., not too close to reservation time)
      const reservationDate = new Date(reservation.reservation_date);
      const now = new Date();
      const hoursUntilReservation = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilReservation < 2) {
        return { success: false, error: 'Reservation cannot be cancelled within 2 hours' };
      }

      // Update status to cancelled
      const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error cancelling reservation:', updateError);
        return { success: false, error: 'Failed to cancel reservation' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Check external booking availability
  async checkExternalAvailability(
    restaurantId: string,
    date: string,
    partySize: number
  ): Promise<{
    hasExternalBooking: boolean;
    provider?: string;
    externalUrl?: string;
    availableTimeslots?: string[];
  }> {
    try {
      const supabase = getSupabaseClient();
      
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('external_booking_url, external_booking_provider')
        .eq('id', restaurantId)
        .single();

      if (error || !restaurant.external_booking_url) {
        return { hasExternalBooking: false };
      }

      // If external provider is configured, check availability
      if (restaurant.external_booking_provider) {
        const provider = this.externalProviders.get(restaurant.external_booking_provider);
        
        if (provider && provider.supportsAvailability) {
          const availability = await this.fetchExternalAvailability(
            provider,
            restaurantId,
            date,
            partySize
          );

          return {
            hasExternalBooking: true,
            provider: provider.name,
            externalUrl: restaurant.external_booking_url,
            availableTimeslots: availability,
          };
        }
      }

      return {
        hasExternalBooking: true,
        externalUrl: restaurant.external_booking_url,
      };
    } catch (error) {
      console.error('Error checking external availability:', error);
      return { hasExternalBooking: false };
    }
  }

  // Fetch external availability from provider
  private async fetchExternalAvailability(
    provider: ExternalBookingProvider,
    restaurantId: string,
    date: string,
    partySize: number
  ): Promise<string[]> {
    // This would integrate with the actual provider's API
    // For now, return mock data
    return ['11:00', '12:00', '13:00', '18:00', '19:00', '20:00'];
  }

  // Block timeslots (owner function)
  async blockTimeslots(
    restaurantId: string,
    date: string,
    timeslots: string[],
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      // Create blocked timeslot records
      const blockedSlots = timeslots.map(time => ({
        restaurant_id: restaurantId,
        date: date,
        time: time,
        reason: reason || 'Blocked by restaurant',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('blocked_timeslots')
        .insert(blockedSlots);

      if (error) {
        console.error('Error blocking timeslots:', error);
        return { success: false, error: 'Failed to block timeslots' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error blocking timeslots:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
}

export const reservationService = new ReservationService(); 