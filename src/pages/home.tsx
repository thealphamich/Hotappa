import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PropertyCard } from '../components/property-card';
import { RestaurantCard } from '../components/restaurant-card';
import { SearchBar } from '../components/search/search-bar';

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  rating: number;
  images: string[];
}

interface Apartment {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  cuisine_type: string;
  rating: number;
  images: string[];
  menu_items: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
  }[];
}

export function Home() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category')?.toLowerCase() || 'hotels';
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        switch (category) {
          case 'hotels': {
            const { data } = await supabase
              .from('hotels')
              .select('*');
            setHotels(data || []);
            break;
          }
          case 'apartments': {
            const { data } = await supabase
              .from('apartments')
              .select('*');
            setApartments(data || []);
            break;
          }
          case 'restaurants': {
            const { data } = await supabase
              .from('restaurants')
              .select(`
                *,
                menu_items (*)
              `);
            setRestaurants(data || []);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] pt-44">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="pt-44 md:pt-52 pb-20">
      {/* Hero Section with Search */}
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Find your next stay
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search low prices on hotels, apartments and much more...
          </p>
        </div>
        
        {/* Featured Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto px-4">
        {category === 'hotels' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Hotels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hotels.map((hotel) => (
                <PropertyCard
                  key={hotel.id}
                  property={{
                    id: hotel.id,
                    title: hotel.name,
                    location: hotel.location,
                    price_per_night: hotel.price_per_night,
                    images: hotel.images
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {category === 'apartments' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Apartments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {apartments.map((apartment) => (
                <PropertyCard
                  key={apartment.id}
                  property={{
                    id: apartment.id,
                    title: apartment.name,
                    location: apartment.location,
                    price_per_night: apartment.price_per_night,
                    images: apartment.images
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {category === 'restaurants' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Restaurants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}