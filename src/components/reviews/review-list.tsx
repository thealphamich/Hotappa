import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string;
  };
}

interface ReviewListProps {
  propertyId: string;
}

export function ReviewList({ propertyId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');

  useEffect(() => {
    fetchReviews();
  }, [propertyId, sortBy]);

  const fetchReviews = async () => {
    try {
      const query = supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles(full_name, avatar_url)
        `)
        .eq('property_id', propertyId);

      if (sortBy === 'recent') {
        query.order('created_at', { ascending: false });
      } else {
        query.order('rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Review error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer.avatar_url} />
                <AvatarFallback>
                  {review.reviewer.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{review.reviewer.full_name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}