import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';
import { useSearch } from '../../contexts/search-context';

export function SearchBar() {
  const navigate = useNavigate();
  const { setFilters } = useSearch();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const handleSearch = () => {
    setFilters({
      location: location || undefined,
      checkIn,
      checkOut,
      guests: guests > 1 ? guests : undefined
    });
    navigate('/search');
  };

  return (
    <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 max-w-4xl mx-auto">
      {/* Location */}
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Where
            </label>
            <Input
              placeholder="Search destinations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-none p-0 text-sm placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-200" />

      {/* Check-in */}
      <div className="flex-1 px-6 py-4">
        <Popover open={showCheckInCalendar} onOpenChange={setShowCheckInCalendar}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check in
                </label>
                <div className="text-sm text-gray-600">
                  {checkIn ? format(checkIn, 'MMM d') : 'Add dates'}
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkIn}
              onSelect={(date) => {
                setCheckIn(date);
                setShowCheckInCalendar(false);
              }}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-8 w-px bg-gray-200" />

      {/* Check-out */}
      <div className="flex-1 px-6 py-4">
        <Popover open={showCheckOutCalendar} onOpenChange={setShowCheckOutCalendar}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check out
                </label>
                <div className="text-sm text-gray-600">
                  {checkOut ? format(checkOut, 'MMM d') : 'Add dates'}
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={checkOut}
              onSelect={(date) => {
                setCheckOut(date);
                setShowCheckOutCalendar(false);
              }}
              disabled={(date) => date < (checkIn || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-8 w-px bg-gray-200" />

      {/* Guests */}
      <div className="flex-1 px-6 py-4">
        <Popover open={showGuestSelector} onOpenChange={setShowGuestSelector}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Who
                </label>
                <div className="text-sm text-gray-600">
                  {guests === 1 ? '1 guest' : `${guests} guests`}
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Guests</div>
                  <div className="text-sm text-gray-500">Ages 13 or above</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{guests}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuests(guests + 1)}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Button */}
      <div className="pr-2">
        <Button
          onClick={handleSearch}
          className="rounded-full h-12 w-12 p-0 bg-[#DC2626] hover:bg-[#B91C1C]"
        >
          <Search className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
}