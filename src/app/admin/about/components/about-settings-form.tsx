// src/app/admin/about/components/about-settings-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, FileText, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AboutSettingsFormProps {
  initialData?: any;
  onUpdate: () => void;
}

export default function AboutSettingsForm({
  initialData,
  onUpdate,
}: AboutSettingsFormProps) {
  const [formData, setFormData] = useState({
    title: "About Me",
    subtitle: "",
    description: "",
    profile_image_url: "",
    resume_url: "",
    years_experience: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    linkedin_url: "",
    github_url: "",
    skills_summary: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "About Me",
        subtitle: initialData.subtitle || "",
        description: initialData.description || "",
        profile_image_url: initialData.profile_image_url || "",
        resume_url: initialData.resume_url || "",
        years_experience: initialData.years_experience?.toString() || "",
        location: initialData.location || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        website: initialData.website || "",
        linkedin_url: initialData.linkedin_url || "",
        github_url: initialData.github_url || "",
        skills_summary: initialData.skills_summary || "",
      });
      setImagePreview(initialData.profile_image_url || "");
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type
      if (
        !file.type.includes("pdf") &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setError("Please select a PDF file for resume");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume file size must be less than 10MB");
        return;
      }

      setResumeFile(file);
      setError(null);
    }
  };

  const uploadFile = async (
    file: File,
    folder: string,
    onProgress: (progress: number) => void
  ) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        onProgress(progress);
      }
    }, 100);

    try {
      const { error: uploadError } = await supabase.storage
        .from("raihan-blog-app")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("raihan-blog-app")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      onProgress(100);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return urlData.publicUrl;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      let imageUrl = formData.profile_image_url;
      let resumeUrl = formData.resume_url;

      // Upload new image if selected
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadFile(
          imageFile,
          "profile-images",
          setImageUploadProgress
        );
      }

      // Upload new resume if selected
      if (resumeFile) {
        setUploading(true);
        resumeUrl = await uploadFile(
          resumeFile,
          "resumes",
          setResumeUploadProgress
        );
      }

      setUploading(false);

      const saveData = {
        ...formData,
        profile_image_url: imageUrl,
        resume_url: resumeUrl,
        years_experience: formData.years_experience
          ? parseInt(formData.years_experience)
          : null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (initialData) {
        // Update existing
        result = await supabase
          .from("about_settings")
          .update(saveData)
          .eq("id", initialData.id);
      } else {
        // Create new
        result = await supabase
          .from("about_settings")
          .insert({ ...saveData, is_active: true });
      }

      if (result.error) {
        throw result.error;
      }

      // Reset file inputs
      setImageFile(null);
      setResumeFile(null);
      setImageUploadProgress(0);
      setResumeUploadProgress(0);

      if (imageInputRef.current) imageInputRef.current.value = "";
      if (resumeInputRef.current) resumeInputRef.current.value = "";

      onUpdate();
    } catch (err: any) {
      console.error("Error saving about settings:", err);
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(formData.profile_image_url);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const clearResume = () => {
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const removeExistingImage = () => {
    setFormData((prev) => ({ ...prev, profile_image_url: "" }));
    setImagePreview("");
  };

  const removeExistingResume = () => {
    setFormData((prev) => ({ ...prev, resume_url: "" }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="About Me"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              placeholder="Full Stack Developer"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Brief description about yourself..."
          />
        </div>

        <div>
          <Label htmlFor="skills_summary">Skills Summary</Label>
          <Textarea
            id="skills_summary"
            name="skills_summary"
            value={formData.skills_summary}
            onChange={handleInputChange}
            rows={3}
            placeholder="Summary of your key skills and technologies..."
          />
        </div>
      </div>

      {/* Profile Image */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Profile Image</h3>

        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Profile preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={removeExistingImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="profileImage">Upload New Profile Image</Label>
            <div className="flex gap-2">
              <Input
                ref={imageInputRef}
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="flex-1"
              />
              {imageFile && (
                <Button type="button" variant="outline" onClick={clearImage}>
                  Clear
                </Button>
              )}
            </div>
            {uploading && imageUploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${imageUploadProgress}%` }}
                ></div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Resume/CV</h3>

        <div className="space-y-4">
          {formData.resume_url && !resumeFile && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Current Resume
                </p>
                <a
                  href={formData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline"
                >
                  View Current Resume
                </a>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeExistingResume}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resume">Upload New Resume (PDF)</Label>
            <div className="flex gap-2">
              <Input
                ref={resumeInputRef}
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleResumeSelect}
                className="flex-1"
              />
              {resumeFile && (
                <Button type="button" variant="outline" onClick={clearResume}>
                  Clear
                </Button>
              )}
            </div>
            {uploading && resumeUploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resumeUploadProgress}%` }}
                ></div>
              </div>
            )}
            {resumeFile && (
              <p className="text-sm text-green-600">
                Selected: {resumeFile.name} (
                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              PDF format only. Max size: 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          Professional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              name="years_experience"
              type="number"
              value={formData.years_experience}
              onChange={handleInputChange}
              placeholder="6"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Chittagong, Bangladesh"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+880 123 456 7890"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Social Links</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            name="github_url"
            type="url"
            value={formData.github_url}
            onChange={handleInputChange}
            placeholder="https://github.com/yourusername"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="min-w-[120px]"
        >
          {saving || uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
