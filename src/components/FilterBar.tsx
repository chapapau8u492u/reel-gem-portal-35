
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  availableTags, 
  selectedTags, 
  onTagToggle, 
  onClearFilters 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Filter Header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">Filters</span>
          </div>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            </div>
            
            <div className="flex flex-wrap gap-2 max-w-4xl">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 text-sm px-3 py-1.5 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md'
                      : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 border-gray-300'
                  }`}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear filters ({selectedTags.length})</span>
            </Button>
          )}
        </div>

        {/* Mobile Dropdown */}
        <div className="lg:hidden space-y-3">
          <Select onValueChange={onTagToggle}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category to filter" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Active filters:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer"
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
