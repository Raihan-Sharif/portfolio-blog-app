// src/components/admin/newsletter/lead-magnets.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Gift,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  X
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { LeadMagnet, FormField } from '@/types/newsletter';
import { uploadImage, deleteImage } from '@/lib/upload-utils';
import { ImageUploader } from '@/components/ui/enhanced-image-uploader';
import { useToast } from '@/components/ui/use-toast';

interface LeadMagnetsProps {
  onRefresh?: () => void;
}

interface LeadMagnetFormData {
  name: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  thumbnail_image: string;
  is_active: boolean;
  form_fields: FormField[];
  thank_you_message: string;
}

export function LeadMagnets({ onRefresh }: LeadMagnetsProps): JSX.Element {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMagnet, setEditingMagnet] = useState<LeadMagnet | null>(null);
  
  const [formData, setFormData] = useState<LeadMagnetFormData>({
    name: '',
    title: '',
    description: '',
    file_url: '',
    file_type: 'pdf',
    thumbnail_image: '',
    is_active: true,
    form_fields: [],
    thank_you_message: 'Thank you for subscribing! Check your email for the download link.',
  });

  const { toast } = useToast();
  const supabase = createClient();

  const fetchLeadMagnets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeadMagnets(data || []);
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
      toast({
        title: "Error",
        description: "Failed to load lead magnets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);

      if (!formData.name || !formData.title) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name, title)",
          variant: "destructive",
        });
        return;
      }

      const magnetData = {
        ...formData,
        download_count: 0,
        conversion_count: 0,
      };

      if (editingMagnet) {
        // Update existing lead magnet
        const { error } = await supabase
          .from('lead_magnets')
          .update(magnetData)
          .eq('id', editingMagnet.id);

        if (error) throw error;

        toast({
          title: "Lead Magnet Updated",
          description: "Lead magnet has been updated successfully.",
        });
      } else {
        // Create new lead magnet
        const { error } = await supabase
          .from('lead_magnets')
          .insert([magnetData]);

        if (error) throw error;

        toast({
          title: "Lead Magnet Created",
          description: "Lead magnet has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchLeadMagnets();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving lead magnet:', error);
      toast({
        title: "Error",
        description: "Failed to save lead magnet",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (leadMagnet: LeadMagnet): Promise<void> => {
    try {
      // Delete thumbnail image if exists
      if (leadMagnet.thumbnail_image) {
        try {
          await deleteImage(leadMagnet.thumbnail_image, 'raihan-blog-app');
        } catch (imageError) {
          console.warn('Failed to delete thumbnail image:', imageError);
        }
      }

      // Delete lead magnet
      const { error } = await supabase
        .from('lead_magnets')
        .delete()
        .eq('id', leadMagnet.id);

      if (error) throw error;

      toast({
        title: "Lead Magnet Deleted",
        description: "Lead magnet has been deleted successfully.",
      });

      await fetchLeadMagnets();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting lead magnet:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead magnet",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      const imageUrl = await uploadImage(file, 'raihan-blog-app', 'lead-magnets');
      
      // Delete old image if exists
      if (formData.thumbnail_image) {
        try {
          await deleteImage(formData.thumbnail_image, 'raihan-blog-app');
        } catch (error) {
          console.warn('Failed to delete old image:', error);
        }
      }
      
      setFormData(prev => ({ ...prev, thumbnail_image: imageUrl }));
      toast({
        title: "Image Uploaded",
        description: "Thumbnail image has been uploaded successfully.",
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
    if (formData.thumbnail_image) {
      try {
        await deleteImage(formData.thumbnail_image, 'raihan-blog-app');
        setFormData(prev => ({ ...prev, thumbnail_image: '' }));
        toast({
          title: "Image Removed",
          description: "Thumbnail image has been removed successfully.",
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
      title: '',
      description: '',
      file_url: '',
      file_type: 'pdf',
      thumbnail_image: '',
      is_active: true,
      form_fields: [],
      thank_you_message: 'Thank you for subscribing! Check your email for the download link.',
    });
    setEditingMagnet(null);
  };

  const openEditDialog = (leadMagnet: LeadMagnet): void => {
    setEditingMagnet(leadMagnet);
    setFormData({
      name: leadMagnet.name,
      title: leadMagnet.title,
      description: leadMagnet.description || '',
      file_url: leadMagnet.file_url || '',
      file_type: leadMagnet.file_type || 'pdf',
      thumbnail_image: leadMagnet.thumbnail_image || '',
      is_active: leadMagnet.is_active,
      form_fields: leadMagnet.form_fields || [],
      thank_you_message: leadMagnet.thank_you_message || '',
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchLeadMagnets();
  }, [fetchLeadMagnets]);

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
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Lead Magnets</h2>
            <p className="text-muted-foreground">Manage your free resources and lead generation tools</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Lead Magnet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                {editingMagnet ? 'Edit Lead Magnet' : 'Create New Lead Magnet'}
              </DialogTitle>
              <DialogDescription>
                {editingMagnet 
                  ? 'Update your lead magnet details'
                  : 'Create a new lead magnet to attract and convert visitors into subscribers'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name *</Label>
                  <Input
                    id="name"
                    placeholder="Web Development Checklist"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file_type">File Type</Label>
                  <Select 
                    value={formData.file_type} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, file_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="zip">ZIP Archive</SelectItem>
                      <SelectItem value="template">Code Template</SelectItem>
                      <SelectItem value="ebook">eBook</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Public Title *</Label>
                <Input
                  id="title"
                  placeholder="Ultimate Web Development Checklist"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A comprehensive 50-point checklist for launching production-ready web applications..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_url">File URL *</Label>
                <Input
                  id="file_url"
                  placeholder="https://your-bucket.com/lead-magnets/checklist.pdf"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Upload your file to the 'lead-magnets' folder in your bucket and paste the URL here.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <Label className="text-base font-medium text-green-900 dark:text-green-100">
                    Active Lead Magnet
                  </Label>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Make this lead magnet available for subscriptions
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              {/* Thumbnail Image Upload */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Thumbnail Image</Label>
                <p className="text-sm text-muted-foreground">
                  Upload a thumbnail image for your lead magnet (optional).
                </p>
                
                {formData.thumbnail_image ? (
                  <div className="relative w-full max-w-md">
                    <Image
                      src={formData.thumbnail_image}
                      alt="Thumbnail"
                      width={400}
                      height={192}
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
                    maxSize={5 * 1024 * 1024}
                    className="w-full max-w-md"
                  >
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm font-medium mb-2">Upload Thumbnail</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Drag & drop an image or click to browse<br />
                        Max size: 5MB
                      </p>
                    </div>
                  </ImageUploader>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thank_you_message">Thank You Message</Label>
                <Textarea
                  id="thank_you_message"
                  placeholder="Thank you for subscribing! Check your email for the download link."
                  value={formData.thank_you_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, thank_you_message: e.target.value }))}
                />
              </div>

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
                    <Gift className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : (editingMagnet ? 'Update Lead Magnet' : 'Create Lead Magnet')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lead Magnets Table */}
      <Card className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg border-slate-200/60 dark:border-slate-700/60">
        <CardHeader>
          <CardTitle>All Lead Magnets</CardTitle>
          <CardDescription>
            Manage your free resources and download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadMagnets.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No lead magnets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first lead magnet to start generating leads.
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Lead Magnet
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Magnet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadMagnets.map((magnet) => (
                  <TableRow key={magnet.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {magnet.thumbnail_image ? (
                          <Image 
                            src={magnet.thumbnail_image} 
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{magnet.title}</div>
                          <div className="text-sm text-muted-foreground">{magnet.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{magnet.file_type || 'pdf'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={magnet.is_active ? 'success' : 'secondary'}>
                        {magnet.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>{magnet.download_count.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{magnet.conversion_count.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(magnet.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {magnet.file_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(magnet.file_url, '_blank')}
                            className="h-8 w-8"
                            title="Preview file"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(magnet)}
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
                              <AlertDialogTitle>Delete Lead Magnet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{magnet.title}"? This action cannot be undone.
                                {magnet.thumbnail_image && " The thumbnail image will also be deleted."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(magnet)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Lead Magnet
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