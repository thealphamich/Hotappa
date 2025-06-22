import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

export function NewProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price_per_night: '',
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const propertyData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        host_id: session.user.id,
      };

      let { error } = await supabase
        .from(propertyType)
        .insert([propertyData]);

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotels">Hotel</SelectItem>
              <SelectItem value="apartments">Apartment</SelectItem>
              <SelectItem value="restaurants">Restaurant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price per night</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price_per_night}
            onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
            required
          />
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={loading || !propertyType}>
            {loading ? 'Creating...' : 'Create Property'}
          </Button>
        </div>
      </form>
    </div>
  );
}