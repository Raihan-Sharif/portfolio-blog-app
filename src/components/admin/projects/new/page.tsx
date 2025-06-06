"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug from title if it's a new project
    if (name === "title" && formState.slug === "") {
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

  const saveProject = async () => {
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

      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save a project");
      }

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

      // Redirect to the projects list
      router.push("/admin/projects");
    } catch (err: any) {
      console.error("Error saving project:", err);
      setError(err.message || "Failed to save project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/projects")}
              className="mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">Create New Project</h1>
          </div>
          <Button onClick={saveProject} disabled={saving} className="gap-2">
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
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formState.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
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
              rows={10}
              placeholder="Detailed project description and technologies used..."
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
