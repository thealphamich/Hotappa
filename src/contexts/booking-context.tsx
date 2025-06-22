import { createContext, useContext, useState } from 'react';
import { addDays, differenceInDays } from 'date-fns';
import { useAuth } from './auth-context';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/types';

interface BookingContextType {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  setCheckIn: (date: Date | undefined) => void;
  setCheckOut: (date: Date | undefined) => void;
  setGuests: (count: number) => void;
  calculateTotal: (property: Property) => number;
  createBooking: (property: Property) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (property: Property) => {
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    return property.price_per_night * nights;
  };

  const createBooking = async (property: Property) => {
    if (!user || !checkIn || !checkOut) {
      setError('Please sign in and select dates');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase.from('bookings').insert({
        property_id: property.id,
        guest_id: profile.id,
        check_in_date: checkIn.toISOString(),
        check_out_date: checkOut.toISOString(),
        total_price: calculateTotal(property),
        status: 'pending'
      });

      if (error) throw error;

      // Reset booking state
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuests(1);
    } catch (err) {
      setError('Failed to create booking');
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingContext.Provider value={{
      checkIn,
      checkOut,
      guests,
      setCheckIn,
      setCheckOut,
      setGuests,
      calculateTotal,
      createBooking,
      isLoading,
      error
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}