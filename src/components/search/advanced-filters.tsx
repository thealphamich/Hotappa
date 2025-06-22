import { useState } from 'react';
import { useSearch } from '../../contexts/search-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { SlidersHorizontal, X } from 'lucide-react';

export function AdvancedFilters() {
  const { filters, setFilters, search } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 1000
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    filters.amenities || []
  );

  const amenitiesList = [
    'WiFi',
    'Pool',
    'Gym',
    'Spa',
    'Restaurant',
    'Bar',
    'Parking',
    'Air Conditioning',
    'Kitchen',
    'Balcony',
    'Sea View',
    'Mountain View',
    'Pet Friendly',
    'Wheelchair Accessible'
  ];

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      priceRange: {
        min: priceRange[0],
        max: priceRange[1]
      },
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
    });
    search();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedAmenities([]);
    setFilters({
      location: filters.location,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests
    });
    search();
  };

  const activeFiltersCount = [
    filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000),
    filters.propertyType && filters.propertyType !== 'all',
    filters.amenities && filters.amenities.length > 0,
    filters.rating && filters.rating > 0
  ].filter(Boolean).length;

  return (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#DC2626] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price Range (per night)</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Property Type</Label>
            <Select
              value={filters.propertyType || 'all'}
              onValueChange={(value: any) => setFilters({ ...filters, propertyType: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="apartment">Apartments</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <Select
              value={filters.rating?.toString() || 'any'}
              onValueChange={(value) => setFilters({ ...filters, rating: value === 'any' ? undefined : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any rating</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Amenities</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <Label
                    htmlFor={amenity}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear all
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Apply filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}