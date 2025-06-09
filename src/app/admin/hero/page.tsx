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
import { motion } from "framer-motion";
import { AlertCircle, Eye, Palette, Save, Sparkles } from "lucide-react";
import Image from "next/image";
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
                    Upload an SVG or image for background effects. The design
                    will be integrated with animated overlays and blend modes
                    for best visual impact.
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

// Enhanced Preview Component that matches the actual hero
function HeroPreview({ formState }: { formState: any }) {
  const highlightWords = formState.highlight_words
    ? formState.highlight_words.split(",").map((word: string) => word.trim())
    : [];

  const getHighlightedText = (text: string) => {
    if (!highlightWords.length) return text;

    let highlightedText = text;
    highlightWords.forEach((word: string) => {
      if (word) {
        const regex = new RegExp(`(${word})`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          '<span style="background: linear-gradient(to right, hsl(var(--primary)), #8b5cf6, #3b82f6); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: bold;">$1</span>'
        );
      }
    });

    return highlightedText;
  };

  return (
    <div className="bg-card rounded-lg border p-8">
      <h3 className="text-lg font-semibold mb-6">Live Preview</h3>

      <div className="relative min-h-[600px] bg-gradient-to-br from-background via-accent/30 to-background rounded-lg overflow-hidden">
        {/* Advanced Background System Preview */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20"></div>

          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/20 via-transparent to-cyan-500/20"></div>
          </div>

          {/* Dynamic floating elements */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, -25, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -40, 0],
                y: [0, 15, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
            />

            {/* Small sparkle effects */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${15 + i * 15}%`,
                }}
              />
            ))}
          </div>

          {/* Custom SVG Background Integration */}
          {formState.background_svg_url && (
            <div className="absolute inset-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-full h-full max-w-md max-h-md">
                  <Image
                    src={formState.background_svg_url}
                    alt="Background design"
                    fill
                    className="object-contain"
                    style={{ filter: "hue-rotate(45deg) saturate(0.7)" }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.08, scale: 1 }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-full h-full max-w-lg max-h-lg">
                  <Image
                    src={formState.background_svg_url}
                    alt="Background design overlay"
                    fill
                    className="object-contain"
                    style={{
                      filter: "hue-rotate(120deg) saturate(0.5) blur(1px)",
                      transform: "rotate(10deg)",
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Available for freelance projects</span>
              </div>

              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
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
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-purple-600 rounded-full px-8"
                  >
                    {formState.cta_primary_text}
                  </Button>
                )}
                {formState.cta_secondary_text && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    {formState.cta_secondary_text}
                  </Button>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Animated rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 p-2"
                >
                  <div className="w-full h-full rounded-full border border-white/10"></div>
                </motion.div>

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-1 rounded-full bg-gradient-to-l from-cyan-500/20 via-emerald-500/20 to-teal-500/20 p-2"
                >
                  <div className="w-full h-full rounded-full border border-white/10"></div>
                </motion.div>

                {formState.hero_image_url && (
                  <div className="relative w-full h-full p-6">
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                      <Image
                        src={formState.hero_image_url}
                        alt="Hero"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
                    </div>

                    {/* Floating elements */}
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        x: [0, 4, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [0, 6, 0],
                        x: [0, -2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
