import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import RestaurantCard from './RestaurantCard';
import { getAllRestaurants, type Restaurant } from '@/utils/restaurantData';
import { getLocalizedValue } from '@/utils/localization';
import { useDistanceCalculation, type RestaurantWithDistance } from '@/hooks/useDistanceCalculation';

interface RestaurantListProps {
  onViewDetails: (id: string) => void;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ onViewDetails }) => {
  const { t, currentLanguage } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use distance calculation hook
  const { restaurantsWithDistance, hasLocation } = useDistanceCalculation(restaurants);

  useEffect(() => {
    try {
      // Load synchronized restaurant data
      const allRestaurants = getAllRestaurants();
      setRestaurants(allRestaurants);
      setFilteredRestaurants(allRestaurants);
      setLoading(false);
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Failed to load restaurants');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restaurantsWithDistance.length > 0) {
      filterRestaurants();
    }
  }, [searchTerm, selectedCuisine, priceRange, sortBy, restaurantsWithDistance, currentLanguage]);

  const filterRestaurants = () => {
    try {
      let filtered = [...restaurantsWithDistance];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(restaurant => {
          const name = getLocalizedValue(restaurant.name, currentLanguage);
          const description = getLocalizedValue(restaurant.description || '', currentLanguage);
          const address = getLocalizedValue(restaurant.address || '', currentLanguage);
          
          const searchLower = searchTerm.toLowerCase();
          return (
            name.toLowerCase().includes(searchLower) ||
            description.toLowerCase().includes(searchLower) ||
            address.toLowerCase().includes(searchLower) ||
            restaurant.cuisine.toLowerCase().includes(searchLower)
          );
        });
      }

      // Cuisine filter
      if (selectedCuisine && selectedCuisine !== 'all') {
        filtered = filtered.filter(restaurant => restaurant.cuisine === selectedCuisine);
      }

      // Price range filter
      if (priceRange && priceRange !== 'all') {
        filtered = filtered.filter(restaurant => restaurant.priceRange === priceRange);
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            const nameA = getLocalizedValue(a.name, currentLanguage);
            const nameB = getLocalizedValue(b.name, currentLanguage);
            return nameA.localeCompare(nameB);
          case 'rating':
            return b.rating - a.rating;
          case 'distance':
            // Use calculated distance if available, otherwise fallback to string parsing
            const distanceA = a.calculatedDistance || parseFloat(a.distance.replace(/[^\d.]/g, ''));
            const distanceB = b.calculatedDistance || parseFloat(b.distance.replace(/[^\d.]/g, ''));
            return distanceA - distanceB;
          case 'price':
            return a.priceRange.localeCompare(b.priceRange);
          default:
            return 0;
        }
      });

      setFilteredRestaurants(filtered);
    } catch (err) {
      console.error('Error filtering restaurants:', err);
      setFilteredRestaurants([]);
    }
  };

  const getUniqueCuisines = () => {
    const cuisines = restaurantsWithDistance.map(r => r.cuisine);
    return [...new Set(cuisines)];
  };

  const getUniquePriceRanges = () => {
    const ranges = restaurantsWithDistance.map(r => r.priceRange);
    return [...new Set(ranges)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('all');
    setPriceRange('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('loading')}</h2>
          <p className="text-gray-600">Loading restaurants...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger>
                <SelectValue placeholder={t('filter.cuisine')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.all_cuisines')}</SelectItem>
                {getUniqueCuisines().map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder={t('filter.priceRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.all_prices')}</SelectItem>
                {getUniquePriceRanges().map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('filter.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('filter.sortByName')}</SelectItem>
                <SelectItem value="rating">{t('filter.sortByRating')}</SelectItem>
                <SelectItem value="distance">{t('filter.sortByDistance')}</SelectItem>
                <SelectItem value="price">{t('filter.sortByPrice')}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={clearFilters} variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              {t('filter.clear')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">
            {filteredRestaurants.length} {t('search.results').replace('{{count}}', filteredRestaurants.length.toString())}
          </p>
          {hasLocation && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              📍 From your location
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{t('search.nearby')}</span>
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600">
              {t('search.noResults')}
            </h3>
            <p className="text-gray-500">
              {t('search.tryDifferent')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RestaurantList;