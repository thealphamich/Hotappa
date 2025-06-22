import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, 
  BedDouble, 
  UtensilsCrossed, 
  Plus, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Settings
} from 'lucide-react';

export function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h2 className="text-lg font-semibold mb-6">Dashboard</h2>
              
              <nav className="space-y-2">
                <Button
                  variant={isActive('/dashboard') && location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Overview
                </Button>
                
                <Button
                  variant={isActive('/dashboard/analytics') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/analytics')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                
                <Button
                  variant={isActive('/dashboard/bookings') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/bookings')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Bookings
                </Button>
                
                <Button
                  variant={isActive('/dashboard/messages') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/messages')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-2">Properties</p>
                  <Button
                    variant={isActive('/dashboard/hotels') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/hotels')}
                  >
                    <BedDouble className="mr-2 h-4 w-4" />
                    Hotels
                  </Button>
                  <Button
                    variant={isActive('/dashboard/apartments') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/apartments')}
                  >
                    <BedDouble className="mr-2 h-4 w-4" />
                    Apartments
                  </Button>
                  <Button
                    variant={isActive('/dashboard/restaurants') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/restaurants')}
                  >
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    Restaurants
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant={isActive('/dashboard/settings') ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </nav>

              <div className="pt-4">
                <Button className="w-full" onClick={() => navigate('/dashboard/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}