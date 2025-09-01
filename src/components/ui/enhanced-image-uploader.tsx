// src/components/ui/enhanced-image-uploader.tsx
"use client";

import { useState, useRef, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: ReactNode;
}

export function ImageUploader({
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  children
}: ImageUploaderProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && file.type.startsWith('image/')) {
      if (file.size <= maxSize) {
        try {
          setIsUploading(true);
          await onUpload(file);
        } catch (error) {
          console.error('Upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      } else {
        alert(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
      }
    } else {
      alert('Please select a valid image file');
    }
  }, [onUpload, maxSize]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size <= maxSize) {
        try {
          setIsUploading(true);
          await onUpload(file);
        } catch (error) {
          console.error('Upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      } else {
        alert(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload, maxSize]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-all duration-200',
        isDragOver && 'scale-105',
        isUploading && 'pointer-events-none opacity-50',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <div
        className={cn(
          'transition-all duration-200',
          isDragOver && 'border-primary/50 bg-primary/5',
          isUploading && 'animate-pulse'
        )}
      >
        {children}
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
}