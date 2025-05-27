
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import ReelCard from '../components/ReelCard';
import { mockReels } from '../data/mockReels';
import { Instagram } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    mockReels.forEach(reel => {
      reel.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const filteredReels = useMemo(() => {
    return mockReels.filter(reel => {
      const matchesSearch = searchQuery === '' || 
        reel.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => reel.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-gray-600">
              Results for "{searchQuery}"
            </p>
          )}
        </div>

        {filteredReels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Instagram className="h-16 w-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reels found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Found {filteredReels.length} reel{filteredReels.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredReels.map((reel) => (
                <ReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Search;
