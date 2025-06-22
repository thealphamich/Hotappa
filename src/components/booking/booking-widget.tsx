import { useState } from 'react';
import { differenceInDays, format } from 'date-fns';
import { Calendar, Users, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AvailabilityCalendar } from '../calendar/availability-calendar';
import { useBooking } from '../../contexts/booking-context';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../lib/supabase';

interface BookingWidgetProps {
  property: {
    id: string;
    name: string;
    price_per_night: number;
    minimum_stay?: number;
    max_guests?: number;
    total_rooms?: number;
  };
  propertyType: 'hotel' | 'apartment' | 'restaurant';
}

export function BookingWidget({ property, propertyType }: BookingWidgetProps) {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<{ checkIn?: Date; checkOut?: Date }>({});
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nights = selectedDates.checkIn && selectedDates.checkOut 
    ? differenceInDays(selectedDates.checkOut, selectedDates.checkIn)
    : 0;

  const totalPrice = nights * property.price_per_night;
  const serviceFee = totalPrice * 0.1; // 10% service fee
  const finalTotal = totalPrice + serviceFee;

  const handleBooking = async () => {
    if (!user) {
      // Redirect to sign in
      window.location.href = '/sign-in';
      return;
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (property.minimum_stay && nights < property.minimum_stay) {
      setError(`Minimum stay is ${property.minimum_stay} nights`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check availability
      const { data: isAvailable } = await supabase.rpc('check_property_availability', {
        p_property_id: property.id,
        p_property_type: propertyType,
        p_start_date: format(selectedDates.checkIn, 'yyyy-MM-dd'),
        p_end_date: format(selectedDates.checkOut, 'yyyy-MM-dd')
      });

      if (!isAvailable) {
        setError('Selected dates are not available');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setError('Profile not found');
        return;
      }

      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          guest_id: profile.id,
          check_in_date: format(selectedDates.checkIn, 'yyyy-MM-dd'),
          check_out_date: format(selectedDates.checkOut, 'yyyy-MM-dd'),
          total_price: finalTotal,
          status: 'pending'
        });

      if (bookingError) throw bookingError;

      // Block the dates
      const { error: blockError } = await supabase
        .from('property_availability')
        .upsert(
          Array.from({ length: nights }, (_, i) => ({
            property_id: property.id,
            property_type: propertyType,
            date: format(
              new Date(selectedDates.checkIn!.getTime() + i * 24 * 60 * 60 * 1000),
              'yyyy-MM-dd'
            ),
            available: false,
            notes: 'Booked'
          }))
        );

      if (blockError) throw blockError;

      // Success - redirect to booking confirmation
      alert('Booking successful! You will receive a confirmation email shortly.');
      setSelectedDates({});
      setGuests(1);
      
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-lg sticky top-24">
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">${property.price_per_night}</span>
          <span className="text-gray-600">night</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto p-3"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            <div className="flex-1">
              {selectedDates.checkIn && selectedDates.checkOut ? (
                <div>
                  <div className="font-medium">
                    {format(selectedDates.checkIn, 'MMM d')} - {format(selectedDates.checkOut, 'MMM d')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {nights} night{nights !== 1 ? 's' : ''}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Select dates</div>
                  <div className="text-sm text-gray-500">Add your travel dates</div>
                </div>
              )}
            </div>
          </Button>
        </div>

        {/* Calendar */}
        {showCalendar && (
          <div className="border rounded-lg">
            <AvailabilityCalendar
              propertyId={property.id}
              propertyType={propertyType}
              selectedDates={selectedDates}
              onDateSelect={setSelectedDates}
              isSelectable={true}
            />
          </div>
        )}

        {/* Guests */}
        <div>
          <Label htmlFor="guests">Guests</Label>
          <div className="flex items-center gap-2 mt-1">
            <Users className="h-4 w-4 text-gray-400" />
            <Input
              id="guests"
              type="number"
              min="1"
              max={property.max_guests || 10}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
          {property.max_guests && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum {property.max_guests} guests
            </p>
          )}
        </div>

        {/* Pricing Breakdown */}
        {nights > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>${property.price_per_night} × {nights} nights</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Button
          className="w-full"
          onClick={handleBooking}
          disabled={loading || !selectedDates.checkIn || !selectedDates.checkOut}
        >
          {loading ? (
            'Processing...'
          ) : !user ? (
            'Sign in to book'
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Reserve
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500">
          You won't be charged yet
        </div>

        {property.minimum_stay && property.minimum_stay > 1 && (
          <div className="text-sm text-gray-600">
            Minimum stay: {property.minimum_stay} nights
          </div>
        )}
      </div>
    </div>
  );
}