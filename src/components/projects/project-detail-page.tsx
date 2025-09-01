"use client";

import ShareButton from "@/components/shared/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ViewTracker } from "@/components/view-tracker";
import ScrollTriggeredPopup from "@/components/lead-generation/scroll-triggered-popup";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ConfettiAwardsSection } from "./confetti-awards-section";
import "./project-detail-page.css";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Database,
  ExternalLink,
  Eye,
  Github,
  Globe,
  Heart,
  Lightbulb,
  MessageSquare,
  Monitor,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";

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
  content?: any;
  featured_image_url?: string;
  hero_image_url?: string;
  gallery_images?: GalleryImage[];
  video_url?: string;
  demo_video_url?: string;
  github_url?: string;
  demo_url?: string;
  case_study_url?: string;
  documentation_url?: string;
  api_docs_url?: string;
  category?: ProjectCategory;
  project_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  client_name?: string;
  client_url?: string;
  team_size?: number;
  my_role?: string;
  platform?: string;
  target_audience?: string;
  key_features?: KeyFeature[];
  challenges_faced?: Challenge[];
  results_achieved?: Result[];
  user_feedback?: Array<{
    name: string;
    role?: string;
    company?: string;
    feedback: string;
    rating?: number;
  }>;
  technologies?: Technology[];
  awards?: ProjectAward[];
  development_methodology?: string;
  version_control?: string;
  deployment_platform?: string;
  hosting_provider?: string;
  featured: boolean;
  priority: number;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  updated_at?: string;
}

interface ProjectDetailPageProps {
  project: Project;
  relatedProjects?: Project[];
}

const getPlatformIcon = (platform?: string, className = "w-5 h-5") => {
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

const getFeatureIcon = (iconName?: string) => {
  const iconProps = { size: 20, className: "text-primary" };

  switch (iconName?.toLowerCase()) {
    case "zap":
      return <Zap {...iconProps} />;
    case "shield":
      return <Shield {...iconProps} />;
    case "rocket":
      return <Rocket {...iconProps} />;
    case "target":
      return <Target {...iconProps} />;
    case "award":
      return <Award {...iconProps} />;
    case "star":
      return <Star {...iconProps} />;
    case "lightbulb":
      return <Lightbulb {...iconProps} />;
    case "trending":
      return <TrendingUp {...iconProps} />;
    default:
      return <CheckCircle2 {...iconProps} />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "frontend":
      return <Globe className="w-5 h-5" />;
    case "backend":
      return <Server className="w-5 h-5" />;
    case "database":
      return <Database className="w-5 h-5" />;
    case "tools":
      return <Zap className="w-5 h-5" />;
    case "deployment":
      return <Rocket className="w-5 h-5" />;
    default:
      return <Code2 className="w-5 h-5" />;
  }
};

const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case "frontend":
      return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
    case "backend":
      return "from-green-500/20 to-emerald-500/20 border-green-500/30";
    case "database":
      return "from-purple-500/20 to-violet-500/20 border-purple-500/30";
    case "tools":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30";
    case "deployment":
      return "from-red-500/20 to-pink-500/20 border-red-500/30";
    default:
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30";
  }
};

// Helper function to calculate project duration
const calculateDuration = (startDate?: string, endDate?: string) => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 1) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  } else {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  }
};

