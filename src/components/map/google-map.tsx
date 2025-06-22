import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  location: string;
  className?: string;
}

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function GoogleMap({ location, className = '' }: GoogleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Google Maps API key from environment
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    console.log('🗺️ Google Maps Debug Info:', {
      apiKey: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 20)}...` : 'NOT FOUND',
      location: location,
      container: mapContainer.current ? 'Ready' : 'Not Ready'
    });

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key is missing');
      setError('Google Maps API key not configured');
      setLoading(false);
      return;
    }
  }, [GOOGLE_MAPS_API_KEY, location]);

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

    console.log('🔍 Looking for coordinates for:', locationLower);

    // Try exact matches first
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        console.log('✅ Found coordinates:', city, coords);
        return coords;
      }
    }

    // Default to Kigali if no match found
    console.log('⚠️ No match found, defaulting to Kigali');
    return { lat: -1.9441, lng: 30.0619 };
  };

  // Load Google Maps script
  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps script loaded');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps script');
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });
  };

  // Initialize map
  const initializeMap = async () => {
    if (!mapContainer.current || !coordinates) return;

    try {
      console.log('🗺️ Initializing Google Map with coordinates:', coordinates);

      // Create map
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: coordinates,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Create marker
      marker.current = new window.google.maps.Marker({
        position: coordinates,
        map: map.current,
        title: location,
        animation: window.google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${location}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Property Location</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af;">
              <span>Lat: ${coordinates.lat.toFixed(4)}</span>
              <span>Lng: ${coordinates.lng.toFixed(4)}</span>
            </div>
          </div>
        `
      });

      // Add click listener to marker
      marker.current.addListener('click', () => {
        infoWindow.open(map.current, marker.current);
      });

      console.log('✅ Google Map initialized successfully');
      setLoading(false);
      setError(null);

    } catch (err) {
      console.error('❌ Error initializing Google Map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  // Get coordinates when location changes
  useEffect(() => {
    if (!location) {
      setError('No location provided');
      setLoading(false);
      return;
    }

    console.log('📍 Processing location:', location);
    const coords = getLocationCoordinates(location);
    setCoordinates(coords);
  }, [location]);

  // Load Google Maps and initialize when coordinates are ready
  useEffect(() => {
    if (!coordinates || !GOOGLE_MAPS_API_KEY) return;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        await initializeMap();
      } catch (err) {
        console.error('❌ Failed to load Google Maps:', err);
        setError('Failed to load Google Maps');
        setLoading(false);
      }
    };

    initMap();
  }, [coordinates, GOOGLE_MAPS_API_KEY]);

  // Loading state
  if (loading) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600 font-medium">Loading Google Maps...</p>
          <p className="text-xs text-gray-500 mt-1">{location}</p>
          <div className="mt-2 text-xs text-gray-400">
            <p>API Key: {GOOGLE_MAPS_API_KEY ? '✅ Valid' : '❌ Missing'}</p>
            <p>Coords: {coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Calculating...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center text-red-600 max-w-md">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-semibold text-lg mb-2">Map Error</p>
          <p className="text-sm mb-3">{error}</p>
          <p className="text-xs text-gray-600 mb-3">{location}</p>
          
          <div className="bg-white p-3 rounded border text-xs text-left">
            <p className="font-semibold mb-2">Debug Information:</p>
            <div className="space-y-1">
              <p><span className="font-medium">API Key:</span> {GOOGLE_MAPS_API_KEY ? '✅ Present' : '❌ Missing'}</p>
              <p><span className="font-medium">Coordinates:</span> {coordinates ? `✅ ${coordinates.lat}, ${coordinates.lng}` : '❌ None'}</p>
              <p><span className="font-medium">Container:</span> {mapContainer.current ? '✅ Ready' : '❌ Not Ready'}</p>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Map container
  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] rounded-lg bg-gray-100"
        style={{ minHeight: '400px' }}
      />
      
      {/* Location info overlay */}
      <div className="absolute top-3 left-3 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-md border">
        <p className="text-sm font-semibold text-gray-800">{location}</p>
        {coordinates && (
          <p className="text-xs text-gray-600">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-2 py-1 rounded shadow-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Google Maps</span>
        </div>
      </div>

      {/* Google Maps attribution */}
      <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        © Google Maps
      </div>
    </div>
  );
}