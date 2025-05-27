
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseReel {
  id: number;
  caption: string | null;
  thumbnail_image_url: string | null;
  instagram_video_url: string | null;
  product_name: string;
  affiliate_link: string;
  tags: string | null;
  created_at: string;
  creators?: {
    name: string;
    instagram_handle: string;
  };
}

export const fetchReelsFromDatabase = async () => {
  console.log('Fetching reels from database...');
  
  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      creators (
        name,
        instagram_handle
      )
    `)
    .eq('show_on_website', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reels:', error);
    throw error;
  }

  console.log('Fetched reels from database:', data?.length || 0);
  return data || [];
};

export const getInstagramAuthUrl = async () => {
  console.log('Getting Instagram OAuth URL...');
  
  const { data, error } = await supabase.functions.invoke('fetch-instagram-reels', {
    body: { action: 'getAuthUrl' }
  });

  if (error) {
    console.error('Error getting Instagram auth URL:', error);
    throw error;
  }

  return data.authUrl;
};

export const exchangeInstagramCode = async (code: string) => {
  console.log('Exchanging Instagram authorization code...');
  
  const { data, error } = await supabase.functions.invoke('fetch-instagram-reels', {
    body: { action: 'exchangeCode', code }
  });

  if (error) {
    console.error('Error exchanging Instagram code:', error);
    throw error;
  }

  return data;
};

export const syncInstagramWithToken = async (accessToken: string) => {
  console.log('Syncing Instagram media with access token...');
  
  const { data, error } = await supabase.functions.invoke('fetch-instagram-reels', {
    body: { action: 'fetchMedia', accessToken }
  });

  if (error) {
    console.error('Error syncing Instagram media:', error);
    throw error;
  }

  return data;
};

export const syncInstagramProfile = async (username: string) => {
  console.log('Syncing Instagram profile (fallback):', username);
  
  const { data, error } = await supabase.functions.invoke('fetch-instagram-reels', {
    body: { username }
  });

  if (error) {
    console.error('Error syncing Instagram profile:', error);
    throw error;
  }

  console.log('Sync result:', data);
  return data;
};

export const deleteReel = async (reelId: number) => {
  const { error } = await supabase
    .from('reels')
    .delete()
    .eq('id', reelId);

  if (error) {
    console.error('Error deleting reel:', error);
    throw error;
  }

  return true;
};
