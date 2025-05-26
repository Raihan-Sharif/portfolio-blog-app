// src/components/ui/image-uploader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
  className?: string;
}

export function ImageUploader({
  initialImageUrl,
  onImageUploaded,
  bucketName = "raihan-blog-app",
  folderPath = "public",
  className,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent any form submission
    const form = e.target.closest("form");
    if (form) {
      form.addEventListener(
        "submit",
        (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
        },
        { once: true }
      );
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setError(null);

      // Clean up old preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setImageUrl(e.target.value);
    setError(null);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleClearUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setImageUrl("");
    onImageUploaded("");
  };

  const handleUpload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setUploading(true);
      setError(null);

      if (!imageFile) {
        if (imageUrl) {
          onImageUploaded(imageUrl);
          return;
        }
        throw new Error("Please select a file or enter an image URL");
      }

      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Generate unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Update state and notify parent
      setImageUrl(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);

      // Clean up
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current image preview */}
        {imageUrl && !imageFile && (
          <div className="relative w-full h-40 border rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt="Current image"
              fill
              className="object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClearUrl}
              type="button"
            >
              <X size={16} />
            </Button>
          </div>
        )}

        {/* File upload section */}
        <div className="space-y-2">
          <Label htmlFor="image-file">Upload Image File</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  // Prevent the default form behavior
                  const form = e.currentTarget.closest("form");
                  if (form) {
                    form.addEventListener(
                      "submit",
                      (evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                      },
                      { once: true }
                    );
                  }
                }}
              />
            </div>
            {imageFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFile}
                disabled={uploading}
                type="button"
              >
                Clear
              </Button>
            )}
          </div>

          {/* File preview */}
          {imageFile && previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)}{" "}
                KB)
              </p>
              <div className="relative w-full h-40 border rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* URL input section */}
        <div className="space-y-2">
          <Label htmlFor="image-url">Or Enter Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
            disabled={!!imageFile || uploading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={(!imageFile && !imageUrl) || uploading}
          className="w-full"
          type="button"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              {imageFile ? "Upload Image" : "Save Image URL"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
