
interface InstagramReelData {
  caption: string;
  thumbnail: string;
  embedUrl: string;
  id: string;
}

export const extractInstagramData = async (instagramUrl: string): Promise<InstagramReelData | null> => {
  try {
    console.log('Extracting Instagram data from:', instagramUrl);
    
    // Extract reel ID from URL
    const reelMatch = instagramUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
    if (!reelMatch) {
      throw new Error('Invalid Instagram URL format');
    }
    
    const reelId = reelMatch[1];
    
    // Get mock data with proper thumbnails
    const mockData = getMockInstagramData(reelId);
    
    return {
      caption: mockData.caption,
      thumbnail: mockData.thumbnail,
      embedUrl: instagramUrl,
      id: reelId
    };
  } catch (error) {
    console.error('Error extracting Instagram data:', error);
    return null;
  }
};

// Enhanced mock data with working thumbnail URLs
const getMockInstagramData = (reelId: string) => {
  const mockDataMap: Record<string, { caption: string; thumbnail: string }> = {
    'DJt_Q2IxQ8L': {
      caption: 'Amazing wireless charging setup! This sleek charging pad keeps my desk organized and my devices powered up 24/7. Perfect for tech enthusiasts who want a clean workspace 🔌⚡ #TechSetup #WirelessCharging #DeskGoals',
      thumbnail: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=600&fit=crop&crop=center'
    },
    'DJ1tnuLR0s8': {
      caption: 'Skincare routine that actually works! ✨ This vitamin C serum transformed my skin in just 30 days. The glow is real! Perfect for morning routine to protect against environmental damage 🌟 #SkincareRoutine #VitaminC #GlowUp',
      thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=600&fit=crop&crop=center'
    },
    'DJ4SbiURkgC': {
      caption: 'Perfect coffee setup for work from home! ☕ This compact espresso machine makes café-quality drinks right at my desk. Game changer for productivity and my daily caffeine fix 🚀 #CoffeeSetup #WorkFromHome #EspressoLife',
      thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop&crop=center'
    },
    'DJ63MqjxJRp': {
      caption: 'Fitness game changer! 💪 These resistance bands give you a full gym workout at home. Perfect for building strength and staying fit without expensive equipment. Amazing results! 🏋️‍♂️ #HomeFitness #ResistanceBands #WorkoutMotivation',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center'
    },
    'DJ9cA6oxMTv': {
      caption: 'Travel essential! 📱 This portable phone stand is perfect for video calls and content creation. Adjustable, sturdy, and fits in your pocket. Never miss a good angle again! ✈️ #TravelGadgets #PhoneStand #ContentCreator',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop&crop=center'
    },
    'DKAAxwUxiVK': {
      caption: 'Must-have kitchen gadget! 🍳 This air fryer makes healthy cooking so easy and delicious. Crispy results with minimal oil. Perfect for quick meals and healthy lifestyle! 🥗 #AirFryer #HealthyCooking #KitchenGadgets',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&crop=center'
    }
  };

  return mockDataMap[reelId] || {
    caption: 'Check out this amazing product! Perfect for your lifestyle 🔥',
    thumbnail: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=600&fit=crop&crop=center'
  };
};

export const syncInstagramProfile = async (profileUsername: string, existingReelIds: string[]) => {
  console.log('Syncing Instagram profile:', profileUsername);
  console.log('Existing reel IDs to skip:', existingReelIds);
  
  // Demo URLs for the provided reels
  const allProfileReels = [
    'https://www.instagram.com/p/DJt_Q2IxQ8L/',
    'https://www.instagram.com/p/DJ1tnuLR0s8/',
    'https://www.instagram.com/p/DJ4SbiURkgC/',
    'https://www.instagram.com/p/DJ63MqjxJRp/',
    'https://www.instagram.com/p/DJ9cA6oxMTv/',
    'https://www.instagram.com/p/DKAAxwUxiVK/'
  ];
  
  // Filter out reels that already exist
  const newReels = [];
  
  for (const reelUrl of allProfileReels) {
    const reelMatch = reelUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
    if (reelMatch) {
      const reelId = reelMatch[1];
      if (!existingReelIds.includes(reelId)) {
        const data = await extractInstagramData(reelUrl);
        if (data) {
          newReels.push(data);
        }
      } else {
        console.log('Skipping existing reel:', reelId);
      }
    }
  }
  
  console.log(`Found ${newReels.length} new reels from profile @${profileUsername}`);
  return newReels;
};

export const syncInstagramReels = async (instagramUrls: string[]) => {
  console.log('Starting Instagram sync for URLs:', instagramUrls);
  
  const results = [];
  
  for (const url of instagramUrls) {
    const data = await extractInstagramData(url);
    if (data) {
      results.push(data);
    }
  }
  
  console.log('Instagram sync completed, extracted:', results.length, 'reels');
  return results;
};
