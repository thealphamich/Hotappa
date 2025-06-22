import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { PropertyMap } from '../components/map/property-map';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  cuisine_type: string;
  price_range: string;
  rating: number;
  images: string[];
  menu_items: MenuItem[];
}

export function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchRestaurantDetails() {
      if (!id) {
        setError('Restaurant ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            *,
            menu_items (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setRestaurant(data);
      } catch (err) {
        setError('Failed to load restaurant details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurantDetails();
  }, [id]);

  const handleOrder = async (menuItem: MenuItem) => {
    // Here you would implement the order functionality
    // For now, we'll just show an alert
    alert(`Ordered: ${menuItem.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Restaurant not found'}</div>
      </div>
    );
  }

  const categories = ['all', ...new Set(restaurant.menu_items.map(item => item.category))];
  const filteredMenuItems = selectedCategory === 'all'
    ? restaurant.menu_items
    : restaurant.menu_items.filter(item => item.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">{restaurant.name}</h1>
          <p className="text-gray-600 mb-4">{restaurant.description}</p>
          <div className="flex items-center mb-4">
            <span className="font-semibold mr-2">Cuisine:</span>
            <span>{restaurant.cuisine_type}</span>
          </div>
          <div className="flex items-center mb-4">
            <span className="font-semibold mr-2">Price Range:</span>
            <span>{restaurant.price_range}</span>
          </div>
          <div className="flex items-center mb-4">
            <span className="font-semibold mr-2">Rating:</span>
            <span>{restaurant.rating} ⭐</span>
          </div>
        </div>
        
        <div className="h-64 md:h-full">
          <PropertyMap location={restaurant.location} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={item.image_url || 'https://placehold.co/600x400?text=No+Image'}
                  alt={item.name}
                  className="rounded-lg object-cover w-full h-48"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                <Button onClick={() => handleOrder(item)}>Order Now</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}