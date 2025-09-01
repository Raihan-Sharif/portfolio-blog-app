"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Calendar,
  Edit,
  ExternalLink,
  Plus,
  Shield,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Certification {
  id: number;
  title: string;
  issuing_organization: string;
  description?: string;
  issue_date?: string;
  expiry_date?: string;
  is_permanent: boolean;
  credential_id?: string;
  credential_url?: string;
  certificate_url?: string;
  skills_covered?: string[];
  verification_url?: string;
  badge_image_url?: string;
  category: string;
  level?: string;
  score?: string;
  total_score?: string;
  hours_completed?: number;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CertificationsManager() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  
  // Image upload states
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    issuing_organization: "",
    description: "",
    issue_date: "",
    expiry_date: "",
    is_permanent: false,
    credential_id: "",
    credential_url: "",
    certificate_url: "",
    skills_covered: "",
    verification_url: "",
    badge_image_url: "",
    category: "technical",
    level: "",
    score: "",
    total_score: "",
    hours_completed: "",
    display_order: "0",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      setCertifications(data || []);
    } catch (err: any) {
      console.error("Error fetching certifications:", err);
      setError(err.message || "Failed to fetch certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleBadgeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }

      setBadgeFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBadgePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

    try {
      // Simulate progress
      onProgress(10);
      
      // First check if bucket exists and create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === "raihan-blog-app");
      
      if (!bucketExists) {
        // Try to create bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket("raihan-blog-app", {
          public: true,
          allowedMimeTypes: ["image/*"],
          fileSizeLimit: 2097152 // 2MB
        });
        
        if (bucketError && !bucketError.message.includes("already exists")) {
          throw new Error(`Bucket creation failed: ${bucketError.message}`);
        }
      }

      onProgress(30);

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("raihan-blog-app")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwrite if needed
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      onProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("raihan-blog-app")
        .getPublicUrl(filePath);

      onProgress(100);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error(error.message || "Failed to upload file");
    }
  };

  const clearBadge = () => {
    setBadgeFile(null);
    setBadgePreview(formData.badge_image_url);
  };

  const removeExistingBadge = () => {
    setFormData(prev => ({ ...prev, badge_image_url: "" }));
    setBadgePreview("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      let badgeImageUrl = formData.badge_image_url;

      // Upload new badge image if selected
      if (badgeFile) {
        setUploading(true);
        badgeImageUrl = await uploadFile(
          badgeFile,
          "certification-badges",
          setUploadProgress
        );
      }

      setUploading(false);

      // Parse skills_covered from comma-separated string to JSON array
      const skillsArray = formData.skills_covered
        ? formData.skills_covered.split(",").map((skill) => skill.trim()).filter(Boolean)
        : [];

      const certificationData = {
        title: formData.title,
        issuing_organization: formData.issuing_organization,
        description: formData.description || null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        is_permanent: formData.is_permanent,
        credential_id: formData.credential_id || null,
        credential_url: formData.credential_url || null,
        certificate_url: formData.certificate_url || null,
        skills_covered: skillsArray.length > 0 ? skillsArray : null,
        verification_url: formData.verification_url || null,
        badge_image_url: badgeImageUrl || null,
        category: formData.category,
        level: formData.level || null,
        score: formData.score || null,
        total_score: formData.total_score || null,
        hours_completed: formData.hours_completed ? parseInt(formData.hours_completed) : null,
        display_order: parseInt(formData.display_order) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingCert) {
        const { error } = await supabase
          .from("certifications")
          .update(certificationData)
          .eq("id", editingCert.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("certifications")
          .insert([certificationData]);

        if (error) throw error;
      }

      await fetchCertifications();
      setSuccess(
        editingCert 
          ? "Certification updated successfully!" 
          : "Certification created successfully!"
      );
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      resetForm();
    } catch (err: any) {
      console.error("Error saving certification:", err);
      setError(err.message || "Failed to save certification");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const deleteCertification = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      setError(null);

      const { error } = await supabase
        .from("certifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchCertifications();
      setSuccess("Certification deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error deleting certification:", err);
      setError(err.message || "Failed to delete certification");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      issuing_organization: "",
      description: "",
      issue_date: "",
      expiry_date: "",
      is_permanent: false,
      credential_id: "",
      credential_url: "",
      certificate_url: "",
      skills_covered: "",
      verification_url: "",
      badge_image_url: "",
      category: "technical",
      level: "",
      score: "",
      total_score: "",
      hours_completed: "",
      display_order: "0",
      is_featured: false,
      is_active: true,
    });
    setBadgeFile(null);
    setBadgePreview("");
    setUploadProgress(0);
    setEditingCert(null);
    setIsDialogOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuing_organization: cert.issuing_organization,
      description: cert.description || "",
      issue_date: cert.issue_date || "",
      expiry_date: cert.expiry_date || "",
      is_permanent: cert.is_permanent,
      credential_id: cert.credential_id || "",
      credential_url: cert.credential_url || "",
      certificate_url: cert.certificate_url || "",
      skills_covered: cert.skills_covered?.join(", ") || "",
      verification_url: cert.verification_url || "",
      badge_image_url: cert.badge_image_url || "",
      category: cert.category,
      level: cert.level || "",
      score: cert.score || "",
      total_score: cert.total_score || "",
      hours_completed: cert.hours_completed?.toString() || "",
      display_order: cert.display_order.toString(),
      is_featured: cert.is_featured,
      is_active: cert.is_active,
    });
    setBadgeFile(null);
    setBadgePreview(cert.badge_image_url || "");
    setUploadProgress(0);
    setIsDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <Shield className="w-4 h-4" />;
      case "professional":
        return <Trophy className="w-4 h-4" />;
      case "industry":
        return <Award className="w-4 h-4" />;
      default:
        return <BadgeCheck className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-orange-100 text-orange-800";
      case "professional":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (cert: Certification) => {
    if (cert.is_permanent || !cert.expiry_date) return false;
    return new Date(cert.expiry_date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 animate-ping w-8 h-8 border-4 border-primary/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Error</AlertTitle>
          <AlertDescription className="mt-1">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <BadgeCheck className="h-5 w-5" />
          <AlertTitle className="font-semibold">Success</AlertTitle>
          <AlertDescription className="mt-1">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {uploading && (
        <Alert variant="info" className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <Trophy className="h-5 w-5 animate-pulse" />
          <AlertTitle className="font-semibold">Uploading</AlertTitle>
          <AlertDescription className="mt-1 flex items-center gap-2">
            <span>Uploading badge image...</span>
            <div className="flex-1 max-w-32 bg-blue-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-blue-600 font-medium">{uploadProgress}%</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Professional Certifications</h3>
          <p className="text-muted-foreground text-sm">
            Manage your professional certifications and credentials
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCert ? "Edit" : "Add"} Certification
              </DialogTitle>
              <DialogDescription>
                {editingCert ? "Update" : "Create a new"} professional certification entry.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Certification Title *</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="AWS Certified Solutions Architect"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="issuing_organization">Issuing Organization *</Label>
                  <Input 
                    id="issuing_organization"
                    name="issuing_organization"
                    value={formData.issuing_organization}
                    onChange={handleInputChange}
                    placeholder="Amazon Web Services"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level || "none"} onValueChange={(value) => handleSelectChange("level", value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input 
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input 
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    disabled={formData.is_permanent}
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
                  placeholder="Brief description of the certification..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="skills_covered">Skills Covered</Label>
                <Input
                  id="skills_covered"
                  name="skills_covered"
                  value={formData.skills_covered}
                  onChange={handleInputChange}
                  placeholder="AWS, Cloud Computing, EC2, S3 (comma-separated)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter skills/technologies separated by commas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credential_id">Credential ID</Label>
                  <Input 
                    id="credential_id"
                    name="credential_id"
                    value={formData.credential_id}
                    onChange={handleInputChange}
                    placeholder="ABC123DEF456"
                  />
                </div>

                <div>
                  <Label htmlFor="score">Score/Grade</Label>
                  <Input 
                    id="score"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder="95%"
                  />
                </div>

                <div>
                  <Label htmlFor="total_score">Total Score/Grade Scale</Label>
                  <Input 
                    id="total_score"
                    name="total_score"
                    value={formData.total_score}
                    onChange={handleInputChange}
                    placeholder="100%"
                  />
                </div>

                <div>
                  <Label htmlFor="hours_completed">Hours Completed</Label>
                  <Input 
                    id="hours_completed"
                    name="hours_completed"
                    type="number"
                    value={formData.hours_completed}
                    onChange={handleInputChange}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="credential_url">Credential URL</Label>
                  <Input
                    id="credential_url"
                    name="credential_url"
                    type="url"
                    value={formData.credential_url}
                    onChange={handleInputChange}
                    placeholder="https://www.credly.com/badges/..."
                  />
                </div>

                <div>
                  <Label htmlFor="certificate_url">Certificate URL</Label>
                  <Input
                    id="certificate_url"
                    name="certificate_url"
                    type="url"
                    value={formData.certificate_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>

                <div>
                  <Label htmlFor="verification_url">Verification URL</Label>
                  <Input
                    id="verification_url"
                    name="verification_url"
                    type="url"
                    value={formData.verification_url}
                    onChange={handleInputChange}
                    placeholder="https://verify.example.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="badge_image">Badge Image</Label>
                  
                  {/* Image Preview */}
                  {(badgePreview || formData.badge_image_url) && (
                    <div className="mb-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={badgePreview || formData.badge_image_url}
                          alt="Badge preview"
                          width={96}
                          height={96}
                          className="object-contain w-full h-full bg-white/5"
                        />
                        <button
                          type="button"
                          onClick={removeExistingBadge}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="badge_image"
                        type="file"
                        accept="image/*"
                        onChange={handleBadgeSelect}
                        className="flex-1"
                      />
                      {badgeFile && (
                        <Button type="button" variant="outline" onClick={clearBadge}>
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* File Info */}
                    {badgeFile && (
                      <p className="text-sm text-green-600">
                        Selected: {badgeFile.name} (
                        {(badgeFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, WebP. Max size: 2MB. Square images work best.
                    </p>
                  </div>

                  {/* Manual URL Option */}
                  <div className="mt-4">
                    <Label htmlFor="badge_image_url" className="text-sm text-muted-foreground">
                      Or enter URL manually:
                    </Label>
                    <Input
                      id="badge_image_url"
                      name="badge_image_url"
                      type="url"
                      value={formData.badge_image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/badge.png"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Permanent</Label>
                    <p className="text-sm text-muted-foreground">
                      Never expires
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_permanent}
                    onCheckedChange={(checked) => handleSwitchChange("is_permanent", checked)}
                  />
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Featured</Label>
                    <p className="text-sm text-muted-foreground">
                      Highlight this certification
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                  />
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Show publicly
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={saving || uploading}>
                  {uploading ? "Uploading..." : saving ? "Saving..." : (editingCert ? "Update" : "Create")} Certification
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {certifications.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              No Certifications Yet
            </h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
              Showcase your professional achievements and credentials. Add your first certification to build credibility with visitors.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Certification
            </Button>
            
            <div className="flex items-center gap-6 mt-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Showcase credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Build trust</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Stand out</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {certifications.map((cert) => (
            <Card key={cert.id} className={`transition-all duration-200 hover:shadow-lg ${
              isExpired(cert) 
                ? 'border-orange-200 dark:border-orange-800/50 bg-orange-50/30 dark:bg-orange-950/20' 
                : cert.is_featured
                ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500/20 dark:ring-blue-400/20'
                : 'hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {cert.badge_image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={cert.badge_image_url}
                          alt={`${cert.title} badge`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        {cert.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                        {isExpired(cert) && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Expired
                          </span>
                        )}
                        {!cert.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        {getCategoryIcon(cert.category)}
                        <span className="font-medium">{cert.issuing_organization}</span>
                        {cert.level && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(cert.level)}`}>
                            {cert.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Issued: {formatDate(cert.issue_date)}</span>
                        </div>
                        {!cert.is_permanent && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {cert.expiry_date ? `Expires: ${formatDate(cert.expiry_date)}` : "No expiry"}
                            </span>
                          </div>
                        )}
                        {cert.is_permanent && (
                          <span className="text-green-600 font-medium">Permanent</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.credential_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(cert)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCertification(cert.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {(cert.description || cert.skills_covered?.length) && (
                <CardContent className="pt-0">
                  {cert.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {cert.description}
                    </p>
                  )}
                  
                  {cert.skills_covered && cert.skills_covered.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Skills Covered:</h4>
                      <div className="flex flex-wrap gap-1">
                        {cert.skills_covered.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(cert.score || cert.hours_completed) && (
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {cert.score && (
                        <span>Score: {cert.score}{cert.total_score && `/${cert.total_score}`}</span>
                      )}
                      {cert.hours_completed && (
                        <span>{cert.hours_completed} hours completed</span>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}