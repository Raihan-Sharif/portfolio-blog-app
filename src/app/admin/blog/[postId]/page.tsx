"use client";

import AdminLayout from "@/components/admin/admin-layout";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { ImageUploader } from "@/components/ui/image-uploader";
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
import { slugify } from "@/lib/utils";
import { AlertCircle, ArrowLeft, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface BlogPostEditorProps {
  params: {
    postId: string;
  };
}

export default function BlogPostEditor({ params }: BlogPostEditorProps) {
  const router = useRouter();
  const isNewPost = params.postId === "new";
  const [loading, setLoading] = useState(!isNewPost);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const hasLoadedRef = useRef(false);
  const [slugEdited, setSlugEdited] = useState(false); // Track if user manually edited slug
  const [formState, setFormState] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: {},
    cover_image_url: "",
    published: false,
    category_id: null as number | null,
  });

  const fetchData = useCallback(async () => {
    if (hasLoadedRef.current) return;

    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setCategories(categoriesData || []);

      // Fetch tags
      const { data: tagsData } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      setAllTags(tagsData || []);

      // If editing an existing post, fetch it
      if (!isNewPost) {
        // Fetch post data
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", params.postId)
          .single();

        if (postError) {
          throw postError;
        }

        if (post) {
          setFormState({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || {},
            cover_image_url: post.cover_image_url || "",
            published: post.published || false,
            category_id: post.category_id || null,
          });

          // Mark slug as edited since it's from existing post
          setSlugEdited(true);

          // Fetch selected tags
          const { data: postTags, error: tagsError } = await supabase
            .from("post_tags")
            .select("tag_id")
            .eq("post_id", params.postId);

          if (tagsError) {
            console.error("Error fetching post tags:", tagsError);
          } else if (postTags) {
            setSelectedTags(postTags.map((tag) => tag.tag_id));
          }
        }
      }

      hasLoadedRef.current = true;
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isNewPost, params.postId]);

  // Make sure we only fetch once
  useEffect(() => {
    fetchData();

    // Add page refresh protection
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [fetchData, saving]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === "title") {
      // Auto-generate slug from title if slug hasn't been manually edited
      if (!slugEdited) {
        const generatedSlug = slugify(value);
        setFormState((prev) => ({
          ...prev,
          title: value,
          slug: generatedSlug,
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          title: value,
        }));
      }
    } else if (name === "slug") {
      // Mark slug as manually edited
      setSlugEdited(true);
      setFormState((prev) => ({
        ...prev,
        slug: slugify(value), // Always slugify the slug input
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string | number | null) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleContentChange = (content: any) => {
    setFormState((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleTagToggle = (e: React.MouseEvent, tagId: number) => {
    e.preventDefault(); // Prevent form submission

    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Function to regenerate slug from title
  const regenerateSlug = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSlug = slugify(formState.title);
    setFormState((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    setSlugEdited(true);
  };

  // Check if slug exists
  const checkSlugExists = async (slug: string, excludeId?: string) => {
    if (!slug) return false;

    let query = supabase.from("posts").select("id").eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;
    return data && data.length > 0;
  };

  const savePost = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevent form submission

    try {
      setSaving(true);
      setError(null);

      const {
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        published,
        category_id,
      } = formState;

      if (!title || !slug) {
        throw new Error("Title and slug are required");
      }

      // Check if slug already exists
      const slugExists = await checkSlugExists(
        slug,
        isNewPost ? undefined : params.postId
      );
      if (slugExists) {
        throw new Error(
          "This slug already exists. Please choose a different one."
        );
      }

      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save a post");
      }

      if (isNewPost) {
        // Create new post
        const { data: newPost, error: insertError } = await supabase
          .from("posts")
          .insert({
            title,
            slug,
            excerpt,
            content,
            cover_image_url,
            published,
            category_id,
            author_id: user.id,
          })
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        // Handle tags if any are selected
        if (selectedTags.length > 0 && newPost) {
          const tagInserts = selectedTags.map((tagId) => ({
            post_id: newPost.id,
            tag_id: tagId,
          }));

          const { error: tagError } = await supabase
            .from("post_tags")
            .insert(tagInserts);

          if (tagError) {
            throw tagError;
          }
        }
      } else {
        // Update existing post
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            title,
            slug,
            excerpt,
            content,
            cover_image_url,
            published,
            category_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", params.postId);

        if (updateError) {
          throw updateError;
        }

        // First, delete existing tags
        await supabase.from("post_tags").delete().eq("post_id", params.postId);

        // Then, add new tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map((tagId) => ({
            post_id: params.postId,
            tag_id: tagId,
          }));

          const { error: tagError } = await supabase
            .from("post_tags")
            .insert(tagInserts);

          if (tagError) {
            throw tagError;
          }
        }
      }

      // Redirect to the post list
      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      console.error("Error saving post:", err);
      setError(err.message || "Failed to save post. Please try again.");
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

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/blog">
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
              {isNewPost ? "Create New Post" : "Edit Post"}
            </h1>
          </div>
          <Button
            onClick={savePost}
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
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                    placeholder="Post title"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="slug"
                    className="flex items-center justify-between"
                  >
                    <span>Slug *</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={regenerateSlug}
                      disabled={!formState.title}
                      className="h-6 px-2 text-xs"
                      title="Regenerate slug from title"
                    >
                      <RefreshCw size={12} className="mr-1" />
                      Regenerate
                    </Button>
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formState.slug}
                    onChange={handleChange}
                    placeholder="post-url-slug"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL-friendly version of the title. Will be auto-generated if
                    left empty.
                  </p>
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formState.excerpt || ""}
                    onChange={handleChange}
                    placeholder="Brief summary of the post"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cover_image_url">Cover Image</Label>
                  <div className="mt-2">
                    <ImageUploader
                      initialImageUrl={formState.cover_image_url || ""}
                      onImageUploaded={(url) =>
                        setFormState((prev) => ({
                          ...prev,
                          cover_image_url: url,
                        }))
                      }
                      bucketName="raihan-blog-app"
                      folderPath="public"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formState.category_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange(
                        "category_id",
                        value ? parseInt(value) : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Label className="mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <div
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                          selectedTags.includes(tag.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent hover:bg-primary/20"
                        }`}
                        onClick={(e) => handleTagToggle(e, tag.id)}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formState.published}
                    onCheckedChange={(checked) =>
                      handleToggleChange("published", checked)
                    }
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="content" className="mb-2 block">
                Content *
              </Label>
              <RichTextEditor
                initialContent={formState.content}
                onChange={handleContentChange}
              />
            </div>
          </div>
        </FormWrapper>
      </div>
    </AdminLayout>
  );
}
