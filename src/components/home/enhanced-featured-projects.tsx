"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  ChevronDown,
  Clock,
  Code2,
  Crown,
  ExternalLink,
  Eye,
  Filter,
  Github,
  Globe,
  Grid3X3,
  Heart,
  Layers,
  List,
  Medal,
  Monitor,
  Play,
  Search,
  Server,
  Smartphone,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Enhanced interfaces
interface Technology {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  category: string;
  official_url?: string;
  proficiency_level?: string;
  is_primary: boolean;
}

interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

interface ProjectAward {
  id: number;
  title: string;
  description?: string;
  award_image_url?: string;
  awarded_by?: string;
  award_date?: string;
  award_url?: string;
  display_order: number;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  featured_image_url?: string;
  hero_image_url?: string;
  gallery_images?: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  video_url?: string;
  demo_video_url?: string;
  github_url?: string;
  demo_url?: string;
  case_study_url?: string;
  documentation_url?: string;
  category?: ProjectCategory;
  project_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  client_name?: string;
  team_size?: number;
  my_role?: string;
  platform?: string;
  key_features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  results_achieved?: Array<{
    metric: string;
    value: string;
    description?: string;
  }>;
  technologies?: Technology[];
  awards?: ProjectAward[];
  featured: boolean;
  priority: number;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  updated_at?: string;
}

interface EnhancedProjectsPageProps {
  projects: Project[];
  categories: ProjectCategory[];
  showFilters?: boolean;
  maxProjects?: number;
  showViewAll?: boolean;
  title?: string;
  subtitle?: string;
}

