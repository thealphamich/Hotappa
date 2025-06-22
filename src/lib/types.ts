import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Hotel = Database['public']['Tables']['hotels']['Row'];
export type Apartment = Database['public']['Tables']['apartments']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];

export interface PropertyWithHost extends Property {
  host: Profile;
}

export interface BookingWithProperty extends Booking {
  property: Property;
}

export interface RestaurantWithMenu extends Restaurant {
  menu_items: MenuItem[];
}

export interface ConversationWithParticipants extends Conversation {
  guest: Profile;
  host: Profile;
  property: Property;
  messages: Message[];
}

export interface WishlistWithItems extends Wishlist {
  items: (WishlistItem & {
    property: Property;
  })[];
}

export interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyType?: 'hotel' | 'apartment' | 'restaurant';
  amenities?: string[];
  rating?: number;
  categories?: string[];
  bedrooms?: number;
  cuisineType?: string;
}

export interface PropertySearchResult {
  id: string;
  title: string;
  name?: string;
  description?: string;
  location: string;
  price_per_night: number;
  images?: string[];
  rating?: number;
  amenities?: string[];
  categories?: string[];
  type: 'hotel' | 'apartment' | 'restaurant';
  cuisine_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  created_at?: string;
}

export type Order = {
  id: string;
  restaurantId: string;
  userId: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered';
  deliveryAddress: string;
  createdAt: string;
};