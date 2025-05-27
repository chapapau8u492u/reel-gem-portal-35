
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Reel } from '../types/reel';
import InstagramEmbed from './InstagramEmbed';

interface ReelCardProps {
  reel: Reel;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel }) => {
  return (
    <Card className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <InstagramEmbed 
        embedUrl={reel.embedUrl}
        thumbnail={reel.thumbnail}
        caption={reel.caption}
      />
      
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
