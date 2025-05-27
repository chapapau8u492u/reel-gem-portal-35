
import React, { useState, useMemo } from 'react';
import { Instagram } from 'lucide-react';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import SortDropdown from '../components/SortDropdown';
import ReelCard from '../components/ReelCard';
import { mockReels } from '../data/mockReels';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    mockReels.forEach(reel => {
      reel.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const filteredAndSortedReels = useMemo(() => {
    let filtered = mockReels.filter(reel => {
      const matchesSearch = searchQuery === '' || 
        reel.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => reel.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'popular':
          // Mock popularity based on id for demo
          return parseInt(a.id) - parseInt(b.id);
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedTags, sortOption]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <FilterBar
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearFilters={handleClearFilters}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Curated reels featuring the best products from top creators. Find your next favorite gadget, beauty product, or lifestyle upgrade.
          </p>
        </div>

        {filteredAndSortedReels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Instagram className="h-16 w-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reels found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-gray-600 font-medium">
                Showing {filteredAndSortedReels.length} reel{filteredAndSortedReels.length !== 1 ? 's' : ''}
                {selectedTags.length > 0 && (
                  <span className="text-purple-600 ml-1">
                    in {selectedTags.length} categor{selectedTags.length !== 1 ? 'ies' : 'y'}
                  </span>
                )}
              </p>
              <SortDropdown 
                onSortChange={setSortOption}
                currentSort={sortOption}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedReels.map((reel) => (
                <ReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
