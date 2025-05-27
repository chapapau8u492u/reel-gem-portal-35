import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Mail, Instagram, Sparkles, Trash2, Link, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '../components/AdminLayout';
import { suggestTags } from '../services/aiService';
import { extractInstagramData } from '../services/instagramService';
import { fetchReelsFromDatabase, syncInstagramProfile, deleteReel, DatabaseReel } from '../services/reelService';

const AdminDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reels, setReels] = useState<DatabaseReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingReel, setIsAddingReel] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExtractingFromUrl, setIsExtractingFromUrl] = useState(false);
  const [instagramProfile, setInstagramProfile] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    caption: '',
    thumbnail: '',
    embedUrl: '',
    productName: '',
    affiliateLink: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    loadReels();
  }, [isAuthenticated, navigate]);

  const loadReels = async () => {
    try {
      setIsLoading(true);
      const data = await fetchReelsFromDatabase();
      setReels(data);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast({
        title: "Error",
        description: "Failed to load reels from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExtractFromUrl = async () => {
    if (!formData.embedUrl.trim()) {
      toast({
        title: "Instagram URL required",
        description: "Please enter an Instagram URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingFromUrl(true);
    try {
      const data = await extractInstagramData(formData.embedUrl);
      if (data) {
        setFormData(prev => ({
          ...prev,
          caption: data.caption,
          thumbnail: data.thumbnail
        }));
        
        toast({
          title: "Data extracted",
          description: "Caption and thumbnail extracted from Instagram URL.",
        });
      } else {
        throw new Error('Failed to extract data');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract data from Instagram URL. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingFromUrl(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please enter a caption first to generate tags.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTags(true);
    try {
      const aiResponse = await suggestTags(formData.caption);
      setFormData(prev => ({ 
        ...prev, 
        tags: [...new Set([...prev.tags, ...aiResponse.tags])]
      }));
      
      if (aiResponse.productSuggestion && !formData.productName) {
        setFormData(prev => ({ 
          ...prev, 
          productName: aiResponse.productSuggestion || ''
        }));
      }
      
      toast({
        title: "Tags generated",
        description: `Added ${aiResponse.tags.length} AI-suggested tags.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caption || !formData.productName || !formData.affiliateLink) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // For manual reel addition, you would need to implement database insertion here
    toast({
      title: "Manual reel addition",
      description: "Manual reel addition would be implemented here. For now, use the Instagram sync feature.",
    });
  };

  const handleDeleteReel = async (id: number) => {
    try {
      await deleteReel(id);
      setReels(prev => prev.filter(reel => reel.id !== id));
      toast({
        title: "Reel deleted",
        description: "The reel has been removed from your showcase.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSyncInstagramProfile = async () => {
    if (!instagramProfile.trim()) {
      toast({
        title: "Instagram profile required",
        description: "Please enter an Instagram username to sync from.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncInstagramProfile(instagramProfile);
      
      if (result.success) {
        // Reload reels from database
        await loadReels();
        
        toast({
          title: "Profile sync completed",
          description: result.message,
        });
        
        setInstagramProfile(''); // Clear the input
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync reels from Instagram profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncActions = (type: 'email') => {
    toast({
      title: "Sync initiated",
      description: `Email sync would start here. This is a demo version.`,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{reels.length}</CardTitle>
              <CardDescription>Total Reels</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {new Set(reels.flatMap(r => r.tags?.split(', ') || [])).size}
              </CardTitle>
              <CardDescription>Unique Tags</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {reels.filter(r => r.affiliate_link).length}
              </CardTitle>
              <CardDescription>Products Listed</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Instagram Profile Sync */}
        <Card>
          <CardHeader>
            <CardTitle>Sync from Instagram Profile</CardTitle>
            <CardDescription>
              Enter an Instagram username to sync all new reels from their profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="instagramProfile">Instagram Username</Label>
                <div className="flex space-x-2 mt-2">
                  <User className="h-5 w-5 mt-2 text-gray-400" />
                  <Input
                    id="instagramProfile"
                    placeholder="username (without @)"
                    value={instagramProfile}
                    onChange={(e) => setInstagramProfile(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSyncInstagramProfile}
                    disabled={isSyncing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isSyncing ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Instagram className="h-4 w-4 mr-2" />
                    )}
                    {isSyncing ? 'Syncing...' : 'Sync Profile'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setIsAddingReel(true)}
            className="h-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add New Reel
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSyncActions('email')}
            className="h-20 hover:bg-blue-50 hover:border-blue-300"
          >
            <Mail className="h-6 w-6 mr-2" />
            Sync from Email
          </Button>
        </div>

        {/* Add Reel Form */}
        {isAddingReel && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Reel</CardTitle>
              <CardDescription>
                Add a new reel to your showcase with product information and tags.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="embedUrl">Instagram URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="embedUrl"
                      placeholder="https://www.instagram.com/p/..."
                      value={formData.embedUrl}
                      onChange={(e) => handleInputChange('embedUrl', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleExtractFromUrl}
                      disabled={isExtractingFromUrl}
                      variant="outline"
                    >
                      {isExtractingFromUrl ? (
                        <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Link className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption *</Label>
                    <Textarea
                      id="caption"
                      placeholder="Enter the reel caption..."
                      value={formData.caption}
                      onChange={(e) => handleInputChange('caption', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      placeholder="https://example.com/image.jpg"
                      value={formData.thumbnail}
                      onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                    <Input
                      id="affiliateLink"
                      placeholder="https://example.com/affiliate-link"
                      value={formData.affiliateLink}
                      onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateTags}
                      disabled={isGeneratingTags}
                      className="flex items-center space-x-2"
                    >
                      {isGeneratingTags ? (
                        <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span>AI Generate Tags</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <Input
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Add Reel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingReel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reels List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reels ({reels.length})</CardTitle>
            <CardDescription>
              Manage your published reels and product listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reels.map((reel) => (
                <div key={reel.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  {reel.thumbnail_image_url && (
                    <img 
                      src={reel.thumbnail_image_url} 
                      alt={reel.product_name}
                      className="w-16 h-24 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=600&fit=crop&crop=center';
                      }}
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{reel.product_name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{reel.caption}</p>
                    <div className="flex flex-wrap gap-1">
                      {reel.tags?.split(', ').map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {reel.creators && (
                      <p className="text-xs text-gray-500">@{reel.creators.instagram_handle}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReel(reel.id)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {reels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reels yet. Sync an Instagram profile to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
