import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth-context';
import { AvailabilityManager } from '../../components/calendar/availability-manager';

interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'apartment' | 'restaurant';
}

export function PropertyAvailability() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    fetchProperty();
  }, [user, id]);

  const fetchProperty = async () => {
    try {
      // Check if user owns this property
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Try to find the property in all tables
      const [hotelResult, apartmentResult, restaurantResult] = await Promise.all([
        supabase.from('hotels').select('id, name').eq('id', id).eq('host_id', profile.id).maybeSingle(),
        supabase.from('apartments').select('id, name').eq('id', id).eq('host_id', profile.id).maybeSingle(),
        supabase.from('restaurants').select('id, name').eq('id', id).eq('host_id', profile.id).maybeSingle()
      ]);

      if (hotelResult.data) {
        setProperty({ ...hotelResult.data, type: 'hotel' });
      } else if (apartmentResult.data) {
        setProperty({ ...apartmentResult.data, type: 'apartment' });
      } else if (restaurantResult.data) {
        setProperty({ ...restaurantResult.data, type: 'restaurant' });
      } else {
        setError('Property not found or you do not have permission to manage it');
      }
    } catch (err) {
      setError('Failed to load property');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Property not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Availability Management</h1>
        <p className="text-gray-600">{property.name}</p>
      </div>

      <AvailabilityManager
        propertyId={property.id}
        propertyType={property.type}
      />
    </div>
  );
}