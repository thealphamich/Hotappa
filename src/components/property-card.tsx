import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Card, CardContent } from './ui/card';
import { Heart } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price_per_night: number;
    images?: string[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link to={`/property/${property.id}`}>
      <Card className="group overflow-hidden border-none">
        <CardContent className="p-0 space-y-2">
          <div className="relative">
            <AspectRatio ratio={1}>
              <img
                src={property.images?.[0] || 'https://placehold.co/600x600?text=No+Image'}
                alt={property.title}
                className="object-cover w-full h-full rounded-xl"
              />
            </AspectRatio>
            <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="px-1 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium line-clamp-1">{property.title}</h3>
              <div className="flex items-center gap-1">
                <span>★</span>
                <span>4.85</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{property.location}</p>
            <p className="text-sm text-gray-600">Jun 17-24</p>
            <p>
              <span className="font-medium">${property.price_per_night}</span>
              <span className="text-gray-600"> night</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}