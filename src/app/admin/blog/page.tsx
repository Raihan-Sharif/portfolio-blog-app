"use client";

import AdminLayout from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TabSafeLink } from "@/components/ui/tab-safe-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { getReadTime } from "@/lib/utils";
import {
  AlertCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Use a simple interface
interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  content?: any;
  created_at: string;
  updated_at: string;
  view_count: number;
  // Use any for flexibility
  category: any;
  author: any;
}

// Helper function to extract text content from blog content
function extractTextContent(content: any): string {
  if (!content) return "";

  if (typeof content === "string") {
    // Remove HTML tags
    return content.replace(/<[^>]*>/g, "");
  }

  if (content.html && typeof content.html === "string") {
    // Remove HTML tags from html content
    return content.html.replace(/<[^>]*>/g, "");
  }

  if (content.json && content.json.content) {
    // Extract text from TipTap JSON structure
    const extractFromNodes = (nodes: any[]): string => {
      let text = "";
      nodes.forEach((node: any) => {
        if (node.type === "text") {
          text += node.text || "";
        } else if (node.content) {
          text += extractFromNodes(node.content);
        }
      });
      return text;
    };

    return extractFromNodes(content.json.content);
  }

  return "";
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          title,
          slug,
          published,
          content,
          created_at,
          updated_at,
          view_count,
          category:categories(name),
          author:profiles(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Use double casting to bypass TypeScript's type checking
      setPosts(data as unknown as Post[]);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to fetch posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter posts client-side for simplicity
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.slug.toLowerCase().includes(searchLower) ||
      // Safe access patterns
      post.category?.name?.toLowerCase()?.includes(searchLower) ||
      false ||
      post.author?.full_name?.toLowerCase()?.includes(searchLower) ||
      false
    );
  });

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);

      // First delete any related post_tags entries
      await supabase.from("post_tags").delete().eq("post_id", postToDelete.id);

      // Then delete the post
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postToDelete.id);

      if (error) {
        throw error;
      }

      // Remove post from state
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Blog Posts</h1>

          <Link href="/admin/blog/new">
            <Button className="gap-2">
              <Plus size={18} />
              New Post
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex w-full gap-2">
              <Input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md"
              />
              <Button type="submit" size="icon">
                <Search size={18} />
              </Button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => {
                    const textContent = extractTextContent(post.content);
                    const readingTime = getReadTime(textContent);

                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-md truncate">
                          <div className="flex items-center gap-2">
                            <FileText
                              size={16}
                              className="text-muted-foreground flex-shrink-0"
                            />
                            <span className="truncate">{post.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={post.published ? "default" : "outline"}
                            className={post.published ? "bg-green-500" : ""}
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.category?.name || "-"}</TableCell>
                        <TableCell>{post.author?.full_name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock
                              size={14}
                              className="text-muted-foreground"
                            />
                            {readingTime} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye size={14} className="text-muted-foreground" />
                            {post.view_count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/admin/blog/${post.id}`)
                              }
                              title="Edit"
                              type="button"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(post)}
                              title="Delete"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </Button>
                            {post.published && (
                              <TabSafeLink
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                                title="View"
                              >
                                <Eye size={16} />
                              </TabSafeLink>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{postToDelete?.title}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
