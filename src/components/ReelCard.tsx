
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';
import { Reel } from '../types/reel';

interface ReelCardProps {
  reel: Reel;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel }) => {
  return (
    <Card className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[9/16] overflow-hidden">
        <img 
          src={reel.thumbnail} 
          alt={reel.caption}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="lg"
            className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
            onClick={() => window.open(reel.embedUrl, '_blank')}
          >
            <Play className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {reel.caption}
        </p>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">{reel.productName}</h3>
          
          <div className="flex flex-wrap gap-1">
            {reel.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
            onClick={() => window.open(reel.affiliateLink, '_blank')}
          >
            Shop Now <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReelCard;
