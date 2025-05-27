
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortDesc } from 'lucide-react';
import Header from '../components/Header';
import ReelCard from '../components/ReelCard';
import FilterBar from '../components/FilterBar';
import SortDropdown from '../components/SortDropdown';
import { fetchReelsFromDatabase, DatabaseReel } from '../services/reelService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [reels, setReels] = useState<DatabaseReel[]>([]);
  const [filteredReels, setFilteredReels] = useState<DatabaseReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setIsLoading(true);
      const data = await fetchReelsFromDatabase();
      setReels(data);
      setFilteredReels(data);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast({
        title: "Error",
        description: "Failed to load reels. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortReels();
  }, [reels, searchTerm, selectedCategories, sortBy]);

  const filterAndSortReels = () => {
    let filtered = [...reels];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reel =>
        reel.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reel.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reel.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(reel =>
        selectedCategories.some(category =>
          reel.tags?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      default:
        break;
    }

    setFilteredReels(filtered);
  };

  // Convert database reel to component reel format
  const convertToReelFormat = (dbReel: DatabaseReel) => ({
    id: dbReel.id.toString(),
    caption: dbReel.caption || '',
    thumbnail: dbReel.thumbnail_image_url || '',
    embedUrl: dbReel.instagram_video_url || '',
    productName: dbReel.product_name,
    affiliateLink: dbReel.affiliate_link,
    tags: dbReel.tags?.split(', ') || [],
    createdAt: new Date(dbReel.created_at)
  });

  // Get unique categories from all reels
  const allCategories = Array.from(
    new Set(
      reels.flatMap(reel => reel.tags?.split(', ') || [])
        .filter(tag => tag.trim())
    )
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover Amazing
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Products</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Curated from the best Instagram reels. Find your next favorite product with authentic reviews and recommendations.
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 lg:flex-none h-12 border-gray-200 hover:border-purple-400"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <FilterBar
                  categories={allCategories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredReels.length} of {reels.length} products
          </p>
          {(searchTerm || selectedCategories.length > 0) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategories([]);
              }}
              className="text-purple-600 hover:text-purple-700"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Reels Grid */}
        {filteredReels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReels.map((reel) => (
              <ReelCard 
                key={reel.id} 
                reel={convertToReelFormat(reel)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategories.length > 0 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No products have been added to the showcase yet."
                }
              </p>
              {(searchTerm || selectedCategories.length > 0) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
