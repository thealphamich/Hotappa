import { useEffect, useState } from 'react';
import { MapTilerMap } from '../map/maptiler-map';
import { PropertySearchResult } from '../../lib/types';

interface PropertyMapProps {
  properties: PropertySearchResult[];
  selectedProperty?: string;
  onPropertySelect: (propertyId: string) => void;
  className?: string;
}

export function PropertyMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  className = '' 
}: PropertyMapProps) {
  const [markers, setMarkers] = useState<Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    price: number;
    selected: boolean;
  }>>([]);

  // Generate coordinates based on property location
  const getPropertyCoordinates = (property: PropertySearchResult): { lat: number; lng: number } | null => {
    const location = property.location.toLowerCase();
    
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'kigali': { lat: -1.9441, lng: 30.0619 },
      'rwanda': { lat: -1.9441, lng: 30.0619 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'uae': { lat: 25.2048, lng: 55.2708 },
      'palm jumeirah': { lat: 25.1124, lng: 55.1167 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'usa': { lat: 40.7128, lng: -74.0060 },
      'manhattan': { lat: 40.7831, lng: -73.9712 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'france': { lat: 48.8566, lng: 2.3522 },
      'london': { lat: 51.5074, lng: -0.1276 },
      'tokyo': { lat: 35.6895, lng: 139.6917 },
      'zermatt': { lat: 45.9763, lng: 7.7491 },
      'switzerland': { lat: 46.8182, lng: 8.2275 },
      'santorini': { lat: 36.3932, lng: 25.4615 },
      'greece': { lat: 37.9755, lng: 23.7275 },
      'zanzibar': { lat: -6.1659, lng: 39.2083 },
      'tanzania': { lat: -6.3690, lng: 34.8888 },
      'maldives': { lat: 3.2028, lng: 73.2207 },
      'ireland': { lat: 53.4129, lng: -8.2439 },
      'scotland': { lat: 56.4907, lng: -4.2026 },
      'bali': { lat: -8.4095, lng: 115.0920 },
      'indonesia': { lat: -0.7893, lng: 113.9213 }
    };

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (location.includes(city) || city.includes(location)) {
        const offset = 0.01;
        return {
          lat: coords.lat + (Math.random() - 0.5) * offset,
          lng: coords.lng + (Math.random() - 0.5) * offset
        };
      }
    }

    return null;
  };

  useEffect(() => {
    const newMarkers = properties
      .map(property => {
        const coordinates = getPropertyCoordinates(property);
        if (!coordinates) return null;

        return {
          id: property.id,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          title: property.title,
          price: property.price_per_night,
          selected: selectedProperty === property.id
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        latitude: number;
        longitude: number;
        title: string;
        price: number;
        selected: boolean;
      }>;

    setMarkers(newMarkers);
  }, [properties, selectedProperty]);

  return (
    <MapTilerMap
      location=""
      markers={markers}
      onMarkerClick={onPropertySelect}
      className={className}
    />
  );
}