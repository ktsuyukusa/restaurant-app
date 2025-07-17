// Location and notification utilities
export const requestLocationPermission = async (): Promise<{lat: number, lng: number} | null> => {
  if (!('geolocation' in navigator)) {
    console.log('Geolocation not supported');
    return null;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    console.log('Location permission denied:', error);
    if (window.confirm('We need location access to alert you about nearby restaurants. Allow location access?')) {
      return requestLocationPermission();
    }
    return null;
  }
};

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const showNearbyNotification = async (restaurantName: string, imageUrl?: string) => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('🍜 Nearby Restaurant!', {
      body: `${restaurantName} is just around the corner!`,
      icon: imageUrl || '/placeholder.svg'
    });
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('🍜 Nearby Restaurant!', {
        body: `${restaurantName} is just around the corner!`,
        icon: imageUrl || '/placeholder.svg'
      });
    }
  }
};

export const dictionary = {
  en: { 
    menu: 'Menu', 
    reservation: 'Reservation',
    nearby: 'Nearby',
    restaurants: 'Restaurants',
    map: 'Map',
    account: 'Account'
  },
  pl: { 
    menu: 'Menu', 
    reservation: 'Rezerwacja',
    nearby: 'W pobliżu',
    restaurants: 'Restauracje',
    map: 'Mapa',
    account: 'Konto'
  },
  ja: { 
    menu: 'メニュー', 
    reservation: '予約',
    nearby: '近く',
    restaurants: 'レストラン',
    map: '地図',
    account: 'アカウント'
  },
};