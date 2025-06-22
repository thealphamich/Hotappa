import { useState } from 'react';
import { useSearch } from '../../contexts/search-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function SearchFilters() {
  const { filters, setFilters, search, clearFilters } = useSearch();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const propertyType = filters.propertyType || 'all';

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters({
      ...filters,
      priceRange: { min: value[0], max: value[1] }
    });
  };

  const renderPropertyTypeFilters = () => {
    if (propertyType === 'restaurant') {
      return (
        <div className="space-y-6">
          <div>
            <Label>Cuisine Type</Label>
            <Select
              value={filters.cuisineType}
              onValueChange={(value) => setFilters({ ...filters, cuisineType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="african">African</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="european">European</SelectItem>
                <SelectItem value="american">American</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Price Range</Label>
            <Select
              value={filters.priceRange}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$</SelectItem>
                <SelectItem value="$$">$$</SelectItem>
                <SelectItem value="$$$">$$$</SelectItem>
                <SelectItem value="$$$$">$$$$</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <Label>Price Range (per night)</Label>
          <div className="pt-4">
            <Slider
              defaultValue={[0, 1000]}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={handlePriceChange}
            />
            <div className="flex justify-between mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {propertyType === 'hotel' && (
          <div>
            <Label>Star Rating</Label>
            <Select
              value={filters.rating?.toString()}
              onValueChange={(value) => setFilters({ ...filters, rating: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {propertyType === 'apartment' && (
          <div>
            <Label>Bedrooms</Label>
            <Select
              value={filters.bedrooms?.toString()}
              onValueChange={(value) => setFilters({ ...filters, bedrooms: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 bedroom</SelectItem>
                <SelectItem value="2">2 bedrooms</SelectItem>
                <SelectItem value="3">3 bedrooms</SelectItem>
                <SelectItem value="4">4+ bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white">
      <div>
        <Label>Location</Label>
        <Input
          placeholder="Where are you going?"
          value={filters.location || ''}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      <div>
        <Label>Property Type</Label>
        <Select
          value={propertyType}
          onValueChange={(value: any) => setFilters({ ...filters, propertyType: value })}
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

      {renderPropertyTypeFilters()}

      <div className="flex gap-2">
        <Button onClick={() => search()} className="flex-1">
          Search
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}