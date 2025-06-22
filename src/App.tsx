import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { Home } from './pages/home';
import { PropertyDetails } from './pages/property-details';
import { RestaurantDetails } from './pages/restaurant-details';
import { Search } from './pages/search';
import { SignIn } from './pages/auth/sign-in';
import { DashboardLayout } from './pages/dashboard/layout';
import { DashboardOverview } from './pages/dashboard/overview';
import { Analytics } from './pages/dashboard/analytics';
import { Bookings } from './pages/dashboard/bookings';
import { Messages } from './pages/dashboard/messages';
import { PropertyAvailability } from './pages/dashboard/availability';
import { NewProperty } from './pages/dashboard/new';
import { AuthProvider } from './contexts/auth-context';
import { BookingProvider } from './contexts/booking-context';
import { WishlistProvider } from './contexts/wishlist-context';
import { MessagingProvider } from './contexts/messaging-context';
import { SearchProvider } from './contexts/search-context';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BookingProvider>
          <WishlistProvider>
            <MessagingProvider>
              <Router>
                <div className="min-h-screen bg-background flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/property/:id" element={<PropertyDetails />} />
                      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                      <Route path="/sign-in" element={<SignIn />} />
                      <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardOverview />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="bookings" element={<Bookings />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="availability/:id" element={<PropertyAvailability />} />
                        <Route path="new" element={<NewProperty />} />
                      </Route>
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </MessagingProvider>
          </WishlistProvider>
        </BookingProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;