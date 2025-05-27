
import React from 'react';
import { Search, Instagram, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchQuery = '', onSearchChange, showSearch = true }) => {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg group-hover:scale-105 transition-transform">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ReelShowcase
            </span>
          </div>

          {showSearch && (
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search reels, products, or tags..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </form>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/admin/login')}
            className="flex items-center space-x-2 hover:bg-purple-50 hover:border-purple-300"
          >
            <User className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
