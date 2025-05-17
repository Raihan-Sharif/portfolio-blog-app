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
import { slugify } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface ProjectEditorProps {
  params: {
    projectId: string;
  };
}

export default function ProjectEditor({ params }: ProjectEditorProps) {
  const router = useRouter();
  const isNewProject = params.projectId === "new";
  const [loading, setLoading] = useState(!isNewProject);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [formState, setFormState] = useState({
    title: "",
    slug: "",
    description: "",
    content: {},
    image_url: "",
    github_url: "",
    demo_url: "",
    featured: false,
  });

  const fetchProject = useCallback(async () => {
    if (hasLoadedRef.current) return;

    try {
      setLoading(true);
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.projectId)
        .single();

      if (projectError) {
        throw projectError;
      }

      if (project) {
        setFormState({
          title: project.title || "",
          slug: project.slug || "",
          description: project.description || "",
          content: project.content || {},
          image_url: project.image_url || "",
          github_url: project.github_url || "",
          demo_url: project.demo_url || "",
          featured: project.featured || false,
        });
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [params.projectId]);

  useEffect(() => {
    if (!isNewProject) {
      fetchProject();
    } else {
      setLoading(false);
    }

    // Add page refresh protection
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isNewProject, fetchProject, saving]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault(); // Prevent form submission

    const { name, value } = e.target;

    // Auto-generate slug from title if it's a new project
    if (name === "title" && (isNewProject || formState.slug === "")) {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
        slug: slugify(value),
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); // Prevent form submission

    try {
      // Try to parse as JSON if it's a string representation
      const contentValue = e.target.value.trim().startsWith("{")
        ? JSON.parse(e.target.value)
        : e.target.value;

      setFormState((prev) => ({
        ...prev,
        content: contentValue,
      }));
    } catch (error) {
      // If parsing fails, just store as a string without using an error variable
      setFormState((prev) => ({
        ...prev,
        content: e.target.value,
      }));
    }
  };

  const saveProject = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevent form submission

    try {
      setSaving(true);
      setError(null);

      const {
        title,
        slug,
        description,
        content,
        image_url,
        github_url,
        demo_url,
        featured,
      } = formState;

      if (!title || !slug) {
        throw new Error("Title and slug are required");
      }

      // Get the current user's ID for audit trail
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save a project");
      }

      if (isNewProject) {
        // Create new project
        const { error: insertError } = await supabase.from("projects").insert({
          title,
          slug,
          description,
          content,
          image_url,
          github_url,
          demo_url,
          featured,
        });

        if (insertError) {
          throw insertError;
        }
      } else {
        // Update existing project
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            title,
            slug,
            description,
            content,
            image_url,
            github_url,
            demo_url,
            featured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", params.projectId);

        if (updateError) {
          throw updateError;
        }
      }

      // Redirect to the projects list
      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving project:", err.message || err);
      setError(err.message || "Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  const contentValue =
    typeof formState.content === "object"
      ? JSON.stringify(formState.content, null, 2)
      : String(formState.content || "");

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/projects">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                type="button"
              >
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {isNewProject ? "Create New Project" : "Edit Project"}
            </h1>
          </div>
          <Button
            onClick={saveProject}
            disabled={saving}
            className="gap-2"
            type="button" // CRITICAL FIX: Explicit button type
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <FormWrapper>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formState.slug}
                    onChange={handleChange}
                    placeholder="project-url-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formState.description || ""}
                    onChange={handleChange}
                    placeholder="Brief description of the project"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image_url">Project Image</Label>
                  <div className="mt-2">
                    <ImageUploader
                      initialImageUrl={formState.image_url || ""}
                      onImageUploaded={(url) =>
                        setFormState((prev) => ({
                          ...prev,
                          image_url: url,
                        }))
                      }
                      bucketName="raihan-blog-app"
                      folderPath="public"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={formState.github_url || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div>
                  <Label htmlFor="demo_url">Demo URL</Label>
                  <Input
                    id="demo_url"
                    name="demo_url"
                    value={formState.demo_url || ""}
                    onChange={handleChange}
                    placeholder="https://demo-site.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formState.featured}
                    onCheckedChange={(checked) =>
                      handleToggleChange("featured", checked)
                    }
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="content" className="mb-2 block">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                value={contentValue}
                onChange={handleContentChange}
                rows={10}
                placeholder="Detailed project description and technologies used..."
              />
            </div>
          </div>
        </FormWrapper>
      </div>
    </AdminLayout>
  );
}
