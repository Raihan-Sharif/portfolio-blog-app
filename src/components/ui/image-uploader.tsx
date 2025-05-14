"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update image URL when initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Function to properly handle file upload with progress tracking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setError(null);

      // Create a preview URL for the selected file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setError(null);
  };

  const handleClearFile = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      if (!imageFile) {
        // If no file selected but we have a URL, use that
        if (imageUrl) {
          onImageUploaded(imageUrl);
          return;
        }

        throw new Error("Please select a file or enter an image URL");
      }

      // Generate a unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      // Add console logs for debugging
      console.log("Starting upload to:", bucketName, filePath);
      console.log("File size:", imageFile.size, "bytes");

      // Begin simulating progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 90) progress = 90; // Avoid reaching 100% before actually complete
        setUploadProgress(progress);
      }, 100);

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("Public URL data:", urlData);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Set the URL and notify parent
      setImageUrl(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);
      setImageFile(null);

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      console.log("Image upload complete, URL:", urlData.publicUrl);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current image preview */}
        {imageUrl && !imageFile && (
          <div className="relative w-full h-40 border rounded-md overflow-hidden mb-2">
            <Image
              src={imageUrl}
              alt="Uploaded image preview"
              fill
              className="object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                setImageUrl("");
                onImageUploaded("");
              }}
              type="button"
            >
              <X size={16} />
            </Button>
          </div>
        )}

        {/* File input */}
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <div className="flex gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
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

          {imageFile && previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </p>
              <div className="relative w-full h-40 border rounded-md overflow-hidden mt-2">
                <Image
                  src={previewUrl}
                  alt="Image preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* URL input option */}
        <div className="space-y-2">
          <Label htmlFor="image-url">Or enter image URL</Label>
          <Input
            id="image-url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
            disabled={!!imageFile || uploading}
          />
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Error message */}
        {error && <div className="text-sm text-destructive">{error}</div>}

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
              {imageUrl ? "Update Image" : "Upload Image"}
            </>
          )}
        </Button>

        {/* Debug information in development (hidden in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p>Bucket: {bucketName}</p>
            <p>Folder: {folderPath}</p>
            <p>File: {imageFile?.name}</p>
            <p>URL: {imageUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
