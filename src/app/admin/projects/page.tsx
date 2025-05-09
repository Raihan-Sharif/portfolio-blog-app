"use client";

import AdminLayout from "@/components/admin/admin-layout";
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
  Briefcase,
  Edit,
  ExternalLink,
  Github,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  featured: boolean;
  created_at: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to fetch projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter projects client-side for simplicity
  };

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(searchLower) ||
      project.slug.toLowerCase().includes(searchLower) ||
      (project.description || "").toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) {
        throw error;
      }

      // Remove project from state
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async (project: Project) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: !project.featured })
        .eq("id", project.id);

      if (error) {
        throw error;
      }

      // Update project in state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, featured: !p.featured } : p
        )
      );
    } catch (err: any) {
      console.error("Error toggling featured status:", err);
      alert("Failed to update project. Please try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>

          <Link href="/admin/projects/new">
            <Button className="gap-2">
              <Plus size={18} />
              New Project
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
                placeholder="Search projects..."
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
                  <TableHead>Featured</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium max-w-md truncate">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={16}
                            className="text-muted-foreground flex-shrink-0"
                          />
                          <span className="truncate">{project.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(project)}
                          title={
                            project.featured
                              ? "Remove from featured"
                              : "Add to featured"
                          }
                        >
                          <Star
                            size={16}
                            className={
                              project.featured
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }
                          />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                title="GitHub Repository"
                              >
                                <Github size={16} />
                              </Button>
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Live Demo"
                              >
                                <ExternalLink size={16} />
                              </Button>
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/projects/${project.id}`)
                            }
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(project)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
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
                <span className="font-semibold">{projectToDelete?.title}</span>?
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
