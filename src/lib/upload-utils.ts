import { supabase } from "./supabase/client";

/**
 * Uploads an image file to Supabase Storage
 *
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'public')
 * @param folder The folder path in the bucket
 * @returns A Promise that resolves to the public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string = "raihan-blog-app",
  folder: string = "public"
): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    // Generate deterministic filename to avoid hydration issues
    const timestamp = Date.now();
    const randomSuffix = Math.floor(timestamp % 100000).toString(36);
    const fileName = `${timestamp}-${randomSuffix}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

/**
 * Deletes an image from Supabase Storage
 *
 * @param url The public URL of the image to delete
 * @param bucket The storage bucket name (default: 'public')
 * @returns A Promise that resolves when the file is deleted
 */
export async function deleteImage(
  url: string,
  bucket: string = "raihan-blog-app"
): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    
    // For Supabase URLs, the structure is: /storage/v1/object/public/bucket-name/folder/file
    // We need to find where the actual file path starts after the bucket name
    const storageIndex = pathParts.indexOf("storage");
    const publicIndex = pathParts.indexOf("public");
    
    let filePath = "";
    if (storageIndex !== -1 && publicIndex !== -1) {
      // Find the bucket name in the path
      const bucketIndex = pathParts.findIndex((part, index) => 
        index > publicIndex && part === bucket
      );
      
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        filePath = pathParts.slice(bucketIndex + 1).join("/");
      }
    }

    if (!filePath) {
      throw new Error("Invalid file path");
    }

    // Delete from Supabase storage
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image. Please try again.");
  }
}

/**
 * Creates a Supabase bucket if it doesn't exist
 *
 * @param bucketName The name of the bucket to create
 * @param isPublic Whether the bucket should be publicly accessible
 * @returns A Promise that resolves when the bucket is created or already exists
 */
export async function ensureBucketExists(
  bucketName: string,
  isPublic: boolean = true
): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
      });

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    // Not throwing here since this is more of a helper function
  }
}
