import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ReviewList } from '../components/reviews/review-list';
import { ReviewForm } from '../components/reviews/review-form';
import { PropertyMap } from '../components/map/property-map';
import { BookingWidget } from '../components/booking/booking-widget';

interface Property {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  location: string;
  host_id: string;
  minimum_stay?: number;
  max_guests?: number;
  total_rooms?: number;
  amenities?: string[];
  images?: string[];
  host: {
    full_name: string;
    avatar_url: string;
  };
}

export function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyType, setPropertyType] = useState<'hotel' | 'apartment' | 'restaurant'>('hotel');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!id) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      try {
        // Try to find the property in hotels
        let { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select(`
            *,
            host:profiles(full_name, avatar_url)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!hotelError && hotelData) {
          setProperty(hotelData);
          setPropertyType('hotel');
          setLoading(false);
          return;
        }

        // Try apartments if not found in hotels
        let { data: apartmentData, error: apartmentError } = await supabase
          .from('apartments')
          .select(`
            *,
            host:profiles(full_name, avatar_url)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!apartmentError && apartmentData) {
          setProperty(apartmentData);
          setPropertyType('apartment');
          setLoading(false);
          return;
        }

        // Finally, try restaurants
        let { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select(`
            *,
            host:profiles(full_name, avatar_url)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!restaurantError && restaurantData) {
          setProperty(restaurantData);
          setPropertyType('restaurant');
          setLoading(false);
          return;
        }

        // If we get here, the property wasn't found in any table
        throw new Error('Property not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Property not found</div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Property Images */}
        {property.images && property.images.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-96">
              <div className="lg:col-span-2">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-rows-2 gap-4">
                {property.images.slice(1, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${property.name} ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
              <p className="text-gray-600 mb-4">{property.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Location:</span>
                  <p>{property.location}</p>
                </div>
                {property.max_guests && (
                  <div>
                    <span className="font-semibold">Max Guests:</span>
                    <p>{property.max_guests}</p>
                  </div>
                )}
                {property.total_rooms && (
                  <div>
                    <span className="font-semibold">Total Rooms:</span>
                    <p>{property.total_rooms}</p>
                  </div>
                )}
                {property.minimum_stay && (
                  <div>
                    <span className="font-semibold">Minimum Stay:</span>
                    <p>{property.minimum_stay} nights</p>
                  </div>
                )}
              </div>

              {/* Host Info */}
              <div className="flex items-center mt-6 p-4 border rounded-lg">
                <div className="flex items-center">
                  {property.host?.avatar_url && (
                    <img
                      src={property.host.avatar_url}
                      alt={property.host.full_name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  )}
                  <div>
                    <p className="font-semibold">Hosted by {property.host?.full_name}</p>
                    <p className="text-sm text-gray-600">Superhost</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-gray-600">•</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Where you'll be</h2>
              <div className="h-64 md:h-96">
                <PropertyMap location={property.location} />
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <ReviewList propertyId={property.id} />
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <ReviewForm 
                  propertyId={property.id} 
                  onReviewSubmitted={() => {
                    // Refresh reviews after submission
                    window.location.reload();
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            {propertyType !== 'restaurant' && (
              <BookingWidget
                property={property}
                propertyType={propertyType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;