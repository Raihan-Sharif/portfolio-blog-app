"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  Code2,
  Link,
  Plus,
  Save,
  Star,
  Users,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Technology {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  category: string;
  official_url?: string;
}

interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

interface ProjectTechnology {
  id: number;
  technology_id: number;
  category: string;
  proficiency_level: string;
  is_primary: boolean;
  display_order: number;
  technology?: Technology;
}

interface KeyFeature {
  title: string;
  description: string;
  icon?: string;
}

interface Challenge {
  title: string;
  description: string;
  solution?: string;
}

interface Result {
  metric: string;
  value: string;
  description?: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

interface ProjectEditorProps {
  params: {
    projectId: string;
  };
}

export default function EnhancedProjectEditor({ params }: ProjectEditorProps) {
  const router = useRouter();
  const isNewProject = params.projectId === "new";
  const [loading, setLoading] = useState(!isNewProject);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    content: {},

    // Media
    featured_image_url: "",
    hero_image_url: "",
    gallery_images: [] as GalleryImage[],
    video_url: "",
    demo_video_url: "",

    // Links
    github_url: "",
    demo_url: "",
    case_study_url: "",
    documentation_url: "",
    api_docs_url: "",

    // Project Details
    category_id: null as number | null,
    project_type: "web-app",
    status: "completed",

    // Timeline
    start_date: "",
    end_date: "",
    duration_months: null as number | null,

    // Team & Client
    client_name: "",
    client_url: "",
    team_size: null as number | null,
    my_role: "",

    // Technical Details
    platform: "web",
    target_audience: "",
    development_methodology: "",
    version_control: "git",
    deployment_platform: "",
    hosting_provider: "",

    // Features, Challenges, Results
    key_features: [] as KeyFeature[],
    challenges_faced: [] as Challenge[],
    results_achieved: [] as Result[],

    // SEO & Visibility
    featured: false,
    priority: 0,
    is_public: true,
    is_active: true,
  });

  // Dropdown data
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<
    ProjectTechnology[]
  >([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (!isNewProject) {
      loadProject();
    }
  }, [isNewProject, params.projectId]);

  const loadInitialData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("project_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      // Load technologies
      const { data: technologiesData } = await supabase
        .from("technologies")
        .select("*")
        .eq("is_active", true)
        .order("name");

      setCategories(categoriesData || []);
      setTechnologies(technologiesData || []);
    } catch (err: any) {
      console.error("Error loading initial data:", err);
    }
  };

  const loadProject = async () => {
    try {
      setLoading(true);

      // Load project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select(
          `
          *,
          category:project_categories(*),
          project_technologies(
            *,
            technology:technologies(*)
          )
        `
        )
        .eq("id", params.projectId)
        .single();

      if (projectError) throw projectError;

      if (project) {
        setFormData({
          title: project.title || "",
          slug: project.slug || "",
          subtitle: project.subtitle || "",
          description: project.description || "",
          content: project.content || {},

          featured_image_url: project.featured_image_url || "",
          hero_image_url: project.hero_image_url || "",
          gallery_images: project.gallery_images || [],
          video_url: project.video_url || "",
          demo_video_url: project.demo_video_url || "",

          github_url: project.github_url || "",
          demo_url: project.demo_url || "",
          case_study_url: project.case_study_url || "",
          documentation_url: project.documentation_url || "",
          api_docs_url: project.api_docs_url || "",

          category_id: project.category_id,
          project_type: project.project_type || "web-app",
          status: project.status || "completed",

          start_date: project.start_date || "",
          end_date: project.end_date || "",
          duration_months: project.duration_months,

          client_name: project.client_name || "",
          client_url: project.client_url || "",
          team_size: project.team_size,
          my_role: project.my_role || "",

          platform: project.platform || "web",
          target_audience: project.target_audience || "",
          development_methodology: project.development_methodology || "",
          version_control: project.version_control || "git",
          deployment_platform: project.deployment_platform || "",
          hosting_provider: project.hosting_provider || "",

          key_features: project.key_features || [],
          challenges_faced: project.challenges_faced || [],
          results_achieved: project.results_achieved || [],

          featured: project.featured || false,
          priority: project.priority || 0,
          is_public: project.is_public !== false,
          is_active: project.is_active !== false,
        });

        setSelectedTechnologies(project.project_technologies || []);
      }
    } catch (err: any) {
      console.error("Error loading project:", err);
      setError("Failed to load project data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from title
    if (field === "title" && (isNewProject || !formData.slug)) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(value),
      }));
    }
  };

  const addKeyFeature = () => {
    setFormData((prev) => ({
      ...prev,
      key_features: [
        ...prev.key_features,
        { title: "", description: "", icon: "" },
      ],
    }));
  };

  const updateKeyFeature = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      key_features: prev.key_features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const removeKeyFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index),
    }));
  };

  const addChallenge = () => {
    setFormData((prev) => ({
      ...prev,
      challenges_faced: [
        ...prev.challenges_faced,
        { title: "", description: "", solution: "" },
      ],
    }));
  };

  const updateChallenge = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges_faced: prev.challenges_faced.map((challenge, i) =>
        i === index ? { ...challenge, [field]: value } : challenge
      ),
    }));
  };

  const removeChallenge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      challenges_faced: prev.challenges_faced.filter((_, i) => i !== index),
    }));
  };

  const addResult = () => {
    setFormData((prev) => ({
      ...prev,
      results_achieved: [
        ...prev.results_achieved,
        { metric: "", value: "", description: "" },
      ],
    }));
  };

  const updateResult = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      results_achieved: prev.results_achieved.map((result, i) =>
        i === index ? { ...result, [field]: value } : result
      ),
    }));
  };

  const removeResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      results_achieved: prev.results_achieved.filter((_, i) => i !== index),
    }));
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: [
        ...prev.gallery_images,
        { url: "", caption: "", alt: "" },
      ],
    }));
  };

  const updateGalleryImage = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.map((image, i) =>
        i === index ? { ...image, [field]: value } : image
      ),
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const addTechnology = (technologyId: number) => {
    const technology = technologies.find((t) => t.id === technologyId);
    if (!technology) return;

    if (selectedTechnologies.some((st) => st.technology_id === technologyId)) {
      return; // Already added
    }

    const newTechnology: ProjectTechnology = {
      id: Date.now(), // Temporary ID
      technology_id: technologyId,
      category: technology.category,
      proficiency_level: "intermediate",
      is_primary: false,
      display_order: selectedTechnologies.length,
      technology,
    };

    setSelectedTechnologies((prev) => [...prev, newTechnology]);
  };

  const updateTechnology = (index: number, field: string, value: any) => {
    setSelectedTechnologies((prev) =>
      prev.map((tech, i) => (i === index ? { ...tech, [field]: value } : tech))
    );
  };

  const removeTechnology = (index: number) => {
    setSelectedTechnologies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!formData.title || !formData.slug) {
        throw new Error("Title and slug are required");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to save a project");
      }

      const projectData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      let projectId = params.projectId;

      if (isNewProject) {
        const { data, error: insertError } = await supabase
          .from("projects")
          .insert(projectData)
          .select()
          .single();

        if (insertError) throw insertError;
        projectId = data.id;
      } else {
        const { error: updateError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", params.projectId);

        if (updateError) throw updateError;
      }

      // Handle project technologies
      if (projectId) {
        // Delete existing technologies
        await supabase
          .from("project_technologies")
          .delete()
          .eq("project_id", projectId);

        // Insert new technologies
        if (selectedTechnologies.length > 0) {
          const technologiesData = selectedTechnologies.map((tech) => ({
            project_id: projectId,
            technology_id: tech.technology_id,
            category: tech.category,
            proficiency_level: tech.proficiency_level,
            is_primary: tech.is_primary,
            display_order: tech.display_order,
          }));

          const { error: techError } = await supabase
            .from("project_technologies")
            .insert(technologiesData);

          if (techError) throw techError;
        }
      }

      router.push("/admin/projects");
    } catch (err: any) {
      console.error("Error saving project:", err);
      setError(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <NextLink href="/admin/projects">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft size={18} />
            </Button>
          </NextLink>
          <h1 className="text-2xl font-bold">
            {isNewProject ? "Create New Project" : "Edit Project"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? "Saving..." : "Save Project"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="technologies">Tech Stack</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Amazing Web Application"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      placeholder="amazing-web-application"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      handleInputChange("subtitle", e.target.value)
                    }
                    placeholder="A brief tagline for your project"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Describe your project, its purpose, and key highlights..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange(
                          "category_id",
                          value ? parseInt(value) : null
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project_type">Project Type</Label>
                    <Select
                      value={formData.project_type}
                      onValueChange={(value) =>
                        handleInputChange("project_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-app">Web Application</SelectItem>
                        <SelectItem value="mobile-app">Mobile App</SelectItem>
                        <SelectItem value="desktop-app">Desktop App</SelectItem>
                        <SelectItem value="api">API/Backend</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="e-commerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS Platform</SelectItem>
                        <SelectItem value="game">Game</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media & Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Featured Image</Label>
                    <Input
                      value={formData.featured_image_url}
                      onChange={(e) =>
                        handleInputChange("featured_image_url", e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>Hero Image</Label>
                    <Input
                      value={formData.hero_image_url}
                      onChange={(e) =>
                        handleInputChange("hero_image_url", e.target.value)
                      }
                      placeholder="https://example.com/hero.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) =>
                        handleInputChange("video_url", e.target.value)
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo_video_url">Demo Video URL</Label>
                    <Input
                      id="demo_video_url"
                      value={formData.demo_video_url}
                      onChange={(e) =>
                        handleInputChange("demo_video_url", e.target.value)
                      }
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Gallery Images</Label>
                    <Button
                      onClick={addGalleryImage}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Image
                    </Button>
                  </div>
                  {formData.gallery_images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Image {index + 1}</h4>
                        <Button
                          onClick={() => removeGalleryImage(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={image.url}
                            onChange={(e) =>
                              updateGalleryImage(index, "url", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Caption</Label>
                          <Input
                            value={image.caption || ""}
                            onChange={(e) =>
                              updateGalleryImage(
                                index,
                                "caption",
                                e.target.value
                              )
                            }
                            placeholder="Image caption"
                          />
                        </div>
                        <div>
                          <Label>Alt Text</Label>
                          <Input
                            value={image.alt || ""}
                            onChange={(e) =>
                              updateGalleryImage(index, "alt", e.target.value)
                            }
                            placeholder="Alt text for accessibility"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Details */}
          <TabsContent value="details">
            <div className="space-y-6">
              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Project Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="demo_url">Live Demo URL</Label>
                      <Input
                        id="demo_url"
                        value={formData.demo_url}
                        onChange={(e) =>
                          handleInputChange("demo_url", e.target.value)
                        }
                        placeholder="https://demo.example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github_url">GitHub Repository</Label>
                      <Input
                        id="github_url"
                        value={formData.github_url}
                        onChange={(e) =>
                          handleInputChange("github_url", e.target.value)
                        }
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="case_study_url">Case Study URL</Label>
                      <Input
                        id="case_study_url"
                        value={formData.case_study_url}
                        onChange={(e) =>
                          handleInputChange("case_study_url", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentation_url">
                        Documentation URL
                      </Label>
                      <Input
                        id="documentation_url"
                        value={formData.documentation_url}
                        onChange={(e) =>
                          handleInputChange("documentation_url", e.target.value)
                        }
                        placeholder="https://docs.example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline & Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          handleInputChange("start_date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          handleInputChange("end_date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration_months">Duration (Months)</Label>
                      <Input
                        id="duration_months"
                        type="number"
                        value={formData.duration_months || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "duration_months",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="6"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team & Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="team_size">Team Size</Label>
                      <Input
                        id="team_size"
                        type="number"
                        value={formData.team_size || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "team_size",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="my_role">My Role</Label>
                      <Input
                        id="my_role"
                        value={formData.my_role}
                        onChange={(e) =>
                          handleInputChange("my_role", e.target.value)
                        }
                        placeholder="Full Stack Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_name">Client Name</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) =>
                          handleInputChange("client_name", e.target.value)
                        }
                        placeholder="ABC Company"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select
                        value={formData.platform}
                        onValueChange={(value) =>
                          handleInputChange("platform", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Web</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="cross-platform">
                            Cross-platform
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="development_methodology">
                        Methodology
                      </Label>
                      <Select
                        value={formData.development_methodology}
                        onValueChange={(value) =>
                          handleInputChange("development_methodology", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select methodology" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agile">Agile</SelectItem>
                          <SelectItem value="scrum">Scrum</SelectItem>
                          <SelectItem value="kanban">Kanban</SelectItem>
                          <SelectItem value="waterfall">Waterfall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="version_control">Version Control</Label>
                      <Input
                        id="version_control"
                        value={formData.version_control}
                        onChange={(e) =>
                          handleInputChange("version_control", e.target.value)
                        }
                        placeholder="Git"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deployment_platform">
                        Deployment Platform
                      </Label>
                      <Input
                        id="deployment_platform"
                        value={formData.deployment_platform}
                        onChange={(e) =>
                          handleInputChange(
                            "deployment_platform",
                            e.target.value
                          )
                        }
                        placeholder="Vercel, Netlify, AWS, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="hosting_provider">Hosting Provider</Label>
                      <Input
                        id="hosting_provider"
                        value={formData.hosting_provider}
                        onChange={(e) =>
                          handleInputChange("hosting_provider", e.target.value)
                        }
                        placeholder="AWS, Digital Ocean, etc."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technologies */}
          <TabsContent value="technologies">
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Technology */}
                <div>
                  <Label>Add Technology</Label>
                  <Select
                    onValueChange={(value) => addTechnology(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a technology to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {technologies
                        .filter(
                          (tech) =>
                            !selectedTechnologies.some(
                              (st) => st.technology_id === tech.id
                            )
                        )
                        .map((technology) => (
                          <SelectItem
                            key={technology.id}
                            value={technology.id.toString()}
                          >
                            {technology.name} ({technology.category})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Technologies */}
                <div className="space-y-4">
                  {selectedTechnologies.map((tech, index) => (
                    <div key={tech.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{ backgroundColor: tech.technology?.color }}
                          >
                            {tech.technology?.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {tech.technology?.category}
                          </span>
                        </div>
                        <Button
                          onClick={() => removeTechnology(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Proficiency Level</Label>
                          <Select
                            value={tech.proficiency_level}
                            onValueChange={(value) =>
                              updateTechnology(
                                index,
                                "proficiency_level",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={tech.is_primary}
                            onCheckedChange={(checked) =>
                              updateTechnology(index, "is_primary", checked)
                            }
                          />
                          <Label>Primary Technology</Label>
                        </div>

                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={tech.display_order}
                            onChange={(e) =>
                              updateTechnology(
                                index,
                                "display_order",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <div className="space-y-6">
              {/* Key Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Key Features
                    </CardTitle>
                    <Button onClick={addKeyFeature} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.key_features.map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Feature {index + 1}</h4>
                        <Button
                          onClick={() => removeKeyFeature(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) =>
                              updateKeyFeature(index, "title", e.target.value)
                            }
                            placeholder="Feature title"
                          />
                        </div>
                        <div>
                          <Label>Icon (optional)</Label>
                          <Input
                            value={feature.icon || ""}
                            onChange={(e) =>
                              updateKeyFeature(index, "icon", e.target.value)
                            }
                            placeholder="Lucide icon name"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) =>
                              updateKeyFeature(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Feature description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Results Achieved */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Results Achieved
                    </CardTitle>
                    <Button onClick={addResult} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Result
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.results_achieved.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Result {index + 1}</h4>
                        <Button
                          onClick={() => removeResult(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Metric</Label>
                          <Input
                            value={result.metric}
                            onChange={(e) =>
                              updateResult(index, "metric", e.target.value)
                            }
                            placeholder="e.g., 'Page Load Time'"
                          />
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={result.value}
                            onChange={(e) =>
                              updateResult(index, "value", e.target.value)
                            }
                            placeholder="e.g., '50% faster'"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={result.description || ""}
                            onChange={(e) =>
                              updateResult(index, "description", e.target.value)
                            }
                            placeholder="Additional details"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        handleInputChange(
                          "priority",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Higher numbers appear first
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) =>
                        handleInputChange("target_audience", e.target.value)
                      }
                      placeholder="Developers, Businesses, etc."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        handleInputChange("featured", checked)
                      }
                    />
                    <Label>Featured Project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_public", checked)
                      }
                    />
                    <Label>Public (visible to visitors)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_active", checked)
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
