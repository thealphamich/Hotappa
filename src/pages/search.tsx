import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../contexts/search-context';
import { PropertyCard } from '../components/property-card';
import { RestaurantCard } from '../components/restaurant-card';
import { SearchBar } from '../components/search/search-bar';
import { AdvancedFilters } from '../components/search/advanced-filters';
import { SortOptions } from '../components/search/sort-options';
import { PropertyMap } from '../components/search/property-map';
import { Button } from '../components/ui/button';
import { Map, List, Eye, EyeOff } from 'lucide-react';

export function Search() {
  const [searchParams] = useSearchParams();
  const { setFilters, search, results, isLoading } = useSearch();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedProperty, setSelectedProperty] = useState<string>();
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters({ propertyType: category.toLowerCase() as any });
      search();
    }
  }, [searchParams, setFilters, search]);

  // Sort results based on selected option
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price_per_night - b.price_per_night;
      case 'price_high':
        return b.price_per_night - a.price_per_night;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return 0;
    }
  });

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="container mx-auto px-4 py-4">
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${sortedResults.length} properties found`}
            </h1>
            <AdvancedFilters />
          </div>

          <div className="flex items-center gap-4">
            <SortOptions sortBy={sortBy} onSortChange={setSortBy} />
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="hidden lg:flex"
              >
                Split
              </Button>
            </div>

            {/* Mobile Map Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="lg:hidden"
            >
              {showMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Map
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Mobile Map Overlay */}
            {showMap && (
              <div className="lg:hidden fixed inset-0 z-50 bg-white">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Map View</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMap(false)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <PropertyMap
                      properties={sortedResults}
                      selectedProperty={selectedProperty}
                      onPropertySelect={handlePropertySelect}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Views */}
            <div className="hidden lg:block">
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedResults.map((property) => (
                    <div key={property.id}>
                      {property.type === 'restaurant' ? (
                        <RestaurantCard
                          restaurant={{
                            id: property.id,
                            name: property.title,
                            description: property.description || '',
                            location: property.location,
                            cuisine_type: property.cuisine_type || 'International',
                            rating: property.rating || 0,
                            images: property.images || []
                          }}
                        />
                      ) : (
                        <PropertyCard
                          property={{
                            id: property.id,
                            title: property.title,
                            location: property.location,
                            price_per_night: property.price_per_night,
                            images: property.images
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'map' && (
                <div className="h-[600px]">
                  <PropertyMap
                    properties={sortedResults}
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertySelect}
                    className="h-full"
                  />
                </div>
              )}

              {viewMode === 'split' && (
                <div className="grid grid-cols-2 gap-6 h-[600px]">
                  <div className="overflow-y-auto space-y-4">
                    {sortedResults.map((property) => (
                      <div
                        key={property.id}
                        className={`cursor-pointer transition-all ${
                          selectedProperty === property.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handlePropertySelect(property.id)}
                      >
                        {property.type === 'restaurant' ? (
                          <RestaurantCard
                            restaurant={{
                              id: property.id,
                              name: property.title,
                              description: property.description || '',
                              location: property.location,
                              cuisine_type: property.cuisine_type || 'International',
                              rating: property.rating || 0,
                              images: property.images || []
                            }}
                          />
                        ) : (
                          <PropertyCard
                            property={{
                              id: property.id,
                              title: property.title,
                              location: property.location,
                              price_per_night: property.price_per_night,
                              images: property.images
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="sticky top-0">
                    <PropertyMap
                      properties={sortedResults}
                      selectedProperty={selectedProperty}
                      onPropertySelect={handlePropertySelect}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sortedResults.map((property) => (
                  <div key={property.id}>
                    {property.type === 'restaurant' ? (
                      <RestaurantCard
                        restaurant={{
                          id: property.id,
                          name: property.title,
                          description: property.description || '',
                          location: property.location,
                          cuisine_type: property.cuisine_type || 'International',
                          rating: property.rating || 0,
                          images: property.images || []
                        }}
                      />
                    ) : (
                      <PropertyCard
                        property={{
                          id: property.id,
                          title: property.title,
                          location: property.location,
                          price_per_night: property.price_per_night,
                          images: property.images
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* No Results */}
            {sortedResults.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No properties found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}