const getPlatformIcon = (platform?: string, className = "w-4 h-4") => {
  const iconProps = { className: cn(className, "text-muted-foreground") };

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
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getProjectTypeIcon = (type?: string) => {
  const iconProps = { size: 16, className: "text-muted-foreground" };

  switch (type) {
    case "web-app":
      return <Globe {...iconProps} />;
    case "mobile-app":
      return <Smartphone {...iconProps} />;
    case "desktop-app":
      return <Monitor {...iconProps} />;
    case "api":
      return <Server {...iconProps} />;
    case "e-commerce":
      return <Star {...iconProps} />;
    case "saas":
      return <Layers {...iconProps} />;
    default:
      return <Code2 {...iconProps} />;
  }
};

// Enhanced Awards Display Component with Multiple Styles
const ProjectAwardsDisplay = ({ awards }: { awards: ProjectAward[] }) => {
  if (!awards || awards.length === 0) return null;

  const topAward = awards[0]; // Most important award (sorted by display_order)
  const additionalAwardsCount = awards.length - 1;

  return (
    <div className="absolute top-3 left-3 z-20">
      <div className="flex flex-col gap-2">
        {/* Premium Award Badge with Enhanced Animations */}
        <motion.div
          initial={{ scale: 0, rotate: -15, y: -20 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.2,
          }}
          className="relative group cursor-pointer"
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          {/* Main Award Container with Glass Effect */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 text-white px-3 py-2 rounded-xl shadow-xl border border-white/40 backdrop-blur-md max-w-[160px]">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse opacity-30" />

            {/* Content */}
            <div className="relative flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <div className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                  <Trophy className="w-3 h-3 text-white drop-shadow-sm" />
                </div>
                {/* Pulsing Ring Effect */}
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[9px] font-black tracking-wider uppercase bg-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    🏆 Winner
                  </span>
                </div>
                <span className="text-[11px] font-bold text-white/95 truncate leading-tight">
                  {topAward.title}
                </span>
                {topAward.awarded_by && (
                  <span className="text-[9px] text-white/80 truncate leading-tight">
                    by {topAward.awarded_by}
                  </span>
                )}
              </div>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1 -right-1"
          >
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-2.5 h-2.5 text-white fill-current" />
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [0, 4, 0],
              x: [0, -3, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -bottom-0.5 -left-0.5"
          >
            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
              <Medal className="w-2 h-2 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Awards Counter with Premium Design */}
        {additionalAwardsCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 200,
            }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-2 py-1.5 rounded-lg shadow-lg border border-white/30 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-0.5">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full border border-white/50 flex items-center justify-center">
                    <Award className="w-1.5 h-1.5 text-white" />
                  </div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full border border-white/50 flex items-center justify-center">
                    <Medal className="w-1.5 h-1.5 text-white" />
                  </div>
                  {additionalAwardsCount > 2 && (
                    <div className="w-3 h-3 bg-red-400 rounded-full border border-white/50 flex items-center justify-center">
                      <Crown className="w-1.5 h-1.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold">
                  +{additionalAwardsCount} MORE
                </span>
              </div>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-purple-400/30 rounded-lg blur-md -z-10" />
          </motion.div>
        )}

        {/* Floating Award Date Badge */}
        {topAward.award_date && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg border border-white/20"
          >
            <div className="text-[8px] font-medium text-center">
              <Calendar className="w-2 h-2 inline mr-1" />
              {new Date(topAward.award_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Enhanced Project Card Component
const EnhancedProjectCard = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleProjectClick = () => {
    // Navigate immediately for better UX
    router.push(`/projects/${project.slug}`);

    // Track view in background (fire-and-forget)
    supabase
      .rpc("increment_project_view", {
        project_id_param: project.id,
      })
      .then(
        () => {
          // Success - no action needed
        },
        (error) => {
          console.error("Error tracking project view:", error);
          // Continue anyway - don't block user experience
        }
      );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-2 cursor-pointer"
      onClick={handleProjectClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden">
        {project.featured_image_url || project.hero_image_url ? (
          <Image
            src={project.featured_image_url || project.hero_image_url || ""}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            {getProjectTypeIcon(project.project_type)}
          </div>
        )}

        {/* Awards Display */}
        <ProjectAwardsDisplay awards={project.awards || []} />

        {/* Status and Featured Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {project.featured && (
            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </motion.div>
          )}

          {project.status && (
            <Badge className={cn("text-xs", getStatusColor(project.status))}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          )}
        </div>

        {/* Overlay with Action Buttons */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
            >
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex gap-2">
                  {project.demo_url && (
                    <motion.a
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </motion.a>
                  )}
                  {project.github_url && (
                    <motion.a
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                    </motion.a>
                  )}
                  {project.demo_video_url && (
                    <motion.a
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      href={project.demo_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </motion.a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-2">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">
                      {project.view_count || 0}
                    </span>
                  </div>
                  {project.like_count > 0 && (
                    <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span className="text-white text-xs">
                        {project.like_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Project Details */}
      <div className="p-6">
        {/* Category and Platform */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {project.category && (
              <Badge
                variant="outline"
                style={{ borderColor: project.category.color }}
                className="text-xs"
              >
                {project.category.name}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              {getPlatformIcon(project.platform)}
              <span className="text-xs text-muted-foreground capitalize">
                {project.platform || "Web"}
              </span>
            </div>
          </div>

          {project.start_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(project.start_date).getFullYear()}
            </div>
          )}
        </div>

        {/* Title and Subtitle */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="text-sm text-muted-foreground font-medium line-clamp-1">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Awards Summary - Enhanced */}
        {project.awards && project.awards.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-yellow-400 rounded-full">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  {project.awards.length === 1
                    ? "Award Winner"
                    : `${project.awards.length} Awards Won`}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 line-clamp-1">
                  {project.awards[0].title}
                  {project.awards[0].awarded_by &&
                    ` by ${project.awards[0].awarded_by}`}
                </p>
                {project.awards.length > 1 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    +{project.awards.length - 1} more award
                    {project.awards.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {project.technologies
                .filter((tech) => tech.is_primary)
                .slice(0, 4)
                .map((tech) => (
                  <Badge
                    key={tech.id}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: tech.color }}
                  >
                    {tech.name}
                  </Badge>
                ))}
              {project.technologies.filter((tech) => tech.is_primary).length >
                4 && (
                <Badge variant="outline" className="text-xs">
                  +
                  {project.technologies.filter((tech) => tech.is_primary)
                    .length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {project.duration_months && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{project.duration_months}mo</span>
            </div>
          )}
          {project.team_size && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{project.team_size}</span>
            </div>
          )}
          {project.client_name && (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Client</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" className="gap-1">
                <ExternalLink className="w-3 h-3" />
                Demo
              </Button>
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="gap-1">
                <Github className="w-3 h-3" />
                Code
              </Button>
            </a>
          )}
          {project.case_study_url && (
            <a
              href={project.case_study_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="gap-1">
                <Star className="w-3 h-3" />
                Case Study
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// List View Component
const EnhancedProjectListItem = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const router = useRouter();

  // const handleProjectClick = async () => {
  //   try {
  //     await supabase.rpc("increment_project_view", {
  //       project_id_param: project.id,
  //     });
  //     router.push(`/projects/${project.slug}`);
  //   } catch (error) {
  //     console.error("Error tracking project view:", error);
  //     router.push(`/projects/${project.slug}`);
  //   }
  // };

  // Update the handleProjectClick function in EnhancedProjectCard component
  const handleProjectClick = () => {
    // Navigate immediately for better UX (optimistic navigation)
    router.push(`/projects/${project.slug}`);

    // NO view tracking here - let the detail page handle it
    // This prevents double tracking and conflicts
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group flex gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
      onClick={handleProjectClick}
    >
      {/* Project Image */}
      <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
        {project.featured_image_url || project.hero_image_url ? (
          <Image
            src={project.featured_image_url || project.hero_image_url || ""}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            {getProjectTypeIcon(project.project_type)}
          </div>
        )}

        {/* Awards Badge for List View */}
        {project.awards && project.awards.length > 0 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              {project.awards.length} Award
              {project.awards.length > 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {project.category && (
                <Badge
                  variant="outline"
                  style={{ borderColor: project.category.color }}
                  className="text-xs"
                >
                  {project.category.name}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                {getPlatformIcon(project.platform)}
                <span className="text-xs text-muted-foreground capitalize">
                  {project.platform || "Web"}
                </span>
              </div>
              {project.status && (
                <Badge
                  className={cn("text-xs", getStatusColor(project.status))}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="text-sm text-muted-foreground font-medium mb-2 line-clamp-1">
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{project.view_count || 0}</span>
            </div>
            {project.like_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{project.like_count}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Awards in List View */}
        {project.awards && project.awards.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  {project.awards[0].title}
                </p>
                {project.awards[0].awarded_by && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    by {project.awards[0].awarded_by}
                  </p>
                )}
                {project.awards.length > 1 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    +{project.awards.length - 1} more award
                    {project.awards.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Technologies and Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {project.technologies &&
              project.technologies
                .filter((tech) => tech.is_primary)
                .slice(0, 6)
                .map((tech) => (
                  <Badge
                    key={tech.id}
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: tech.color }}
                  >
                    {tech.name}
                  </Badge>
                ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.duration_months && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{project.duration_months}mo</span>
              </div>
            )}
            {project.team_size && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{project.team_size}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" className="gap-1">
                <ExternalLink className="w-3 h-3" />
                Demo
              </Button>
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="gap-1">
                <Github className="w-3 h-3" />
                Code
              </Button>
            </a>
          )}
          {project.case_study_url && (
            <a
              href={project.case_study_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="gap-1">
                <Star className="w-3 h-3" />
                Case Study
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function EnhancedFeaturedProjects({
  projects,
  categories,
  showFilters = true,
  maxProjects,
  showViewAll = true,
  title = "My Projects",
  subtitle,
}: EnhancedProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "popular" | "featured"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Get unique platforms and statuses for filters
  const uniquePlatforms = useMemo(() => {
    const platforms = projects.map((p) => p.platform).filter(Boolean);
    return [...new Set(platforms)];
  }, [projects]);

  const uniqueStatuses = useMemo(() => {
    const statuses = projects.map((p) => p.status).filter(Boolean);
    return [...new Set(statuses)];
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.technologies?.some((tech) =>
          tech.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory || project.category?.slug === selectedCategory;

      const matchesPlatform =
        !selectedPlatform || project.platform === selectedPlatform;

      const matchesStatus =
        !selectedStatus || project.status === selectedStatus;

      return (
        matchesSearch && matchesCategory && matchesPlatform && matchesStatus
      );
    });

    // Sort projects
    filtered.sort((a, b) => {
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
        case "featured":
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.priority - a.priority;
        default:
          return 0;
      }
    });

    // Limit projects if maxProjects is specified
    if (maxProjects) {
      filtered = filtered.slice(0, maxProjects);
    }

    return filtered;
  }, [
    projects,
    searchQuery,
    selectedCategory,
    selectedPlatform,
    selectedStatus,
    sortBy,
    maxProjects,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedPlatform(null);
    setSelectedStatus(null);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedPlatform || selectedStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {subtitle ||
                `Explore my portfolio of ${projects.length} projects spanning various technologies and industries. From web applications to mobile solutions, each project represents innovation and technical excellence.`}
            </p>
          </motion.div>

          {/* Search and Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search projects by name, description, or technology..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>

                {/* Filter Toggle */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        showFiltersPanel && "rotate-180"
                      )}
                    />
                  </Button>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="featured">Featured First</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex border border-border rounded-md overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "px-3 py-2 text-sm transition-colors flex items-center gap-1",
                          viewMode === "grid"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "px-3 py-2 text-sm transition-colors flex items-center gap-1",
                          viewMode === "list"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <List className="w-4 h-4" />
                        List
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                  {showFiltersPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50 mt-4">
                        {/* Category Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Category
                          </label>
                          <select
                            value={selectedCategory || ""}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value || null)
                            }
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                          >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.slug}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Platform Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Platform
                          </label>
                          <select
                            value={selectedPlatform || ""}
                            onChange={(e) =>
                              setSelectedPlatform(e.target.value || null)
                            }
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                          >
                            <option value="">All Platforms</option>
                            {uniquePlatforms.map((platform) => (
                              <option
                                key={platform ?? "unknown"}
                                value={platform ?? ""}
                              >
                                {platform
                                  ? platform.charAt(0).toUpperCase() +
                                    platform.slice(1)
                                  : "Unknown"}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Status
                          </label>
                          <select
                            value={selectedStatus || ""}
                            onChange={(e) =>
                              setSelectedStatus(e.target.value || null)
                            }
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                          >
                            <option value="">All Statuses</option>
                            {uniqueStatuses.map((status) => (
                              <option
                                key={status ?? "unknown"}
                                value={status ?? "unknown"}
                              >
                                {status
                                  ? status.charAt(0).toUpperCase() +
                                    status.slice(1)
                                  : "Unknown"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {hasActiveFilters && (
                        <div className="flex justify-between items-center pt-4">
                          <div className="flex flex-wrap gap-2">
                            {searchQuery && (
                              <Badge variant="secondary" className="gap-1">
                                Search: {searchQuery}
                                <X
                                  className="w-3 h-3 cursor-pointer"
                                  onClick={() => setSearchQuery("")}
                                />
                              </Badge>
                            )}
                            {selectedCategory && (
                              <Badge variant="secondary" className="gap-1">
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.slug === selectedCategory
                                  )?.name
                                }
                                <X
                                  className="w-3 h-3 cursor-pointer"
                                  onClick={() => setSelectedCategory(null)}
                                />
                              </Badge>
                            )}
                            {selectedPlatform && (
                              <Badge variant="secondary" className="gap-1">
                                Platform: {selectedPlatform}
                                <X
                                  className="w-3 h-3 cursor-pointer"
                                  onClick={() => setSelectedPlatform(null)}
                                />
                              </Badge>
                            )}
                            {selectedStatus && (
                              <Badge variant="secondary" className="gap-1">
                                Status: {selectedStatus}
                                <X
                                  className="w-3 h-3 cursor-pointer"
                                  onClick={() => setSelectedStatus(null)}
                                />
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear All
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          {showFilters && (
            <div className="mb-8 text-center">
              <p className="text-muted-foreground">
                Showing {filteredAndSortedProjects.length} of {projects.length}{" "}
                projects
              </p>
            </div>
          )}

          {/* Projects Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-20">
                <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No projects found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedProjects.map((project, index) => (
                  <EnhancedProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedProjects.map((project, index) => (
                  <EnhancedProjectListItem
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* View All Projects Button */}
          {showViewAll && maxProjects && projects.length > maxProjects && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link href="/projects">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  View All Projects
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
