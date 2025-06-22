import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '../lib/supabase';
import type { Wishlist, WishlistWithItems } from '../lib/types';

interface WishlistContextType {
  wishlists: WishlistWithItems[];
  createWishlist: (name: string) => Promise<void>;
  addToWishlist: (wishlistId: string, propertyId: string) => Promise<void>;
  removeFromWishlist: (wishlistId: string, propertyId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWishlists();
    }
  }, [user]);

  const fetchWishlists = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          items:wishlist_items (
            *,
            property:properties (*)
          )
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      setWishlists(data || []);
    } catch (err) {
      setError('Failed to fetch wishlists');
      console.error('Wishlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createWishlist = async (name: string) => {
    if (!user) {
      setError('Please sign in to create a wishlist');
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

      const { error } = await supabase
        .from('wishlists')
        .insert({ name, user_id: profile.id });

      if (error) throw error;
      fetchWishlists();
    } catch (err) {
      setError('Failed to create wishlist');
      console.error('Wishlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (wishlistId: string, propertyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ wishlist_id: wishlistId, property_id: propertyId });

      if (error) throw error;
      fetchWishlists();
    } catch (err) {
      setError('Failed to add to wishlist');
      console.error('Wishlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string, propertyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ wishlist_id: wishlistId, property_id: propertyId });

      if (error) throw error;
      fetchWishlists();
    } catch (err) {
      setError('Failed to remove from wishlist');
      console.error('Wishlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlists,
      createWishlist,
      addToWishlist,
      removeFromWishlist,
      isLoading,
      error
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}