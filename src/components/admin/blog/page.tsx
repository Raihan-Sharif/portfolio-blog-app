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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import {
  AlertCircle,
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

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  category: {
    name: string;
  } | null;
  author: {
    full_name: string;
  } | null;
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

      setPosts(data || []);
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
      post.category?.name.toLowerCase().includes(searchLower) ||
      post.author?.full_name.toLowerCase().includes(searchLower)
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
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
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
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(post)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" title="View">
                              <Eye size={16} />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
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
