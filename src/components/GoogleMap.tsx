import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  location?: string;
  className?: string;
  restaurants?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  latitude, 
  longitude, 
  location, 
  className = '',
  restaurants = []
}) => {
  const { t } = useLanguage();

  // Static map fallback without Google Maps API
  const defaultLat = import.meta.env.VITE_DEFAULT_LATITUDE ? parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE) : 36.248;
  const defaultLng = import.meta.env.VITE_DEFAULT_LONGITUDE ? parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE) : 138.248;
  const bboxOffset = import.meta.env.VITE_MAP_BBOX_OFFSET ? parseFloat(import.meta.env.VITE_MAP_BBOX_OFFSET) : 0.01;
  
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(longitude || defaultLng) - bboxOffset},${(latitude || defaultLat) - bboxOffset},${(longitude || defaultLng) + bboxOffset},${(latitude || defaultLat) + bboxOffset}&layer=mapnik&marker=${latitude || defaultLat},${longitude || defaultLng}`;

  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden border-2 border-navikko-primary/20 ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        title={location || 'Restaurant Location'}
      />
    </div>
  );
};

export default GoogleMap;