
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Instagram API credentials from environment
const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID');
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET');
const REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, username, accessToken } = await req.json();
    console.log('Instagram API action:', action);

    if (action === 'getAuthUrl') {
      // Generate Instagram OAuth URL
      if (!INSTAGRAM_APP_ID || !REDIRECT_URI) {
        return new Response(
          JSON.stringify({ error: 'Instagram app credentials not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI!)}&scope=user_profile,user_media&response_type=code`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchangeCode') {
      // Exchange authorization code for access token
      if (!code || !INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET || !REDIRECT_URI) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters for token exchange' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenData);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code for access token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get long-lived access token
      const longLivedTokenResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`);
      const longLivedTokenData = await longLivedTokenResponse.json();

      return new Response(
        JSON.stringify({ 
          accessToken: longLivedTokenData.access_token || tokenData.access_token,
          userId: tokenData.user_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'fetchMedia') {
      // Fetch user media using access token
      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: 'Access token required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user profile first
      const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        console.error('Profile fetch failed:', profileData);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user media
      const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`);
      const mediaData = await mediaResponse.json();

      if (!mediaResponse.ok) {
        console.error('Media fetch failed:', mediaData);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user media' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if creator exists, if not create them
      let { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('instagram_handle', profileData.username)
        .single();

      if (creatorError && creatorError.code === 'PGRST116') {
        const { data: newCreator, error: insertError } = await supabase
          .from('creators')
          .insert({
            name: profileData.username,
            instagram_handle: profileData.username,
            tier: 'Free'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating creator:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create creator' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        creator = newCreator;
      }

      // Process media and save to database
      const reelsData = [];
      
      for (const media of mediaData.data || []) {
        // Only process video content (reels)
        if (media.media_type === 'VIDEO') {
          // Check if this reel already exists
          const { data: existingReel } = await supabase
            .from('reels')
            .select('id')
            .eq('instagram_video_url', media.permalink)
            .single();
          
          if (!existingReel) {
            const tags = extractTagsFromCaption(media.caption || '');
            const productName = generateProductName(media.caption || '');
            
            const reelData = {
              creator_id: creator.id,
              caption: (media.caption || '').substring(0, 500),
              thumbnail_image_url: media.thumbnail_url || media.media_url,
              instagram_video_url: media.permalink,
              product_name: productName,
              affiliate_link: 'https://amazon.com/example-product',
              tags: tags.join(', '),
              show_on_website: true,
              post_date: media.timestamp
            };
            
            reelsData.push(reelData);
          }
        }
      }

      // Insert new reels into database
      if (reelsData.length > 0) {
        const { data: insertedReels, error: insertError } = await supabase
          .from('reels')
          .insert(reelsData)
          .select();
        
        if (insertError) {
          console.error('Error inserting reels:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save reels to database' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Successfully inserted ${insertedReels.length} new reels for ${profileData.username}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            newReels: insertedReels.length,
            message: `Successfully synced ${insertedReels.length} new reels from @${profileData.username}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            newReels: 0,
            message: `No new reels found for @${profileData.username}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fallback for backward compatibility - return mock data
    if (username) {
      console.log('Using fallback mock data for username:', username);
      
      let { data: creator } = await supabase
        .from('creators')
        .select('*')
        .eq('instagram_handle', username)
        .single();

      if (!creator) {
        const { data: newCreator } = await supabase
          .from('creators')
          .insert({
            name: username,
            instagram_handle: username,
            tier: 'Free'
          })
          .select()
          .single();
        creator = newCreator;
      }

      const mockReels = generateMockReelsForUser(username, creator.id);
      
      const { data: insertedReels } = await supabase
        .from('reels')
        .insert(mockReels)
        .select();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          newReels: insertedReels?.length || 0,
          message: `Successfully synced ${insertedReels?.length || 0} mock reels for @${username}`,
          requiresAuth: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-instagram-reels function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTagsFromCaption(caption: string): string[] {
  const tags = [];
  
  const hashtagMatches = caption.match(/#\w+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(tag => tag.substring(1).toLowerCase()));
  }
  
  const categoryKeywords = {
    'tech': ['technology', 'gadget', 'device', 'smartphone', 'laptop', 'wireless', 'charging'],
    'beauty': ['skincare', 'makeup', 'beauty', 'serum', 'cream', 'glow'],
    'fitness': ['workout', 'exercise', 'fitness', 'gym', 'health', 'training'],
    'lifestyle': ['lifestyle', 'daily', 'routine', 'home', 'decor'],
    'fashion': ['fashion', 'style', 'outfit', 'clothing', 'accessories'],
    'food': ['food', 'recipe', 'cooking', 'kitchen', 'meal', 'coffee']
  };
  
  const lowerCaption = caption.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerCaption.includes(keyword))) {
      tags.push(category);
    }
  }
  
  return [...new Set(tags)].slice(0, 8);
}

function generateProductName(caption: string): string {
  const lowerCaption = caption.toLowerCase();
  
  if (lowerCaption.includes('wireless') && lowerCaption.includes('charging')) {
    return 'Wireless Charging Pad';
  } else if (lowerCaption.includes('serum') || lowerCaption.includes('skincare')) {
    return 'Premium Skincare Serum';
  } else if (lowerCaption.includes('coffee') || lowerCaption.includes('espresso')) {
    return 'Espresso Machine';
  } else if (lowerCaption.includes('fitness') || lowerCaption.includes('workout')) {
    return 'Fitness Equipment';
  } else if (lowerCaption.includes('phone') || lowerCaption.includes('stand')) {
    return 'Phone Stand';
  } else {
    return 'Featured Product';
  }
}

function generateMockReelsForUser(username: string, creatorId: number) {
  const mockReels = [
    {
      caption: `Amazing wireless charging setup! This sleek charging pad keeps my desk organized. Perfect for tech enthusiasts 🔌⚡ #TechSetup #WirelessCharging #${username}`,
      thumbnail_image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=600&fit=crop&crop=center',
      instagram_video_url: `https://www.instagram.com/p/${generateRandomShortcode()}/`,
      product_name: 'Wireless Charging Pad',
      tags: 'tech, gadgets, electronics, lifestyle'
    },
    {
      caption: `Skincare routine that actually works! ✨ This vitamin C serum transformed my skin. The glow is real! 🌟 #SkincareRoutine #VitaminC #${username}`,
      thumbnail_image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=600&fit=crop&crop=center',
      instagram_video_url: `https://www.instagram.com/p/${generateRandomShortcode()}/`,
      product_name: 'Vitamin C Serum',
      tags: 'beauty, skincare, wellness, lifestyle'
    },
    {
      caption: `Perfect coffee setup for work from home! ☕ This compact espresso machine makes café-quality drinks. Game changer! 🚀 #CoffeeSetup #WorkFromHome #${username}`,
      thumbnail_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop&crop=center',
      instagram_video_url: `https://www.instagram.com/p/${generateRandomShortcode()}/`,
      product_name: 'Compact Espresso Machine',
      tags: 'coffee, lifestyle, productivity, work'
    }
  ];
  
  return mockReels.map(reel => ({
    ...reel,
    creator_id: creatorId,
    affiliate_link: 'https://amazon.com/example-product',
    show_on_website: true,
    post_date: new Date().toISOString()
  }));
}

function generateRandomShortcode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
