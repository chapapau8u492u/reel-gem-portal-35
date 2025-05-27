
import React, { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstagramEmbedProps {
  embedUrl: string;
  thumbnail: string;
  caption: string;
}

const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ embedUrl, thumbnail, caption }) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const embedId = embedUrl.split('/p/')[1]?.replace('/', '');
  const embedCode = `https://www.instagram.com/p/${embedId}/embed/`;

  const handlePlayClick = () => {
    setIsLoading(true);
    setShowEmbed(true);
  };

  const handleOpenInstagram = () => {
    window.open(embedUrl, '_blank');
  };

  useEffect(() => {
    if (showEmbed) {
      // Instagram embed script
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Handle iframe load
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        document.body.removeChild(script);
      };
    }
  }, [showEmbed]);

  if (showEmbed) {
    return (
      <div className="relative aspect-[9/16] overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}
        <iframe
          src={embedCode}
          className="w-full h-full border-0"
          scrolling="no"
          allowTransparency={true}
          onLoad={() => setIsLoading(false)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          onClick={handleOpenInstagram}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-lg group cursor-pointer">
      <img 
        src={thumbnail} 
        alt={caption}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <Button
          size="lg"
          className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white"
          onClick={handlePlayClick}
        >
          <Play className="h-6 w-6 mr-2" />
          Play Reel
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleOpenInstagram}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InstagramEmbed;
