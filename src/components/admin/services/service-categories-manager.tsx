'use client';

import { useState, useCallback } from 'react';
import { ServiceCategory } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

interface ServiceCategoriesManagerProps {
  categories: ServiceCategory[];
  onRefresh?: () => void;
}

export default function ServiceCategoriesManager({ categories, onRefresh }: ServiceCategoriesManagerProps): JSX.Element {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    icon_name: '',
    color: '#3B82F6'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        slug: formData.slug,
        icon_name: formData.icon_name || null,
        color: formData.color || null,
        sort_order: categories.length + 1,
        is_active: true
      };

      const { error } = await supabase
        .from('service_categories')
        .insert([categoryData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Category created",
        description: `"${formData.name}" has been created successfully.`,
      });

      setIsCreating(false);
      setIsSlugManuallyEdited(false);
      setFormData({ name: '', description: '', slug: '', icon_name: '', color: '#3B82F6' });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingId(category.id);
    setIsSlugManuallyEdited(true); // Assume existing slug is intentional
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon_name: category.icon_name || '',
      color: category.color || '#3B82F6'
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId) return;

    try {
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        slug: formData.slug,
        icon_name: formData.icon_name || null,
        color: formData.color || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('service_categories')
        .update(updateData)
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Category updated",
        description: `"${formData.name}" has been updated successfully.`,
      });

      setEditingId(null);
      setIsSlugManuallyEdited(false);
      setFormData({ name: '', description: '', slug: '', icon_name: '', color: '#3B82F6' });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (categoryId: string, categoryName: string) => {
    setIsDeleting(categoryId);
    
    try {
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw error;
      }

      toast({
        title: "Category deleted",
        description: `"${categoryName}" has been successfully deleted.`,
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: (!isSlugManuallyEdited && !editingId) ? generateSlug(name) : prev.slug
    }));
  }, [isSlugManuallyEdited, editingId]);

  const handleSlugChange = useCallback((slug: string) => {
    setFormData(prev => ({ ...prev, slug }));
    setIsSlugManuallyEdited(true);
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setFormData(prev => ({ ...prev, description }));
  }, []);

  const handleIconChange = useCallback((icon_name: string) => {
    setFormData(prev => ({ ...prev, icon_name }));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setFormData(prev => ({ ...prev, color }));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Categories</CardTitle>
            <Button onClick={() => { setIsCreating(true); setIsSlugManuallyEdited(false); }} disabled={isCreating || !!editingId}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Form */}
          {isCreating && (
            <Card className="border-dashed">
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., Web Development"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="e.g., web-development"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="Brief description of this category"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon_name">Icon Name</Label>
                      <Input
                        id="icon_name"
                        value={formData.icon_name}
                        onChange={(e) => handleIconChange(e.target.value)}
                        placeholder="e.g., Code, Smartphone, Palette"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          id="color"
                          value={formData.color}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => handleColorChange(e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setIsCreating(false); setIsSlugManuallyEdited(false); }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    {editingId === category.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={formData.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            className="w-full"
                            rows={2}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={formData.icon_name}
                            onChange={(e) => handleIconChange(e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="color"
                              value={formData.color}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="w-8 h-8 p-0 border rounded"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Editing</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              onClick={handleUpdate}
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingId(null); setIsSlugManuallyEdited(false); }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className="font-medium">{category.name}</div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1 py-0.5 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {category.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {category.icon_name || 'None'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            <span className="text-sm font-mono">
                              {category.color}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(category)}
                              disabled={editingId !== null}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={editingId !== null || isDeleting === category.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the category 
                                    <strong> "{category.name}"</strong> and may affect associated services.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id, category.name)}
                                    disabled={isDeleting === category.id}
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                  >
                                    {isDeleting === category.id ? 'Deleting...' : 'Delete Category'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}