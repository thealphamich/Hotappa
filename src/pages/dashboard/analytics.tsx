import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Star,
  Users,
  Eye,
  MessageSquare,
  BarChart3,
  PieChart
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  averageRating: number;
  ratingChange: number;
  occupancyRate: number;
  occupancyChange: number;
  totalViews: number;
  viewsChange: number;
  totalMessages: number;
  messagesChange: number;
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByProperty: { property: string; bookings: number; revenue: number }[];
  ratingsByProperty: { property: string; rating: number; reviews: number }[];
  upcomingBookings: any[];
  recentReviews: any[];
}

export function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        case '90d':
          startDate = subDays(endDate, 90);
          break;
        case '1y':
          startDate = subDays(endDate, 365);
          break;
        default:
          startDate = subDays(endDate, 30);
      }

      // Get all properties owned by the host
      const [hotelsResult, apartmentsResult, restaurantsResult] = await Promise.all([
        supabase.from('hotels').select('id, name').eq('host_id', profile.id),
        supabase.from('apartments').select('id, name').eq('host_id', profile.id),
        supabase.from('restaurants').select('id, name').eq('host_id', profile.id)
      ]);

      const allProperties = [
        ...(hotelsResult.data || []).map(p => ({ ...p, type: 'hotel' })),
        ...(apartmentsResult.data || []).map(p => ({ ...p, type: 'apartment' })),
        ...(restaurantsResult.data || []).map(p => ({ ...p, type: 'restaurant' }))
      ];

      if (allProperties.length === 0) {
        setAnalytics({
          totalRevenue: 0,
          revenueChange: 0,
          totalBookings: 0,
          bookingsChange: 0,
          averageRating: 0,
          ratingChange: 0,
          occupancyRate: 0,
          occupancyChange: 0,
          totalViews: 0,
          viewsChange: 0,
          totalMessages: 0,
          messagesChange: 0,
          revenueByMonth: [],
          bookingsByProperty: [],
          ratingsByProperty: [],
          upcomingBookings: [],
          recentReviews: []
        });
        return;
      }

      const propertyIds = allProperties.map(p => p.id);

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(*)
        `)
        .in('property_id', propertyIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch reviews data
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          property:properties(name)
        `)
        .in('property_id', propertyIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch conversations/messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(*)
        `)
        .eq('host_id', profile.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate analytics
      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
      const totalBookings = bookings?.length || 0;
      const averageRating = reviews?.length ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
      const totalMessages = conversations?.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0) || 0;

      // Generate mock data for demonstration
      const revenueByMonth = generateMonthlyRevenue(bookings || []);
      const bookingsByProperty = generatePropertyBookings(allProperties, bookings || []);
      const ratingsByProperty = generatePropertyRatings(allProperties, reviews || []);

      // Get upcoming bookings
      const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(name),
          guest:profiles(full_name)
        `)
        .in('property_id', propertyIds)
        .gte('check_in_date', format(new Date(), 'yyyy-MM-dd'))
        .order('check_in_date', { ascending: true })
        .limit(5);

      // Get recent reviews
      const { data: recentReviews } = await supabase
        .from('reviews')
        .select(`
          *,
          property:properties(name),
          reviewer:profiles(full_name)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(5);

      setAnalytics({
        totalRevenue,
        revenueChange: Math.random() * 20 - 10, // Mock change percentage
        totalBookings,
        bookingsChange: Math.random() * 30 - 15,
        averageRating,
        ratingChange: Math.random() * 0.5 - 0.25,
        occupancyRate: Math.random() * 40 + 60, // Mock occupancy rate
        occupancyChange: Math.random() * 10 - 5,
        totalViews: Math.floor(Math.random() * 1000 + 500), // Mock views
        viewsChange: Math.random() * 25 - 12.5,
        totalMessages,
        messagesChange: Math.random() * 20 - 10,
        revenueByMonth,
        bookingsByProperty,
        ratingsByProperty,
        upcomingBookings: upcomingBookings || [],
        recentReviews: recentReviews || []
      });

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (bookings: any[]) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const revenue = monthBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
      
      months.push({
        month: format(date, 'MMM'),
        revenue
      });
    }
    return months;
  };

  const generatePropertyBookings = (properties: any[], bookings: any[]) => {
    return properties.map(property => {
      const propertyBookings = bookings.filter(booking => booking.property_id === property.id);
      const revenue = propertyBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
      
      return {
        property: property.name,
        bookings: propertyBookings.length,
        revenue
      };
    });
  };

  const generatePropertyRatings = (properties: any[], reviews: any[]) => {
    return properties.map(property => {
      const propertyReviews = reviews.filter(review => review.property_id === property.id);
      const averageRating = propertyReviews.length ? 
        propertyReviews.reduce((sum, review) => sum + review.rating, 0) / propertyReviews.length : 0;
      
      return {
        property: property.name,
        rating: averageRating,
        reviews: propertyReviews.length
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your property performance and revenue</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          change={analytics.revenueChange}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Bookings"
          value={analytics.totalBookings.toString()}
          change={analytics.bookingsChange}
          icon={Calendar}
        />
        <MetricCard
          title="Average Rating"
          value={analytics.averageRating.toFixed(1)}
          change={analytics.ratingChange}
          icon={Star}
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          change={analytics.occupancyChange}
          icon={Users}
        />
        <MetricCard
          title="Profile Views"
          value={analytics.totalViews.toLocaleString()}
          change={analytics.viewsChange}
          icon={Eye}
        />
        <MetricCard
          title="Messages"
          value={analytics.totalMessages.toString()}
          change={analytics.messagesChange}
          icon={MessageSquare}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.revenueByMonth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.max(10, (month.revenue / Math.max(...analytics.revenueByMonth.map(m => m.revenue))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">${month.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Property Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.bookingsByProperty.slice(0, 5).map((property, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{property.property}</span>
                    <span className="text-sm text-gray-600">{property.bookings} bookings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max(10, (property.revenue / Math.max(...analytics.bookingsByProperty.map(p => p.revenue))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">${property.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.upcomingBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
              ) : (
                analytics.upcomingBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.property?.name}</p>
                      <p className="text-sm text-gray-600">{booking.guest?.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.check_in_date), 'MMM d')} - {format(new Date(booking.check_out_date), 'MMM d')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(booking.total_price).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent reviews</p>
              ) : (
                analytics.recentReviews.map((review, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.reviewer?.full_name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.created_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.property?.name}</p>
                    {review.comment && (
                      <p className="text-sm mt-2 line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}