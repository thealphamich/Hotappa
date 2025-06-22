import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface AvailabilityData {
  date: string;
  available: boolean;
  price_override: number | null;
  minimum_stay_override: number | null;
  blocked: boolean;
  block_reason: string | null;
}

interface AvailabilityCalendarProps {
  propertyId: string;
  propertyType: 'hotel' | 'apartment' | 'restaurant';
  selectedDates?: {
    checkIn?: Date;
    checkOut?: Date;
  };
  onDateSelect?: (dates: { checkIn?: Date; checkOut?: Date }) => void;
  isSelectable?: boolean;
  className?: string;
}

export function AvailabilityCalendar({
  propertyId,
  propertyType,
  selectedDates,
  onDateSelect,
  isSelectable = false,
  className
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, propertyId, propertyType]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(addMonths(currentMonth, 2)); // Show 3 months

      const { data, error } = await supabase.rpc('get_property_calendar', {
        p_property_id: propertyId,
        p_property_type: propertyType,
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd')
      });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    if (!isSelectable || !onDateSelect) return;

    const today = startOfDay(new Date());
    if (isBefore(date, today)) return;

    const dateAvailability = availability.find(a => 
      isSameDay(new Date(a.date), date)
    );

    if (!dateAvailability?.available) return;

    if (!selectedDates?.checkIn || selectingCheckOut) {
      if (!selectedDates?.checkIn) {
        // First selection - set check-in
        onDateSelect({ checkIn: date });
        setSelectingCheckOut(true);
      } else {
        // Second selection - set check-out
        if (isBefore(date, selectedDates.checkIn)) {
          // If selected date is before check-in, reset and set as new check-in
          onDateSelect({ checkIn: date });
          setSelectingCheckOut(true);
        } else {
          // Set as check-out
          onDateSelect({ ...selectedDates, checkOut: date });
          setSelectingCheckOut(false);
        }
      }
    } else {
      // Reset selection
      onDateSelect({ checkIn: date });
      setSelectingCheckOut(true);
    }
  };

  const getDayStatus = (date: Date) => {
    const dateAvailability = availability.find(a => 
      isSameDay(new Date(a.date), date)
    );

    const today = startOfDay(new Date());
    const isPast = isBefore(date, today);
    const isAvailable = dateAvailability?.available ?? true;
    const isBlocked = dateAvailability?.blocked ?? false;

    if (isPast) return 'past';
    if (isBlocked) return 'blocked';
    if (!isAvailable) return 'unavailable';
    return 'available';
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDates) return false;
    
    if (selectedDates.checkIn && isSameDay(date, selectedDates.checkIn)) return true;
    if (selectedDates.checkOut && isSameDay(date, selectedDates.checkOut)) return true;
    
    // Check if date is in range
    if (selectedDates.checkIn && selectedDates.checkOut) {
      return date > selectedDates.checkIn && date < selectedDates.checkOut;
    }
    
    return false;
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div key={format(monthDate, 'yyyy-MM')} className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={index} className="h-10" />
          ))}
          
          {/* Month days */}
          {days.map(day => {
            const status = getDayStatus(day);
            const isSelected = isDateSelected(day);
            const isCheckIn = selectedDates?.checkIn && isSameDay(day, selectedDates.checkIn);
            const isCheckOut = selectedDates?.checkOut && isSameDay(day, selectedDates.checkOut);

            return (
              <button
                key={format(day, 'yyyy-MM-dd')}
                onClick={() => handleDateClick(day)}
                disabled={!isSelectable || status === 'past' || status === 'blocked' || status === 'unavailable'}
                className={cn(
                  'h-10 text-sm rounded-md transition-colors relative',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary',
                  {
                    // Base styles
                    'bg-white text-gray-900': status === 'available',
                    'bg-gray-100 text-gray-400 cursor-not-allowed': status === 'past',
                    'bg-red-100 text-red-600 cursor-not-allowed': status === 'blocked',
                    'bg-yellow-100 text-yellow-700 cursor-not-allowed': status === 'unavailable',
                    
                    // Selection styles
                    'bg-primary text-white': isCheckIn || isCheckOut,
                    'bg-primary/20': isSelected && !isCheckIn && !isCheckOut,
                    
                    // Today highlight
                    'ring-2 ring-primary ring-opacity-50': isToday(day) && !isSelected,
                  }
                )}
              >
                {format(day, 'd')}
                
                {/* Price override indicator */}
                {availability.find(a => isSameDay(new Date(a.date), day))?.price_override && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg p-6', className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold">
          {isSelectable ? 'Select Dates' : 'Availability Calendar'}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span>Selected</span>
        </div>
      </div>

      {/* Calendar months */}
      <div className="space-y-8">
        {[currentMonth, addMonths(currentMonth, 1), addMonths(currentMonth, 2)].map(renderMonth)}
      </div>

      {/* Selection summary */}
      {isSelectable && selectedDates && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Dates:</h4>
          <div className="text-sm text-gray-600">
            {selectedDates.checkIn && (
              <p>Check-in: {format(selectedDates.checkIn, 'MMM d, yyyy')}</p>
            )}
            {selectedDates.checkOut && (
              <p>Check-out: {format(selectedDates.checkOut, 'MMM d, yyyy')}</p>
            )}
            {!selectedDates.checkIn && (
              <p>Select your check-in date</p>
            )}
            {selectedDates.checkIn && !selectedDates.checkOut && (
              <p>Select your check-out date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}