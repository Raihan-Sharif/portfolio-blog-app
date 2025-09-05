"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  AlertCircle,
  Trash2,
  Camera,
  FileImage,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { uploadImage, deleteImage } from '@/lib/upload-utils';
import { createClient } from '@/utils/supabase/client';

interface SkillImageUploaderProps {
  skillId?: string;
  currentImage?: string | null;
  onImageChange: (imagePath: string | null) => void;
  className?: string;
  compact?: boolean;
}

export function SkillImageUploader({
  skillId,
  currentImage,
  onImageChange,
  className,
  compact = false
}: SkillImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload PNG, JPG, GIF, WebP, or SVG files only.';
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return 'File size must be less than 5MB.';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Upload to Supabase storage using the existing upload utility
      const imageUrl = await uploadImage(file, 'raihan-blog-app', 'skills');
      
      // If we have a skillId, update the database record
      if (skillId) {
        const supabase = createClient();
        
        // Delete old image if it exists and is a Supabase URL
        if (currentImage && currentImage.includes('supabase')) {
          try {
            await deleteImage(currentImage, 'raihan-blog-app');
          } catch (error) {
            console.warn('Could not delete old image:', error);
          }
        }
        
        // Update the skill record
        const { error: updateError } = await supabase
          .from('skills')
          .update({ brand_logo: imageUrl })
          .eq('id', skillId);

        if (updateError) {
          // If database update fails, clean up the uploaded image
          try {
            await deleteImage(imageUrl, 'raihan-blog-app');
          } catch (cleanupError) {
            console.error('Error cleaning up uploaded image:', cleanupError);
          }
          throw updateError;
        }
      }
      
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);

    try {
      const imagePath = await uploadFile(file);
      if (imagePath) {
        onImageChange(imagePath);
        setPreviewUrl(imagePath);
        toast.success(`Icon uploaded successfully! 🎉`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl(currentImage || null);
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
    }
  }, [skillId, currentImage, onImageChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    try {
      // Delete from Supabase storage if it's a Supabase URL
      if (currentImage.includes('supabase')) {
        await deleteImage(currentImage, 'raihan-blog-app');
      }
      
      // Update database record if skillId exists
      if (skillId) {
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from('skills')
          .update({ brand_logo: null })
          .eq('id', skillId);

        if (updateError) {
          throw updateError;
        }
      }

      onImageChange(null);
      setPreviewUrl(null);
      toast.success('Icon removed successfully');
    } catch (error) {
      toast.error('Failed to remove image');
      console.error('Delete error:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-xs font-medium">Skill Icon</Label>
        <div className="flex items-center gap-2">
          {previewUrl ? (
            <div className="relative">
              <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                <Image
                  src={previewUrl}
                  alt="Skill icon"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 w-5 h-5 p-0 rounded-full"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
              <FileImage className="w-5 h-5 text-slate-400" />
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="text-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              {previewUrl ? 'Change' : 'Upload'}
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Brand Logo Upload
          </Label>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 border-0">
            <Zap className="w-3 h-3 mr-1" />
            Auto-optimized to 128x128
          </Badge>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          PNG, JPG, GIF, WebP, SVG
        </div>
      </div>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 group cursor-pointer overflow-hidden",
          dragActive
            ? "border-primary bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 shadow-lg scale-102 border-solid"
            : previewUrl
              ? "border-green-500 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/50 dark:to-emerald-950/50 shadow-md"
              : "border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-gradient-to-br hover:from-slate-50 hover:to-primary/5 dark:hover:from-slate-800 dark:hover:to-primary/10 hover:shadow-md hover:scale-[1.01]",
          compact ? "p-4" : "p-6"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-lg">
                  <Image
                    src={previewUrl}
                    alt="Skill icon preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full shadow-lg"
                  disabled={isUploading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  <Check className="w-4 h-4 inline mr-1" />
                  Icon uploaded successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to replace with a new image
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200",
                dragActive 
                  ? "bg-primary/20 text-primary" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
              )}>
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </div>

              <div>
                <p className="text-lg font-semibold mb-1">
                  {isUploading ? 'Uploading...' : 'Upload Skill Icon'}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop or click to select an image
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">PNG</Badge>
                  <Badge variant="outline" className="text-xs">JPG</Badge>
                  <Badge variant="outline" className="text-xs">SVG</Badge>
                  <Badge variant="outline" className="text-xs">Max 5MB</Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Optimizing image...</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>Images are automatically resized to 128x128px and optimized</span>
        </div>
        <div>• Supported formats: PNG, JPG, GIF, WebP, SVG</div>
        <div>• Maximum file size: 5MB</div>
        <div>• Transparent backgrounds preserved</div>
      </div>
    </div>
  );
}