// Gallery Modal Component
const GalleryModal = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex].url}
              alt={
                images[currentIndex].alt || `Gallery image ${currentIndex + 1}`
              }
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images[currentIndex].caption && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg">
              <p className="text-center">{images[currentIndex].caption}</p>
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto p-2 custom-scrollbar">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                    currentIndex === index
                      ? "border-white"
                      : "border-transparent hover:border-white/50"
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function ProjectDetailPage({
  project,
  relatedProjects = [],
}: ProjectDetailPageProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.subtitle || project.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleGalleryImageClick = (index: number) => {
    setSelectedGalleryImage(index);
    setIsGalleryModalOpen(true);
  };

  const technologiesByCategory =
    project.technologies?.reduce((acc, tech) => {
      if (!acc[tech.category]) {
        acc[tech.category] = [];
      }
      acc[tech.category].push(tech);
      return acc;
    }, {} as Record<string, Technology[]>) || {};

  const projectDuration = calculateDuration(
    project.start_date,
    project.end_date
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/50">
      <ViewTracker
        type="project"
        id={project.id}
        delay={3000}
        debug={process.env.NODE_ENV === "development"}
      />

      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.300)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.700)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/6 w-80 h-80 bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-t from-cyan-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <NextLink href="/projects">
              <Button 
                variant="outline" 
                className="gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </NextLink>

            <div className="flex items-center gap-3">
              <ShareButton
                title={project.title}
                description={project.subtitle || project.description}
                variant="inline"
                size="sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLiked(!liked)}
                className={cn(
                  "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300 dark:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                  liked && "text-red-500 border-red-300 bg-red-50 dark:bg-red-950/20"
                )}
              >
                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20"
          >
            {/* Enhanced Project Image */}
            <div className="space-y-6">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                {project.hero_image_url || project.featured_image_url ? (
                  <>
                    <Image
                      src={
                        project.hero_image_url ||
                        project.featured_image_url ||
                        ""
                      }
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    {getPlatformIcon(project.platform, "w-16 h-16")}
                  </div>
                )}

                {project.status && (
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </Badge>
                  </div>
                )}

                {project.awards && project.awards.length > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      {project.awards.length} Award
                      {project.awards.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">
                      {project.view_count || 0}
                    </span>
                  </div>
                  {project.like_count > 0 && (
                    <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span className="text-white text-xs">
                        {project.like_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {project.gallery_images && project.gallery_images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Project Gallery ({project.gallery_images.length})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {project.gallery_images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGalleryImageClick(idx)}
                        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 group"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `Gallery ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                {project.category && (
                  <Badge
                    variant="outline"
                    style={{ borderColor: project.category.color }}
                  >
                    {project.category.name}
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  {getPlatformIcon(project.platform)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {project.platform || "Web"}
                  </span>
                </div>
                {project.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                  {project.title}
                </h1>
                {project.subtitle && (
                  <p className="text-xl text-muted-foreground font-medium">
                    {project.subtitle}
                  </p>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Enhanced Quick Stats with Glass Effect */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.duration_months && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-center p-4 glass-effect rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-bold text-lg text-foreground">
                      {project.duration_months}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Month{project.duration_months > 1 ? "s" : ""}
                    </div>
                  </motion.div>
                )}
                {project.team_size && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-center p-4 glass-effect rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="font-bold text-lg text-foreground">
                      {project.team_size}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Team Member{project.team_size > 1 ? "s" : ""}
                    </div>
                  </motion.div>
                )}
                {project.start_date && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-center p-4 glass-effect rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="font-bold text-lg text-foreground">
                      {new Date(project.start_date).getFullYear()}
                    </div>
                    <div className="text-xs text-muted-foreground">Year</div>
                  </motion.div>
                )}
                {project.technologies && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-center p-4 glass-effect rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Code2 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <div className="font-bold text-lg text-foreground">
                      {project.technologies.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Technologies
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group button-shimmer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <ExternalLink className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Live Demo</span>
                      </Button>
                    </motion.div>
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Github className="w-4 h-4" />
                        Source Code
                      </Button>
                    </motion.div>
                  </a>
                )}

                {project.case_study_url && (
                  <a
                    href={project.case_study_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <BookOpen className="w-4 h-4" />
                        Case Study
                      </Button>
                    </motion.div>
                  </a>
                )}

                {project.documentation_url && (
                  <a
                    href={project.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <BookOpen className="w-4 h-4" />
                        Documentation
                      </Button>
                    </motion.div>
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Awards Section with Confetti */}
              {project.awards && project.awards.length > 0 && (
                <ConfettiAwardsSection awards={project.awards} />
              )}

              {/* Enhanced Project Overview/Description - Only show if content is different from description */}
              {project.content &&
                typeof project.content === "string" &&
                project.content !== project.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
                      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

                      <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          Project Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="prose prose-lg dark:prose-invert max-w-none"
                        >
                          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: project.content,
                              }}
                            />
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              {/* Enhanced Key Features */}
              {project.key_features && project.key_features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-blue-50/30 to-purple-50/40 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl" />

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg"
                        >
                          <Star className="w-5 h-5 text-white" />
                        </motion.div>
                        Key Features
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Discover the powerful features that make this project
                        stand out
                      </p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.key_features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{
                              y: -5,
                              scale: 1.02,
                              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                            }}
                            className="group relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

                            <div className="relative z-10 flex gap-4">
                              <div className="flex-shrink-0">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors duration-300"
                                >
                                  <CheckCircle2 className="w-6 h-6 text-primary" />
                                </motion.div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                                  {feature.title}
                                </h4>
                                <p className="text-muted-foreground leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Enhanced Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-blue-50/30 to-indigo-50/40 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl" />

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg"
                        >
                          <Code2 className="w-5 h-5 text-white" />
                        </motion.div>
                        Technology Stack
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Cutting-edge technologies powering this project
                      </p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-8">
                        {Object.entries(technologiesByCategory).map(
                          ([category, techs], categoryIdx) => (
                            <motion.div
                              key={category}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.5,
                                delay: categoryIdx * 0.1,
                              }}
                              className={`p-6 rounded-2xl bg-gradient-to-br ${getCategoryGradient(
                                category
                              )} border backdrop-blur-sm hover:scale-[1.01] transition-all duration-300 group`}
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 10 }}
                                  className="w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-md"
                                >
                                  {getCategoryIcon(category)}
                                </motion.div>
                                <h4 className="font-bold text-lg capitalize text-gray-900 dark:text-white">
                                  {category}
                                </h4>
                                <div className="ml-auto">
                                  <Badge variant="outline" className="text-xs">
                                    {techs.length}{" "}
                                    {techs.length === 1 ? "tool" : "tools"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                {techs.map((tech, techIdx) => (
                                  <motion.div
                                    key={tech.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 0.3,
                                      delay: categoryIdx * 0.1 + techIdx * 0.05,
                                    }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="group/tech"
                                  >
                                    {tech.official_url ? (
                                      <a
                                        href={tech.official_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                      >
                                        <Badge
                                          variant="outline"
                                          className={`
                                          relative px-4 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 
                                          hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 
                                          shadow-md hover:shadow-lg cursor-pointer overflow-hidden
                                          ${
                                            tech.is_primary
                                              ? "ring-2 ring-yellow-400/50"
                                              : ""
                                          }
                                        `}
                                          style={{ borderColor: tech.color }}
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/tech:opacity-100 transform -skew-x-12 -translate-x-full group-hover/tech:translate-x-full transition-all duration-700" />

                                          <span className="relative z-10 flex items-center gap-1">
                                            {tech.name}
                                            {tech.is_primary && (
                                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            )}
                                          </span>
                                        </Badge>
                                      </a>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className={`
                                        relative px-4 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 
                                        shadow-md transition-all duration-300
                                        ${
                                          tech.is_primary
                                            ? "ring-2 ring-yellow-400/50"
                                            : ""
                                        }
                                      `}
                                        style={{ borderColor: tech.color }}
                                      >
                                        <span className="flex items-center gap-1">
                                          {tech.name}
                                          {tech.is_primary && (
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                          )}
                                        </span>
                                      </Badge>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Enhanced Challenges & Solutions */}
              {project.challenges_faced &&
                project.challenges_faced.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-red-50/30 to-pink-50/40 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-red-400/20 to-transparent rounded-full blur-2xl" />

                      <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg"
                          >
                            <Lightbulb className="w-5 h-5 text-white" />
                          </motion.div>
                          Challenges & Solutions
                        </CardTitle>
                        <p className="text-muted-foreground">
                          Overcoming obstacles through innovative
                          problem-solving
                        </p>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="space-y-6">
                          {project.challenges_faced.map((challenge, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="group relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

                              <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                      Challenge: {challenge.title}
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                      {challenge.description}
                                    </p>
                                  </div>
                                </div>

                                {challenge.solution && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-start gap-4 pl-4 border-l-2 border-green-200 dark:border-green-700 ml-6"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-bold text-lg mb-2 text-green-600 dark:text-green-400 group-hover:text-green-500 transition-colors duration-300">
                                        Solution:
                                      </h5>
                                      <p className="text-muted-foreground leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                        {challenge.solution}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              {/* Enhanced Results */}
              {project.results_achieved &&
                project.results_achieved.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20" />
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl" />
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-emerald-400/20 to-transparent rounded-full blur-2xl" />

                      <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                          >
                            <TrendingUp className="w-5 h-5 text-white" />
                          </motion.div>
                          Results Achieved
                        </CardTitle>
                        <p className="text-muted-foreground">
                          Measurable impact and outstanding outcomes
                        </p>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {project.results_achieved.map((result, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.5,
                                delay: idx * 0.1,
                                type: "spring",
                                stiffness: 100,
                              }}
                              whileHover={{
                                y: -8,
                                scale: 1.05,
                                boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                              }}
                              className="group relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

                              <div className="relative p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-700/50 shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400/20 to-transparent rounded-full blur-xl" />

                                <div className="relative z-10">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{
                                      delay: 0.2 + idx * 0.1,
                                      type: "spring",
                                    }}
                                    className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:text-green-500 transition-colors duration-300"
                                  >
                                    {result.value}
                                  </motion.div>

                                  <div className="font-semibold text-lg text-green-700 dark:text-green-300 mb-3 group-hover:text-green-600 transition-colors duration-300">
                                    {result.metric}
                                  </div>

                                  {result.description && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileInView={{ opacity: 1 }}
                                      transition={{ delay: 0.3 + idx * 0.1 }}
                                      className="text-sm text-muted-foreground leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-300"
                                    >
                                      {result.description}
                                    </motion.div>
                                  )}
                                </div>

                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  whileInView={{ scale: 1, rotate: 0 }}
                                  transition={{
                                    delay: 0.4 + idx * 0.1,
                                    type: "spring",
                                  }}
                                  className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <Trophy className="w-4 h-4 text-white" />
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              {/* User Feedback Section */}
              {project.user_feedback && project.user_feedback.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-purple-50/40 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </motion.div>
                        User Feedback
                      </CardTitle>
                      <p className="text-muted-foreground">
                        What users are saying about this project
                      </p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.user_feedback
                          .slice(0, 4)
                          .map((feedback, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-lg feedback-card"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                  <ThumbsUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-muted-foreground italic mb-3">
                                    "{feedback.feedback}"
                                  </p>
                                  <div>
                                    <div className="font-semibold">
                                      {feedback.name}
                                    </div>
                                    {feedback.role && (
                                      <div className="text-sm text-muted-foreground">
                                        {feedback.role}{" "}
                                        {feedback.company &&
                                          `at ${feedback.company}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-blue-50/40 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-blue-950/20" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-2xl" />

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md"
                      >
                        <BookOpen className="w-4 h-4 text-white" />
                      </motion.div>
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    {project.my_role && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          My Role
                        </div>
                        <div className="font-semibold text-foreground">
                          {project.my_role}
                        </div>
                      </motion.div>
                    )}

                    {project.client_name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Client
                        </div>
                        <div className="font-semibold">
                          {project.client_url ? (
                            <a
                              href={project.client_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
                            >
                              {project.client_name}
                            </a>
                          ) : (
                            project.client_name
                          )}
                        </div>
                      </motion.div>
                    )}

                    {projectDuration && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Duration
                        </div>
                        <div className="font-semibold text-foreground">
                          {projectDuration}
                        </div>
                      </motion.div>
                    )}

                    {project.target_audience && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Target Audience
                        </div>
                        <div className="font-semibold text-foreground">
                          {project.target_audience}
                        </div>
                      </motion.div>
                    )}

                    {project.development_methodology && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Methodology
                        </div>
                        <div className="font-semibold text-foreground capitalize">
                          {project.development_methodology}
                        </div>
                      </motion.div>
                    )}

                    {project.deployment_platform && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-4 rounded-xl glass-effect border shadow-md"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Deployment
                        </div>
                        <div className="font-semibold text-foreground">
                          {project.deployment_platform}
                        </div>
                      </motion.div>
                    )}

                    <Separator className="my-4" />

                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <div className="p-3 rounded-lg glass-effect border date-display">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Created:</span>
                        </div>
                        <div className="font-semibold text-foreground mt-1">
                          {new Date(project.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>

                      {project.updated_at &&
                        project.updated_at !== project.created_at && (
                          <div className="p-3 rounded-lg glass-effect border date-display">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">Updated:</span>
                            </div>
                            <div className="font-semibold text-foreground mt-1">
                              {new Date(project.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Project Timeline */}
              {(project.start_date || project.end_date) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/40 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"
                        >
                          <Calendar className="w-4 h-4 text-white" />
                        </motion.div>
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        {project.start_date && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <div>
                              <div className="font-semibold">Project Start</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  project.start_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {project.end_date ? (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                              <div className="font-semibold">Project End</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(project.end_date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500 timeline-pulse"></div>
                            <div>
                              <div className="font-semibold">Ongoing</div>
                              <div className="text-sm text-muted-foreground">
                                Project is still in progress
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedProjects.slice(0, 3).map((relatedProject) => (
                        <NextLink
                          key={relatedProject.id}
                          href={`/projects/${relatedProject.slug}`}
                          className="block"
                        >
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              {relatedProject.featured_image_url ? (
                                <Image
                                  src={relatedProject.featured_image_url}
                                  alt={relatedProject.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  {getPlatformIcon(
                                    relatedProject.platform,
                                    "w-4 h-4"
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {relatedProject.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {relatedProject.subtitle ||
                                  relatedProject.description}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </NextLink>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        images={project.gallery_images || []}
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        initialIndex={selectedGalleryImage}
      />

      {/* Scroll Triggered Popup */}
      <ScrollTriggeredPopup scrollPercentage={70} enabled={true} />
    </div>
  );
}
