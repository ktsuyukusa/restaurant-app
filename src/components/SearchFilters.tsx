import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCuisine,
  onCuisineChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  onClearFilters
}) => {
  const { t } = useLanguage();
  
  const cuisineOptions = [
    { key: 'all', value: 'All Cuisines', translationKey: 'filter.all_cuisines' },
    { key: 'japanese', value: 'Japanese', translationKey: 'cuisine.japanese' },
    { key: 'italian', value: 'Italian', translationKey: 'cuisine.italian' },
    { key: 'chinese', value: 'Chinese', translationKey: 'cuisine.chinese' },
    { key: 'korean', value: 'Korean', translationKey: 'cuisine.korean' },
    { key: 'french', value: 'French', translationKey: 'cuisine.french' },
    { key: 'thai', value: 'Thai', translationKey: 'cuisine.thai' },
    { key: 'indian', value: 'Indian', translationKey: 'cuisine.indian' },
    { key: 'american', value: 'American', translationKey: 'cuisine.american' }
  ];

  const priceOptions = [
    { key: 'all', value: 'All Prices', translationKey: 'filter.all_prices' },
    { key: 'budget', value: '¥ - Budget', translationKey: 'price.budget' },
    { key: 'moderate', value: '¥¥ - Moderate', translationKey: 'price.moderate' },
    { key: 'expensive', value: '¥¥¥ - Expensive', translationKey: 'price.expensive' },
    { key: 'very_expensive', value: '¥¥¥¥ - Very Expensive', translationKey: 'price.very_expensive' }
  ];

  const ratingOptions = [
    { key: 'all', value: 'All Ratings', translationKey: 'filter.all_ratings' },
    { key: '4_5_plus', value: '4.5+ Stars', translationKey: 'rating.4_5_plus' },
    { key: '4_0_plus', value: '4.0+ Stars', translationKey: 'rating.4_0_plus' },
    { key: '3_5_plus', value: '3.5+ Stars', translationKey: 'rating.3_5_plus' },
    { key: '3_0_plus', value: '3.0+ Stars', translationKey: 'rating.3_0_plus' }
  ];

  const hasActiveFilters = selectedCuisine !== 'All Cuisines' || 
                          selectedPriceRange !== 'All Prices' || 
                          selectedRating !== 'All Ratings';

  const getDisplayText = (value: string, options: Array<{key: string, value: string, translationKey: string}>) => {
    const option = options.find(opt => opt.value === value);
    return option ? t(option.translationKey) : value;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedCuisine} onValueChange={onCuisineChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filter.cuisine')} />
          </SelectTrigger>
          <SelectContent>
            {cuisineOptions.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {t(option.translationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filter.price')} />
          </SelectTrigger>
          <SelectContent>
            {priceOptions.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {t(option.translationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedRating} onValueChange={onRatingChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('filter.rating')} />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {t(option.translationKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm text-gray-600">{t('filter.active_filters')}</span>
            {selectedCuisine !== 'All Cuisines' && (
              <Badge variant="secondary">{getDisplayText(selectedCuisine, cuisineOptions)}</Badge>
            )}
            {selectedPriceRange !== 'All Prices' && (
              <Badge variant="secondary">{getDisplayText(selectedPriceRange, priceOptions)}</Badge>
            )}
            {selectedRating !== 'All Ratings' && (
              <Badge variant="secondary">{getDisplayText(selectedRating, ratingOptions)}</Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            {t('filter.clear_all')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
