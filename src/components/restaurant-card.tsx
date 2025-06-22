import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    location: string;
    cuisine_type: string;
    rating: number;
    images: string[];
  };
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <Card className="group overflow-hidden border-none">
        <CardContent className="p-0 space-y-2">
          <div className="relative">
            <AspectRatio ratio={4/3}>
              <img
                src={restaurant.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                alt={restaurant.name}
                className="object-cover w-full h-full rounded-xl"
              />
            </AspectRatio>
            {restaurant.rating && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/90 flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="px-1 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium line-clamp-1">{restaurant.name}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{restaurant.location}</p>
            <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{restaurant.description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}