import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapTilerMapProps {
  location: string;
  className?: string;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    price?: number;
    selected?: boolean;
    onClick?: () => void;
  }>;
  onMarkerClick?: (markerId: string) => void;
}

export function MapTilerMap({ 
  location, 
  className = '', 
  markers = [],
  onMarkerClick 
}: MapTilerMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 30.0619, // Default to Kigali
    latitude: -1.9441,
    zoom: 12
  });
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

  // Get coordinates for known locations
  const getLocationCoordinates = (location: string): { lat: number; lng: number } | null => {
    const locationLower = location.toLowerCase();
    
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      // Rwanda locations
      'kigali': { lat: -1.9441, lng: 30.0619 },
      'rwanda': { lat: -1.9441, lng: 30.0619 },
      'kimisagara': { lat: -1.9441, lng: 30.0619 },
      
      // Dubai locations
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'uae': { lat: 25.2048, lng: 55.2708 },
      'united arab emirates': { lat: 25.2048, lng: 55.2708 },
      'palm jumeirah': { lat: 25.1124, lng: 55.1167 },
      
      // New York locations
      'new york': { lat: 40.7128, lng: -74.0060 },
      'usa': { lat: 40.7128, lng: -74.0060 },
      'manhattan': { lat: 40.7831, lng: -73.9712 },
      'west 57th street': { lat: 40.7648, lng: -73.9776 },
      
      // Paris locations
      'paris': { lat: 48.8566, lng: 2.3522 },
      'france': { lat: 48.8566, lng: 2.3522 },
      'champs-élysées': { lat: 48.8698, lng: 2.3069 },
      
      // Other major cities
      'london': { lat: 51.5074, lng: -0.1276 },
      'tokyo': { lat: 35.6895, lng: 139.6917 },
      'zermatt': { lat: 45.9763, lng: 7.7491 },
      'switzerland': { lat: 46.8182, lng: 8.2275 },
      'santorini': { lat: 36.3932, lng: 25.4615 },
      'oia': { lat: 36.4618, lng: 25.3756 },
      'greece': { lat: 37.9755, lng: 23.7275 },
      'zanzibar': { lat: -6.1659, lng: 39.2083 },
      'nungwi': { lat: -5.7269, lng: 39.2969 },
      'tanzania': { lat: -6.3690, lng: 34.8888 },
      'maldives': { lat: 3.2028, lng: 73.2207 },
      'maafushi': { lat: 3.8590, lng: 73.4289 },
      'ireland': { lat: 53.4129, lng: -8.2439 },
      'cong': { lat: 53.5333, lng: -9.2667 },
      'scotland': { lat: 56.4907, lng: -4.2026 },
      'edinburgh': { lat: 55.9533, lng: -3.1883 },
      'grassmarket': { lat: 55.9478, lng: -3.1944 },
      'bali': { lat: -8.4095, lng: 115.0920 },
      'indonesia': { lat: -0.7893, lng: 113.9213 }
    };

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        return coords;
      }
    }

    // Default to Kigali if no match found
    return { lat: -1.9441, lng: 30.0619 };
  };

  useEffect(() => {
    if (!MAPTILER_API_KEY) {
      setError('MapTiler API key is missing');
      setLoading(false);
      return;
    }

    if (markers.length > 0) {
      // If we have markers, fit the map to show all of them
      const bounds = markers.reduce(
        (acc, marker) => ({
          minLat: Math.min(acc.minLat, marker.latitude),
          maxLat: Math.max(acc.maxLat, marker.latitude),
          minLng: Math.min(acc.minLng, marker.longitude),
          maxLng: Math.max(acc.maxLng, marker.longitude),
        }),
        {
          minLat: markers[0].latitude,
          maxLat: markers[0].latitude,
          minLng: markers[0].longitude,
          maxLng: markers[0].longitude,
        }
      );

      const centerLat = (bounds.minLat + bounds.maxLat) / 2;
      const centerLng = (bounds.minLng + bounds.maxLng) / 2;

      setViewState({
        latitude: centerLat,
        longitude: centerLng,
        zoom: 10
      });
    } else if (location) {
      // Single location mode
      const coords = getLocationCoordinates(location);
      if (coords) {
        setViewState({
          latitude: coords.lat,
          longitude: coords.lng,
          zoom: 12
        });
      }
    }

    setLoading(false);
  }, [location, markers, MAPTILER_API_KEY]);

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarker(markerId);
    if (onMarkerClick) {
      onMarkerClick(markerId);
    }
  };

  if (!MAPTILER_API_KEY) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-semibold">MapTiler API Key Missing</p>
          <p className="text-sm mt-1">Please add VITE_MAPTILER_API_KEY to your environment</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading MapTiler...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-semibold">Map Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '400px' }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`}
        attributionControl={true}
      >
        {/* Single location marker */}
        {markers.length === 0 && location && (
          <Marker
            longitude={viewState.longitude}
            latitude={viewState.latitude}
            anchor="bottom"
          >
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              📍 {location}
            </div>
          </Marker>
        )}

        {/* Multiple markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(marker.id)}
          >
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg cursor-pointer transition-all hover:scale-110 ${
                marker.selected
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-600 border-2 border-red-600'
              }`}
            >
              {marker.price ? `$${marker.price}` : '📍'}
            </div>
          </Marker>
        ))}

        {/* Popup for selected marker */}
        {selectedMarker && (
          <Popup
            longitude={markers.find(m => m.id === selectedMarker)?.longitude || 0}
            latitude={markers.find(m => m.id === selectedMarker)?.latitude || 0}
            anchor="top"
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-semibold text-sm mb-1">
                {markers.find(m => m.id === selectedMarker)?.title}
              </h3>
              {markers.find(m => m.id === selectedMarker)?.price && (
                <p className="text-red-600 font-semibold">
                  ${markers.find(m => m.id === selectedMarker)?.price}/night
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Location info overlay */}
      <div className="absolute top-3 left-3 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-md border">
        <p className="text-sm font-semibold text-gray-800">
          {markers.length > 0 ? `${markers.length} properties` : location}
        </p>
      </div>

      {/* MapTiler attribution */}
      <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        © MapTiler © OpenStreetMap
      </div>
    </div>
  );
}