"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Table components replaced with div-based implementation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Github,
  Globe,
  Monitor,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Smartphone,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Technology {
  id: number;
  name: string;
  slug: string;
  color?: string;
  category: string;
}

interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  featured_image_url?: string;
  github_url?: string;
  demo_url?: string;
  category?: ProjectCategory;
  project_type?: string;
  status?: string;
  start_date?: string;
  platform?: string;
  team_size?: number;
  technologies?: Technology[];
  featured: boolean;
  priority: number;
  view_count: number;
  like_count: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

const getPlatformIcon = (platform?: string) => {
  const iconProps = { size: 16, className: "text-muted-foreground" };

  switch (platform?.toLowerCase()) {
    case "web":
      return <Globe {...iconProps} />;
    case "mobile":
      return <Smartphone {...iconProps} />;
    case "desktop":
      return <Monitor {...iconProps} />;
    case "cross-platform":
      return <Server {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "in-progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    case "maintenance":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
    case "planning":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
    case "archived":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getStatusIcon = (status?: string) => {
  const iconProps = { size: 12 };

  switch (status) {
    case "completed":
      return <CheckCircle {...iconProps} className="text-green-500" />;
    case "in-progress":
      return <Clock {...iconProps} className="text-blue-500" />;
    case "maintenance":
      return <AlertCircle {...iconProps} className="text-orange-500" />;
    case "planning":
      return <Clock {...iconProps} className="text-purple-500" />;
    case "archived":
      return <Archive {...iconProps} className="text-gray-500" />;
    default:
      return <Clock {...iconProps} className="text-gray-500" />;
  }
};

export default function AdminProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "popular" | "priority"
  >("newest");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects with related data
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(
          `
          *,
          category:project_categories(*),
          project_technologies(
            technology:technologies(id, name, color, category)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("project_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (categoriesError) throw categoriesError;

      // Process projects data
      const processedProjects =
        projectsData?.map((project) => ({
          ...project,
          technologies:
            project.project_technologies?.map((pt) => pt.technology) || [],
        })) || [];

      setProjects(processedProjects);
      setCategories(categoriesData || []);

      // Calculate stats
      const totalProjects = processedProjects.length;
      const featuredProjects = processedProjects.filter(
        (p) => p.featured
      ).length;
      const publishedProjects = processedProjects.filter(
        (p) => p.is_public && p.is_active
      ).length;
      const draftProjects = processedProjects.filter(
        (p) => !p.is_public || !p.is_active
      ).length;
      const totalViews = processedProjects.reduce(
        (sum, p) => sum + (p.view_count || 0),
        0
      );

      setStats({
        total: totalProjects,
        featured: featuredProjects,
        published: publishedProjects,
        draft: draftProjects,
        totalViews,
      });
    } catch (err: any) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  const toggleFeatured = async (
    projectId: number,
    currentFeatured: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: !currentFeatured })
        .eq("id", projectId);

      if (error) throw error;

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, featured: !currentFeatured } : p
        )
      );
    } catch (err: any) {
      console.error("Error updating featured status:", err);
      alert("Failed to update featured status");
    }
  };

  const toggleVisibility = async (
    projectId: number,
    currentPublic: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_public: !currentPublic })
        .eq("id", projectId);

      if (error) throw error;

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_public: !currentPublic } : p
        )
      );
    } catch (err: any) {
      console.error("Error updating visibility:", err);
      alert("Failed to update visibility");
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || project.category?.slug === selectedCategory;

      const matchesStatus =
        !selectedStatus || project.status === selectedStatus;

      const matchesVisibility =
        !selectedVisibility ||
        (selectedVisibility === "public" && project.is_public) ||
        (selectedVisibility === "private" && !project.is_public);

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesVisibility
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "popular":
          return b.view_count + b.like_count - (a.view_count + a.like_count);
        case "priority":
          return b.priority - a.priority;
        default:
          return 0;
      }
    });

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
    <div className="container px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects Management</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects and showcase your work
          </p>
        </div>
        <NextLink href="/admin/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </NextLink>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory || ""}
              onValueChange={(value) => setSelectedCategory(value || null)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus || ""}
              onValueChange={(value) => setSelectedStatus(value || null)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Visibility Filter */}
            <Select
              value={selectedVisibility || ""}
              onValueChange={(value) => setSelectedVisibility(value || null)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as any)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                selectedCategory ||
                selectedStatus ||
                selectedVisibility
                  ? "Try adjusting your filters"
                  : "Get started by creating your first project"}
              </p>
              <NextLink href="/admin/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </NextLink>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div className="w-12"></div>
                  <div>Project</div>
                  <div>Category</div>
                  <div>Status</div>
                  <div>Platform</div>
                  <div>Stats</div>
                  <div>Visibility</div>
                  <div>Created</div>
                  <div className="w-12"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-9 gap-4 p-4 group hover:bg-muted/50"
                    >
                      <div>
                        {project.featured_image_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden">
                            <Image
                              src={project.featured_image_url}
                              alt={project.title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {getPlatformIcon(project.platform)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{project.title}</span>
                            {project.featured && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          {project.subtitle && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {project.subtitle}
                            </p>
                          )}
                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="flex gap-1">
                                {project.technologies
                                  .slice(0, 3)
                                  .map((tech) => (
                                    <Badge
                                      key={tech.id}
                                      variant="outline"
                                      className="text-xs px-1 py-0"
                                      style={{ borderColor: tech.color }}
                                    >
                                      {tech.name}
                                    </Badge>
                                  ))}
                                {project.technologies.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0"
                                  >
                                    +{project.technologies.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      <div>
                        {project.category && (
                          <Badge
                            variant="outline"
                            style={{ borderColor: project.category.color }}
                          >
                            {project.category.name}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <Badge
                            className={cn(
                              "text-xs",
                              getStatusColor(project.status)
                            )}
                          >
                            {project.status?.charAt(0).toUpperCase() +
                              project.status?.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(project.platform)}
                          <span className="text-sm capitalize">
                            {project.platform || "Web"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span>{project.view_count || 0}</span>
                            {project.like_count > 0 && (
                              <>
                                <span>•</span>
                                <span>❤️ {project.like_count}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          {project.is_public ? (
                            <>
                              <Globe className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">
                                Public
                              </span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">
                                Private
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <NextLink href={`/admin/projects/${project.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Project
                              </NextLink>
                            </DropdownMenuItem>

                            {project.demo_url && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={project.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Live Demo
                                </a>
                              </DropdownMenuItem>
                            )}

                            {project.github_url && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Github className="w-4 h-4 mr-2" />
                                  View Source
                                </a>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                toggleFeatured(project.id, project.featured)
                              }
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {project.featured
                                ? "Remove from Featured"
                                : "Mark as Featured"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                toggleVisibility(project.id, project.is_public)
                              }
                            >
                              {project.is_public ? (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Globe className="w-4 h-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDelete(project.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
