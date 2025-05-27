
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInstagramAuthUrl, exchangeInstagramCode, syncInstagramWithToken } from '../services/reelService';

interface InstagramAuthProps {
  onSyncComplete: () => void;
}

const InstagramAuth: React.FC<InstagramAuthProps> = ({ onSyncComplete }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from Instagram OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: "Instagram connection failed",
        description: "User denied access or an error occurred.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && !accessToken) {
      handleCodeExchange(code);
    }
  }, []);

  const handleCodeExchange = async (code: string) => {
    setIsConnecting(true);
    try {
      const result = await exchangeInstagramCode(code);
      setAccessToken(result.accessToken);
      
      toast({
        title: "Instagram connected successfully",
        description: "You can now sync your Instagram reels.",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Code exchange error:', error);
      toast({
        title: "Connection failed",
        description: "Failed to complete Instagram connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await getInstagramAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Auth URL error:', error);
      toast({
        title: "Connection failed",
        description: "Instagram app not properly configured. Please check your settings.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleSyncReels = async () => {
    if (!accessToken) return;
    
    setIsSyncing(true);
    try {
      const result = await syncInstagramWithToken(accessToken);
      
      toast({
        title: "Sync completed",
        description: result.message,
      });
      
      onSyncComplete();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync Instagram reels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    toast({
      title: "Instagram disconnected",
      description: "You can reconnect anytime to sync new reels.",
    });
  };

  if (isConnecting) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Connecting to Instagram...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Instagram className="h-5 w-5" />
          <span>Instagram Integration</span>
          {accessToken && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>
          Connect your Instagram account to sync reels automatically using the official Instagram API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!accessToken ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Instagram Business Account Required</p>
                <p className="text-sm text-blue-700">
                  You need a Business or Creator Instagram account to use this feature. 
                  Personal accounts cannot access the Instagram API.
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleConnectInstagram}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Connect Instagram Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Instagram Connected</p>
                <p className="text-sm text-green-700">Ready to sync your reels</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSyncReels}
                disabled={isSyncing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSyncing ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Instagram className="h-4 w-4 mr-2" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Reels'}
              </Button>
              
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstagramAuth;
