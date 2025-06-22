import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PropertyCard } from '../../components/property-card';
import { Button } from '../../components/ui/button';
import { Calendar, Settings } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  images: string[];
  type: 'hotel' | 'apartment' | 'restaurant';
}

export function DashboardOverview() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!profile) return;

        const [hotels, apartments, restaurants] = await Promise.all([
          supabase
            .from('hotels')
            .select('*')
            .eq('host_id', profile.id),
          supabase
            .from('apartments')
            .select('*')
            .eq('host_id', profile.id),
          supabase
            .from('restaurants')
            .select('*')
            .eq('host_id', profile.id)
        ]);

        const allProperties = [
          ...(hotels.data || []).map(h => ({ ...h, type: 'hotel' as const })),
          ...(apartments.data || []).map(a => ({ ...a, type: 'apartment' as const })),
          ...(restaurants.data || []).map(r => ({ ...r, type: 'restaurant' as const }))
        ];

        setProperties(allProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Properties</h1>
        <Link to="/dashboard/new">
          <Button>Add New Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
          <Link to="/dashboard/new">
            <Button>List Your First Property</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard
                property={{
                  id: property.id,
                  title: property.name,
                  location: property.location,
                  price_per_night: property.price_per_night,
                  images: property.images
                }}
              />
              
              {/* Management Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Link to={`/dashboard/availability/${property.id}`}>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/dashboard/edit/${property.id}`}>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}