import { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth-context';
import { AvailabilityCalendar } from './availability-calendar';

interface AvailabilityManagerProps {
  propertyId: string;
  propertyType: 'hotel' | 'apartment' | 'restaurant';
}

interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string;
}

export function AvailabilityManager({ propertyId, propertyType }: AvailabilityManagerProps) {
  const { user } = useAuth();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockForm, setBlockForm] = useState({
    start_date: '',
    end_date: '',
    reason: 'other' as 'maintenance' | 'personal_use' | 'other',
    notes: ''
  });

  useEffect(() => {
    fetchBlockedDates();
  }, [propertyId, propertyType]);

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('property_id', propertyId)
        .eq('property_type', propertyType)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          property_id: propertyId,
          property_type: propertyType,
          start_date: blockForm.start_date,
          end_date: blockForm.end_date,
          reason: blockForm.reason,
          notes: blockForm.notes
        });

      if (error) throw error;

      setBlockForm({
        start_date: '',
        end_date: '',
        reason: 'other',
        notes: ''
      });
      setShowBlockForm(false);
      fetchBlockedDates();
    } catch (error) {
      console.error('Error blocking dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDates = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      fetchBlockedDates();
    } catch (error) {
      console.error('Error unblocking dates:', error);
    }
  };

  const toggleDateAvailability = async (date: Date, available: boolean) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (available) {
        // Remove from unavailable dates
        const { error } = await supabase
          .from('property_availability')
          .delete()
          .eq('property_id', propertyId)
          .eq('property_type', propertyType)
          .eq('date', dateStr);

        if (error) throw error;
      } else {
        // Add to unavailable dates
        const { error } = await supabase
          .from('property_availability')
          .upsert({
            property_id: propertyId,
            property_type: propertyType,
            date: dateStr,
            available: false
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Availability</h3>
        <Button onClick={() => setShowBlockForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Block Dates
        </Button>
      </div>

      {/* Block dates form */}
      {showBlockForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Block Dates</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBlockForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleBlockDates} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={blockForm.start_date}
                  min={format(startOfDay(new Date()), 'yyyy-MM-dd')}
                  onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={blockForm.end_date}
                  min={blockForm.start_date || format(startOfDay(new Date()), 'yyyy-MM-dd')}
                  onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Reason</Label>
              <Select
                value={blockForm.reason}
                onValueChange={(value: any) => setBlockForm({ ...blockForm, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="personal_use">Personal Use</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={blockForm.notes}
                onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Blocking...' : 'Block Dates'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBlockForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Blocked dates list */}
      {blockedDates.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Blocked Periods</h4>
          <div className="space-y-2">
            {blockedDates.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {format(new Date(block.start_date), 'MMM d, yyyy')} - {format(new Date(block.end_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {block.reason.replace('_', ' ')}
                    {block.notes && ` • ${block.notes}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnblockDates(block.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar view */}
      <div>
        <h4 className="font-medium mb-3">Calendar View</h4>
        <AvailabilityCalendar
          propertyId={propertyId}
          propertyType={propertyType}
          isSelectable={false}
        />
      </div>
    </div>
  );
}