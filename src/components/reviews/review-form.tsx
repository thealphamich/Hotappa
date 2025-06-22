import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { StarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReviewFormProps {
  propertyId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ propertyId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/sign-in', { state: { from: window.location.pathname } });
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          property_id: propertyId,
          reviewer_id: profile.id,
          rating,
          comment: comment.trim()
        });

      if (reviewError) {
        if (reviewError.code === '23505') {
          throw new Error('You have already reviewed this property');
        }
        throw reviewError;
      }

      setComment('');
      setRating(0);
      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      console.error('Review error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              className="text-2xl focus:outline-none transition-colors"
            >
              <StarIcon
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          className="min-h-[120px]"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-500">
          {comment.length}/1000 characters
        </p>
        <Button 
          type="submit" 
          disabled={isSubmitting || rating === 0 || !comment.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}