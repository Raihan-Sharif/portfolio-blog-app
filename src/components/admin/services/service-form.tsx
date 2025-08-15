'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Service, ServiceCategory } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  service?: Service;
  categories: ServiceCategory[];
}

interface ServiceFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  price_from: number | null;
  price_to: number | null;
  price_type: 'fixed' | 'hourly' | 'project' | 'negotiable';
  delivery_time: string;
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert';
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  show_price: boolean;
  status: 'draft' | 'active' | 'archived';
  features: string[];
  requirements: string[];
  process_steps: string[];
  tags: string[];
  technologies: string[];
  image_url: string;
}

export default function ServiceForm({ service, categories }: ServiceFormProps): JSX.Element {
  const router = useRouter();
  const isEdit = !!service;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: service?.title || '',
    slug: service?.slug || '',
    description: service?.description || '',
    short_description: service?.short_description || '',
    category_id: service?.category_id || '',
    price_from: service?.price_from || null,
    price_to: service?.price_to || null,
    price_type: service?.price_type || 'project',
    delivery_time: service?.delivery_time || '',
    difficulty_level: service?.difficulty_level || 'medium',
    is_active: service?.is_active ?? true,
    is_featured: service?.is_featured ?? false,
    is_popular: service?.is_popular ?? false,
    show_price: service?.show_price ?? true,
    status: service?.status || 'draft',
    features: service?.features || [],
    requirements: service?.requirements || [],
    process_steps: service?.process_steps || [],
    tags: service?.tags || [],
    technologies: service?.tech_stack || [],
    image_url: service?.image_url || '',
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && formData.title && !isSlugManuallyEdited) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit, isSlugManuallyEdited]);

  const [newFeature, setNewFeature] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newProcessStep, setNewProcessStep] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTechnology, setNewTechnology] = useState('');

  const handleInputChange = useCallback((field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track if slug is manually edited
    if (field === 'slug') {
      setIsSlugManuallyEdited(true);
    }
  }, []);

  const addArrayItem = useCallback((field: 'features' | 'requirements' | 'process_steps' | 'tags' | 'technologies', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));

    // Clear the input
    switch (field) {
      case 'features': setNewFeature(''); break;
      case 'requirements': setNewRequirement(''); break;
      case 'process_steps': setNewProcessStep(''); break;
      case 'tags': setNewTag(''); break;
      case 'technologies': setNewTechnology(''); break;
    }
  }, []);

  const removeArrayItem = useCallback((field: 'features' | 'requirements' | 'process_steps' | 'tags' | 'technologies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tech_stack: formData.technologies,
        updated_at: new Date().toISOString()
      };

      // Remove technologies field since we use tech_stack
      delete (serviceData as any).technologies;

      let result;
      if (isEdit && service) {
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: isEdit ? "Service updated" : "Service created",
        description: `"${formData.title}" has been ${isEdit ? 'updated' : 'created'} successfully.`,
      });

      router.push('/admin/services');
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} service. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ArrayInput = useCallback(({ 
    label, 
    field, 
    value, 
    onChange, 
    placeholder 
  }: { 
    label: string;
    field: 'features' | 'requirements' | 'process_steps' | 'tags' | 'technologies';
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addArrayItem(field, value);
            }
          }}
        />
        <Button
          type="button"
          onClick={() => addArrayItem(field, value)}
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData[field].map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <button
              type="button"
              onClick={() => removeArrayItem(field, index)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  ), [formData, addArrayItem, removeArrayItem]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/services">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : (isEdit ? 'Update Service' : 'Create Service')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter service title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                  required
                />
              </div>

              <div>
                <Label htmlFor="short_description">Short Description *</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief description for cards and previews"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed service description"
                  rows={5}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image_url">Service Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ArrayInput
                label="Features"
                field="features"
                value={newFeature}
                onChange={setNewFeature}
                placeholder="Add a feature"
              />

              <ArrayInput
                label="Requirements"
                field="requirements"
                value={newRequirement}
                onChange={setNewRequirement}
                placeholder="Add a requirement"
              />

              <ArrayInput
                label="Process Steps"
                field="process_steps"
                value={newProcessStep}
                onChange={setNewProcessStep}
                placeholder="Add a process step"
              />

              <ArrayInput
                label="Tags"
                field="tags"
                value={newTag}
                onChange={setNewTag}
                placeholder="Add a tag"
              />

              <ArrayInput
                label="Technologies"
                field="technologies"
                value={newTechnology}
                onChange={setNewTechnology}
                placeholder="Add a technology"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'active' | 'archived') => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value: 'easy' | 'medium' | 'hard' | 'expert') => handleInputChange('difficulty_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_popular">Popular</Label>
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => handleInputChange('is_popular', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="show_price">Show Price Publicly</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this to display pricing information on the public service page
                  </p>
                </div>
                <Switch
                  id="show_price"
                  checked={formData.show_price}
                  onCheckedChange={(checked) => handleInputChange('show_price', checked)}
                />
              </div>

              <div>
                <Label htmlFor="price_type">Price Type</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value: 'fixed' | 'hourly' | 'project' | 'negotiable') => handleInputChange('price_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="price_from">Price From (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                    <Input
                      id="price_from"
                      type="number"
                      value={formData.price_from || ''}
                      onChange={(e) => handleInputChange('price_from', e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price_to">Price To (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                    <Input
                      id="price_to"
                      type="number"
                      value={formData.price_to || ''}
                      onChange={(e) => handleInputChange('price_to', e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="delivery_time">Delivery Time</Label>
                <Input
                  id="delivery_time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}