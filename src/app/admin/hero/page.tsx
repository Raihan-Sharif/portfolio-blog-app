// src/app/admin/hero/page.tsx
"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle, Eye, Palette, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeroSettings {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  hero_image_url: string;
  background_svg_url: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  highlight_words: string[];
  is_active: boolean;
}

export default function AdminHeroPage() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const hasLoadedRef = useRef(false);

  const [formState, setFormState] = useState({
    title: "",
    subtitle: "",
    description: "",
    hero_image_url: "",
    background_svg_url: "",
    cta_primary_text: "View My Work",
    cta_primary_url: "/projects",
    cta_secondary_text: "Contact Me",
    cta_secondary_url: "/contact",
    highlight_words: "",
    is_active: true,
  });

  useEffect(() => {
    if (!hasLoadedRef.current) {
      fetchHeroSettings();
      hasLoadedRef.current = true;
    }
  }, []);

  const fetchHeroSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("hero_settings")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setHeroSettings(data);
        setFormState({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          hero_image_url: data.hero_image_url || "",
          background_svg_url: data.background_svg_url || "",
          cta_primary_text: data.cta_primary_text || "View My Work",
          cta_primary_url: data.cta_primary_url || "/projects",
          cta_secondary_text: data.cta_secondary_text || "Contact Me",
          cta_secondary_url: data.cta_secondary_url || "/contact",
          highlight_words: Array.isArray(data.highlight_words)
            ? data.highlight_words.join(", ")
            : "",
          is_active: data.is_active ?? true,
        });
      }
    } catch (err: any) {
      console.error("Error fetching hero settings:", err);
      setError(err.message || "Failed to fetch hero settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const {
        title,
        subtitle,
        description,
        hero_image_url,
        background_svg_url,
        cta_primary_text,
        cta_primary_url,
        cta_secondary_text,
        cta_secondary_url,
        highlight_words,
        is_active,
      } = formState;

      if (!title) {
        throw new Error("Title is required");
      }

      // Parse highlight words
      const parsedHighlightWords = highlight_words
        ? highlight_words
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean)
        : [];

      const heroData = {
        title,
        subtitle,
        description,
        hero_image_url,
        background_svg_url,
        cta_primary_text,
        cta_primary_url,
        cta_secondary_text,
        cta_secondary_url,
        highlight_words: parsedHighlightWords,
        is_active,
        updated_at: new Date().toISOString(),
      };

      if (heroSettings?.id) {
        // Update existing
        const { error } = await supabase
          .from("hero_settings")
          .update(heroData)
          .eq("id", heroSettings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from("hero_settings").insert(heroData);

        if (error) throw error;
      }

      setSuccess(true);
      await fetchHeroSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving hero settings:", err);
      setError(err.message || "Failed to save hero settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading hero settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Hero Section Settings</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
              type="button"
            >
              <Eye size={16} />
              {previewMode ? "Edit Mode" : "Preview"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
              type="button"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 rounded-md p-4 mb-6">
            Hero settings saved successfully!
          </div>
        )}

        {previewMode ? (
          <HeroPreview formState={formState} />
        ) : (
          <FormWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content Settings */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette size={18} />
                    Content Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Main Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formState.title}
                        onChange={handleChange}
                        placeholder="Hi, I'm Your Name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        name="subtitle"
                        value={formState.subtitle}
                        onChange={handleChange}
                        placeholder="Your profession or role"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formState.description}
                        onChange={handleChange}
                        placeholder="Brief description about yourself and your expertise"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="highlight_words">
                        Highlight Words (comma-separated)
                      </Label>
                      <Input
                        id="highlight_words"
                        name="highlight_words"
                        value={formState.highlight_words}
                        onChange={handleChange}
                        placeholder="Your Name, Important Words"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Words to highlight in the title/subtitle with primary
                        color
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Settings */}
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">
                    Call-to-Action Buttons
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta_primary_text">
                        Primary Button Text
                      </Label>
                      <Input
                        id="cta_primary_text"
                        name="cta_primary_text"
                        value={formState.cta_primary_text}
                        onChange={handleChange}
                        placeholder="View My Work"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta_primary_url">
                        Primary Button URL
                      </Label>
                      <Input
                        id="cta_primary_url"
                        name="cta_primary_url"
                        value={formState.cta_primary_url}
                        onChange={handleChange}
                        placeholder="/projects"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta_secondary_text">
                        Secondary Button Text
                      </Label>
                      <Input
                        id="cta_secondary_text"
                        name="cta_secondary_text"
                        value={formState.cta_secondary_text}
                        onChange={handleChange}
                        placeholder="Contact Me"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cta_secondary_url">
                        Secondary Button URL
                      </Label>
                      <Input
                        id="cta_secondary_url"
                        name="cta_secondary_url"
                        value={formState.cta_secondary_url}
                        onChange={handleChange}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Settings */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Hero Image</h3>
                  <ImageUploader
                    initialImageUrl={formState.hero_image_url}
                    onImageUploaded={(url) =>
                      setFormState((prev) => ({
                        ...prev,
                        hero_image_url: url,
                      }))
                    }
                    bucketName="raihan-blog-app"
                    folderPath="hero"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload your professional photo (PNG recommended for
                    transparent background)
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Background SVG</h3>
                  <ImageUploader
                    initialImageUrl={formState.background_svg_url}
                    onImageUploaded={(url) =>
                      setFormState((prev) => ({
                        ...prev,
                        background_svg_url: url,
                      }))
                    }
                    bucketName="raihan-blog-app"
                    folderPath="hero/backgrounds"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload an SVG or image for background effects behind your
                    photo
                  </p>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active">Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Make this hero section active on the website
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formState.is_active}
                      onCheckedChange={handleToggleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormWrapper>
        )}
      </div>
    </AdminLayout>
  );
}

// Preview Component
function HeroPreview({ formState }: { formState: any }) {
  const highlightWords = formState.highlight_words
    ? formState.highlight_words.split(",").map((word: string) => word.trim())
    : [];

  const getHighlightedText = (text: string) => {
    if (!highlightWords.length) return text;

    let highlightedText = text;
    highlightWords.forEach((word) => {
      if (word) {
        const regex = new RegExp(`(${word})`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          '<span style="color: hsl(var(--primary))">$1</span>'
        );
      }
    });

    return highlightedText;
  };

  return (
    <div className="bg-card rounded-lg border p-8">
      <h3 className="text-lg font-semibold mb-6">Preview</h3>

      <div className="relative min-h-[400px] bg-gradient-to-br from-background via-accent/30 to-background rounded-lg overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedText(formState.title),
                }}
              />
              {formState.subtitle && (
                <h2
                  className="text-xl md:text-2xl mb-6 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: getHighlightedText(formState.subtitle),
                  }}
                />
              )}
              {formState.description && (
                <p className="text-lg mb-8 text-muted-foreground leading-relaxed">
                  {formState.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                {formState.cta_primary_text && (
                  <Button size="lg" className="rounded-full">
                    {formState.cta_primary_text}
                  </Button>
                )}
                {formState.cta_secondary_text && (
                  <Button size="lg" variant="outline" className="rounded-full">
                    {formState.cta_secondary_text}
                  </Button>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              {formState.background_svg_url && (
                <div className="absolute inset-0 opacity-20">
                  <img
                    src={formState.background_svg_url}
                    alt="Background"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {formState.hero_image_url && (
                <div className="relative z-10">
                  <img
                    src={formState.hero_image_url}
                    alt="Hero"
                    className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
