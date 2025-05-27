
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  onSortChange: (sortOption: string) => void;
  currentSort: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSortChange, currentSort }) => {
  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="h-4 w-4 text-gray-500" />
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="name">Product Name</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
