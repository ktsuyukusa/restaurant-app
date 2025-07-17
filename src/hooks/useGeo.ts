import { useEffect, useState } from 'react';

export const useGeo = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('geoConsent');
    if (!consent) {
      if (window.confirm('Enable location to show nearby places?')) {
        requestLocation();
      } else {
        localStorage.setItem('geoConsent', 'denied');
        setPermission('denied');
      }
    } else {
      setPermission(consent as 'granted' | 'denied');
      if (consent === 'granted') requestLocation();
    }
  }, []);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        localStorage.setItem('geoConsent', 'granted');
        setPermission('granted');
      },
      () => {
        localStorage.setItem('geoConsent', 'denied');
        setPermission('denied');
      }
    );
  };

  return { coords, permission };
};

export const isNearby = (
  user: { lat: number; lng: number },
  target: { lat: number; lng: number },
  maxKm = 5
): boolean => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(target.lat - user.lat);
  const dLng = toRad(target.lng - user.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(user.lat)) *
    Math.cos(toRad(target.lat)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= maxKm;
};