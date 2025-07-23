"use client";

import { ViewTracker } from "@/components/view-tracker";

import ShareButton from "@/components/shared/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  Github,
  Globe,
  Heart,
  Lightbulb,
  Monitor,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Star,
  Target,
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
      return <CheckCircle {...iconProps} />;
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
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation Buttons */}
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

          {/* Image */}
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

          {/* Image Info */}
          {images[currentIndex].caption && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg">
              <p className="text-center">{images[currentIndex].caption}</p>
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto p-2">
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
      // Fallback: copy to clipboard
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* View Tracker - Client Component for tracking project views */}

      <ViewTracker
        type="project"
        id={project.id}
        delay={3000} // 3 seconds total delay
        debug={process.env.NODE_ENV === "development"} // Enable debug mode
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <NextLink href="/projects">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </NextLink>

            <div className="flex items-center gap-2">
              <ShareButton
                title={project.title}
                description={project.subtitle || project.description}
                variant="inline"
                size="md"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLiked(!liked)}
                className={cn(liked && "text-red-500")}
              >
                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              </Button>
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
          >
            {/* Project Image */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
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
                    {/* Zoom Overlay */}
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

                {/* Status Badge */}
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

                {/* Awards Badge */}
                {project.awards && project.awards.length > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      {project.awards.length} Award
                      {project.awards.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}

                {/* Stats */}
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

              {/* Enhanced Gallery Thumbnails */}
              {project.gallery_images && project.gallery_images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Project Gallery ({project.gallery_images.length})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
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
                        {/* Hover Overlay */}
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
              {/* Category and Platform */}
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

              {/* Title and Subtitle */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {project.title}
                </h1>
                {project.subtitle && (
                  <p className="text-xl text-muted-foreground font-medium">
                    {project.subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.duration_months && (
                  <div className="text-center p-3 bg-card/50 rounded-lg border">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">
                      {project.duration_months}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Month{project.duration_months > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
                {project.team_size && (
                  <div className="text-center p-3 bg-card/50 rounded-lg border">
                    <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{project.team_size}</div>
                    <div className="text-xs text-muted-foreground">
                      Team Member{project.team_size > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
                {project.start_date && (
                  <div className="text-center p-3 bg-card/50 rounded-lg border">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">
                      {new Date(project.start_date).getFullYear()}
                    </div>
                    <div className="text-xs text-muted-foreground">Year</div>
                  </div>
                )}
                {project.technologies && (
                  <div className="text-center p-3 bg-card/50 rounded-lg border">
                    <Code2 className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">
                      {project.technologies.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Technologies
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </Button>
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="gap-2">
                      <Github className="w-4 h-4" />
                      Source Code
                    </Button>
                  </a>
                )}

                {project.case_study_url && (
                  <a
                    href={project.case_study_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Case Study
                    </Button>
                  </a>
                )}

                {project.documentation_url && (
                  <a
                    href={project.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Documentation
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Awards Section */}
              {project.awards && project.awards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Awards & Recognition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.awards.map((award, idx) => (
                          <div
                            key={idx}
                            className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Award Image */}
                            {award.award_image_url && (
                              <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-lg">
                                <Image
                                  src={award.award_image_url}
                                  alt={award.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Award Content */}
                            <div className="text-center">
                              <h4 className="font-bold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                                {award.title}
                              </h4>

                              {award.awarded_by && (
                                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                                  by {award.awarded_by}
                                </p>
                              )}

                              {award.award_date && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">
                                  {new Date(
                                    award.award_date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                  })}
                                </p>
                              )}

                              {award.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                  {award.description}
                                </p>
                              )}

                              {award.award_url && (
                                <a
                                  href={award.award_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Award
                                </a>
                              )}
                            </div>

                            {/* Decorative Trophy Icon */}
                            <div className="absolute top-3 right-3 opacity-20">
                              <Trophy className="w-6 h-6 text-yellow-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Key Features */}
              {project.key_features && project.key_features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Key Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.key_features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 p-4 rounded-lg bg-accent/30 border border-white/10"
                          >
                            <div className="flex-shrink-0">
                              {getFeatureIcon(feature.icon)}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        Technology Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(technologiesByCategory).map(
                        ([category, techs]) => (
                          <div key={category} className="mb-6 last:mb-0">
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {techs.map((tech) => (
                                <div key={tech.id} className="group">
                                  {tech.official_url ? (
                                    <a
                                      href={tech.official_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block"
                                    >
                                      <Badge
                                        variant="outline"
                                        className="hover:bg-primary/10 transition-colors cursor-pointer"
                                        style={{ borderColor: tech.color }}
                                      >
                                        {tech.name}
                                        {tech.is_primary && (
                                          <Star className="w-3 h-3 ml-1 fill-current" />
                                        )}
                                      </Badge>
                                    </a>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      style={{ borderColor: tech.color }}
                                    >
                                      {tech.name}
                                      {tech.is_primary && (
                                        <Star className="w-3 h-3 ml-1 fill-current" />
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Challenges & Solutions */}
              {project.challenges_faced &&
                project.challenges_faced.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Challenges & Solutions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {project.challenges_faced.map((challenge, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">
                                Challenge: {challenge.title}
                              </h4>
                              <p className="text-muted-foreground mb-3">
                                {challenge.description}
                              </p>
                              {challenge.solution && (
                                <>
                                  <h5 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                                    Solution:
                                  </h5>
                                  <p className="text-muted-foreground">
                                    {challenge.solution}
                                  </p>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              {/* Results */}
              {project.results_achieved &&
                project.results_achieved.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Results Achieved
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {project.results_achieved.map((result, idx) => (
                            <div
                              key={idx}
                              className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50"
                            >
                              <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                                {result.value}
                              </div>
                              <div className="font-medium text-green-600 dark:text-green-500 mb-1">
                                {result.metric}
                              </div>
                              {result.description && (
                                <div className="text-xs text-muted-foreground">
                                  {result.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.my_role && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          My Role
                        </div>
                        <div>{project.my_role}</div>
                      </div>
                    )}

                    {project.client_name && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Client
                        </div>
                        <div>
                          {project.client_url ? (
                            <a
                              href={project.client_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {project.client_name}
                            </a>
                          ) : (
                            project.client_name
                          )}
                        </div>
                      </div>
                    )}

                    {project.target_audience && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Target Audience
                        </div>
                        <div>{project.target_audience}</div>
                      </div>
                    )}

                    {project.development_methodology && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Methodology
                        </div>
                        <div className="capitalize">
                          {project.development_methodology}
                        </div>
                      </div>
                    )}

                    {project.deployment_platform && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Deployment
                        </div>
                        <div>{project.deployment_platform}</div>
                      </div>
                    )}

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    {project.updated_at &&
                      project.updated_at !== project.created_at && (
                        <div className="text-sm text-muted-foreground">
                          Updated{" "}
                          {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
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
    </div>
  );
}
