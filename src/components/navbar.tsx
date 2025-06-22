import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { SearchBar } from './search/search-bar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Menu } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/?category=${category.toLowerCase()}`);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        {/* Top Navigation */}
        <div className="h-20 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="/hotappa-icon.svg"
                alt="Hotappa"
                className="h-8"
              />
              <span className="text-2xl font-bold text-[#DC2626]">HOTAPPA</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="hidden md:flex"
              onClick={() => navigate('/dashboard/new')}
            >
              List Your Property
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full p-3 flex gap-2">
                    <Menu className="h-4 w-4" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuItem className="font-medium">Messages</DropdownMenuItem>
                  <DropdownMenuItem className="font-medium">Orders</DropdownMenuItem>
                  <DropdownMenuItem className="font-medium">Wishlists</DropdownMenuItem>
                  <DropdownMenuItem className="font-medium" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="border-t" onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => navigate('/sign-in')}>Sign in</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 py-4">
          <CategoryButton icon="🏨" label="Hotels" onClick={() => handleCategoryClick('Hotels')} />
          <CategoryButton icon="🏢" label="Apartments" onClick={() => handleCategoryClick('Apartments')} />
          <CategoryButton icon="🍽️" label="Restaurants" onClick={() => handleCategoryClick('Restaurants')} />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t bg-gray-50 p-4">
        <SearchBar />
      </div>
    </div>
  );
}

interface CategoryButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function CategoryButton({ icon, label, onClick }: CategoryButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 hover:border-gray-300 pb-2 border-b-2 border-transparent transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}