import { useEffect, useState } from 'react'

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setCoords(position.coords),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { coords, error }
} 