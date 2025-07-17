import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';

interface RestaurantData {
  name: Record<string, string>;
  address: Record<string, string>;
  description?: Record<string, string>;
}

interface LocalizedRestaurantInfoProps {
  data: RestaurantData;
}

const LocalizedRestaurantInfo: React.FC<LocalizedRestaurantInfoProps> = ({ data }) => {
  const { currentLanguage } = useLanguage();

  return (
    <div className="space-y-2">
      <h3>{getLocalizedValue(data.name, currentLanguage)}</h3>
      <p>{getLocalizedValue(data.address, currentLanguage)}</p>
      {data.description && (
        <p className="text-sm text-gray-600">
          {getLocalizedValue(data.description, currentLanguage)}
        </p>
      )}
    </div>
  );
};

export default LocalizedRestaurantInfo; 