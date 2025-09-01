// src/components/admin/newsletter/newsletter-campaigns.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus,
  Send,
  Edit,
  Trash2,
  Calendar,
  Users,
  Eye,
  MousePointer,
  Mail,
  MailOpen,
  Clock,
  ImageIcon,
  X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { NewsletterCampaign, CampaignFormData } from '@/types/newsletter';
import { uploadImage, deleteImage } from '@/lib/upload-utils';
import { ImageUploader } from '@/components/ui/enhanced-image-uploader';
import { useToast } from '@/components/ui/use-toast';

interface NewsletterCampaignsProps {
  onRefresh?: () => void;
}

export function NewsletterCampaigns({ onRefresh }: NewsletterCampaignsProps): JSX.Element {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<NewsletterCampaign | null>(null);
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    preview_text: '',
    content: '',
    html_content: '',
    featured_image: '',
    lead_magnet_file: '',
    campaign_type: 'newsletter',
    target_audience: 'all',
    automation_trigger: '',
    status: 'draft',
  });

  const { toast } = useToast();
  const supabase = createClient();

  const fetchCampaigns = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);

      if (!formData.name || !formData.subject || !formData.content) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name, subject, content)",
          variant: "destructive",
        });
        return;
      }

      const campaignData = {
        ...formData,
        total_recipients: 0,
        total_opened: 0,
        total_clicked: 0,
        total_bounced: 0,
        total_complained: 0,
        total_unsubscribed: 0,
      };

      if (editingCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('newsletter_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);

        if (error) throw error;

        toast({
          title: "Campaign Updated",
          description: "Newsletter campaign has been updated successfully.",
        });
      } else {
        // Create new campaign
        const { error } = await supabase
          .from('newsletter_campaigns')
          .insert([campaignData]);

        if (error) throw error;

        toast({
          title: "Campaign Created",
          description: "Newsletter campaign has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchCampaigns();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (campaign: NewsletterCampaign): Promise<void> => {
    try {
      // Delete featured image if exists
      if (campaign.featured_image) {
        try {
          await deleteImage(campaign.featured_image, 'raihan-blog-app');
        } catch (imageError) {
          console.warn('Failed to delete featured image:', imageError);
        }
      }

      // Delete campaign
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign Deleted",
        description: "Newsletter campaign has been deleted successfully.",
      });

      await fetchCampaigns();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      const imageUrl = await uploadImage(file, 'raihan-blog-app', 'newsletter-media');
      
      // Delete old image if exists
      if (formData.featured_image) {
        try {
          await deleteImage(formData.featured_image, 'raihan-blog-app');
        } catch (error) {
          console.warn('Failed to delete old image:', error);
        }
      }
      
      setFormData(prev => ({ ...prev, featured_image: imageUrl }));
      toast({
        title: "Image Uploaded",
        description: "Featured image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageRemove = async (): Promise<void> => {
    if (formData.featured_image) {
      try {
        await deleteImage(formData.featured_image, 'raihan-blog-app');
        setFormData(prev => ({ ...prev, featured_image: '' }));
        toast({
          title: "Image Removed",
          description: "Featured image has been removed successfully.",
        });
      } catch (error) {
        console.error('Error removing image:', error);
        toast({
          title: "Error",
          description: "Failed to remove image",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      subject: '',
      preview_text: '',
      content: '',
      html_content: '',
      featured_image: '',
      lead_magnet_file: '',
      campaign_type: 'newsletter',
      target_audience: 'all',
      automation_trigger: '',
      status: 'draft',
    });
    setEditingCampaign(null);
  };

  const openEditDialog = (campaign: NewsletterCampaign): void => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      preview_text: campaign.preview_text || '',
      content: campaign.content || '',
      html_content: campaign.html_content || '',
      featured_image: campaign.featured_image || '',
      lead_magnet_file: campaign.lead_magnet_file || '',
      campaign_type: campaign.campaign_type,
      target_audience: campaign.target_audience || 'all',
      automation_trigger: campaign.automation_trigger || '',
      status: campaign.status,
      scheduled_at: campaign.scheduled_at,
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: NewsletterCampaign['status']): string => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'sending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: NewsletterCampaign['status']) => {
    switch (status) {
      case 'sent':
        return <MailOpen className="h-3 w-3" />;
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'sending':
        return <Send className="h-3 w-3" />;
      case 'draft':
        return <Edit className="h-3 w-3" />;
      case 'paused':
        return <Clock className="h-3 w-3" />;
      case 'cancelled':
        return <X className="h-3 w-3" />;
      default:
        return <Mail className="h-3 w-3" />;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-40"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 rounded-lg border border-primary/20">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Newsletter Campaigns</h2>
            <p className="text-muted-foreground">Create and manage your email campaigns</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </DialogTitle>
              <DialogDescription>
                {editingCampaign 
                  ? 'Update your newsletter campaign details'
                  : 'Create a new newsletter campaign to send to your subscribers'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="Monthly Newsletter - January 2024"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: CampaignFormData['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="sending">Sending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="🚀 Your Monthly Tech Update is Here!"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_text">Preview Text</Label>
                <Input
                  id="preview_text"
                  placeholder="Short preview text that appears in email clients..."
                  value={formData.preview_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, preview_text: e.target.value }))}
                />
              </div>

              {/* Professional Campaign Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Campaign Type *</Label>
                  <Select 
                    value={formData.campaign_type} 
                    onValueChange={(value: CampaignFormData['campaign_type']) => 
                      setFormData(prev => ({ ...prev, campaign_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="lead_magnet">Lead Magnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Select 
                    value={formData.target_audience || 'all'} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, target_audience: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscribers</SelectItem>
                      <SelectItem value="active">Active Subscribers</SelectItem>
                      <SelectItem value="new">New Subscribers</SelectItem>
                      <SelectItem value="engaged">Engaged Subscribers</SelectItem>
                      <SelectItem value="lead_magnet_subscribers">Lead Magnet Subscribers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.campaign_type === 'lead_magnet' && (
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Label htmlFor="lead_magnet_file">Lead Magnet File URL</Label>
                  <Input
                    id="lead_magnet_file"
                    placeholder="https://your-bucket.com/files/lead-magnet.pdf"
                    value={formData.lead_magnet_file || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_magnet_file: e.target.value }))}
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    This file will be automatically sent to subscribers when they sign up for this campaign.
                  </p>
                </div>
              )}

              <Separator />

              {/* Featured Image Upload */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Featured Image</Label>
                <p className="text-sm text-muted-foreground">
                  Upload a featured image for your campaign (optional). Images are stored in the 'newsletter-media' folder.
                </p>
                
                {formData.featured_image ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.featured_image}
                      alt="Featured image"
                      className="w-full h-48 object-cover rounded-lg border shadow-sm"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleImageRemove}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    onUpload={handleImageUpload}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    className="w-full max-w-md"
                  >
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm font-medium mb-2">Upload Featured Image</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Drag & drop an image or click to browse<br />
                        Max size: 5MB
                      </p>
                    </div>
                  </ImageUploader>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="content">Email Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your newsletter content here..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px]"
                />
              </div>

              {formData.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Table */}
      <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage all your newsletter campaigns from one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first newsletter campaign to get started.
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {campaign.featured_image && (
                          <img 
                            src={campaign.featured_image} 
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {campaign.preview_text || 'No preview text'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={campaign.subject}>
                        {campaign.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.total_recipients.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-blue-500" />
                          <span>{campaign.total_opened}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MousePointer className="h-3 w-3 text-green-500" />
                          <span>{campaign.total_clicked}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(campaign)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
                                {campaign.featured_image && " The featured image will also be deleted."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(campaign)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Campaign
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}