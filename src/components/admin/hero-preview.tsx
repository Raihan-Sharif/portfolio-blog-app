// src/components/admin/hero-preview.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Github,
  Linkedin,
  Mail,
  Monitor,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeroSettings {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  hero_image_url: string;
  background_svg_url: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  highlight_words: string[];
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
}

interface HeroPreviewProps {
  heroSettings: HeroSettings | null;
  socialLinks?: SocialLink[];
  className?: string;
  showControls?: boolean;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

export default function HeroPreview({
  heroSettings,
  socialLinks = [],
  className = "",
  showControls = true,
}: HeroPreviewProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");

  const getSocialIcon = (platform: string) => {
    const iconProps = { size: 20 };

    switch (platform.toLowerCase()) {
      case "github":
        return <Github {...iconProps} />;
      case "linkedin":
        return <Linkedin {...iconProps} />;
      case "email":
        return <Mail {...iconProps} />;
      default:
        return null;
    }
  };

  const getHighlightedText = (text: string, highlightWords: string[] = []) => {
    if (!highlightWords || highlightWords.length === 0) {
      return text;
    }

    let highlightedText = text;
    highlightWords.forEach((word) => {
      if (word) {
        const regex = new RegExp(`(${word})`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          '<span class="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">$1</span>'
        );
      }
    });

    return highlightedText;
  };

  // Fallback content if no hero settings found
  const fallbackSettings: HeroSettings = {
    id: 0,
    title: "Hi, I'm Raihan Sharif",
    subtitle: "Full Stack Developer",
    description:
      "With over 6 years of experience, I specialize in building modern web applications using .NET, ASP.NET, React, Next.js, JavaScript, SQL Server, and DevOps. I focus on creating robust, scalable solutions with exceptional user experiences.",
    hero_image_url: "",
    background_svg_url: "",
    cta_primary_text: "View My Work",
    cta_primary_url: "/projects",
    cta_secondary_text: "Contact Me",
    cta_secondary_url: "/contact",
    highlight_words: ["Raihan Sharif"],
  };

  const settings = heroSettings || fallbackSettings;

  const getViewportClasses = () => {
    switch (viewportSize) {
      case "mobile":
        return "w-[375px] h-[667px]";
      case "tablet":
        return "w-[768px] h-[1024px]";
      default:
        return "w-full h-[600px]";
    }
  };

  const getContentScale = () => {
    switch (viewportSize) {
      case "mobile":
        return "scale-[0.4]";
      case "tablet":
        return "scale-[0.6]";
      default:
        return "scale-[0.8]";
    }
  };

  return (
    <Card
      className={`overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 ${className}`}
    >
      {showControls && (
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2">Hero Section Preview</span>
            </CardTitle>

            {/* Viewport size controls */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-inner">
              <Button
                variant={viewportSize === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("desktop")}
                className="gap-2"
              >
                <Monitor size={16} />
                <span className="hidden sm:inline">Desktop</span>
              </Button>
              <Button
                variant={viewportSize === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("tablet")}
                className="gap-2"
              >
                <Tablet size={16} />
                <span className="hidden sm:inline">Tablet</span>
              </Button>
              <Button
                variant={viewportSize === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("mobile")}
                className="gap-2"
              >
                <Smartphone size={16} />
                <span className="hidden sm:inline">Mobile</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0 bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-700/50">
        <div className="flex items-center justify-center min-h-[600px] p-6">
          <div
            className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${getViewportClasses()}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            {/* Preview Content */}
            <div
              className={`w-[1200px] h-[800px] origin-top-left transition-transform duration-500 ${getContentScale()}`}
              style={{
                transformOrigin: "0 0",
              }}
            >
              {/* Hero Section - Full replica */}
              <section className="relative min-h-full flex items-center py-16 overflow-hidden bg-gradient-to-br from-background via-background to-accent/20">
                {/* Advanced Background System */}
                <div className="absolute inset-0 z-0">
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20"></div>

                  {/* Animated mesh gradient */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/20 via-transparent to-cyan-500/20"></div>
                  </div>

                  {/* Dynamic floating elements */}
                  <div className="absolute inset-0">
                    {/* Large floating orbs */}
                    <motion.div
                      animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{
                        x: [0, -80, 0],
                        y: [0, 30, 0],
                        scale: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                      }}
                      className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
                    />

                    {/* Custom SVG Background Integration */}
                    {settings.background_svg_url && (
                      <div className="absolute inset-0">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.15, scale: 1 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="relative w-full h-full max-w-4xl max-h-4xl">
                            <Image
                              src={settings.background_svg_url}
                              alt="Background design"
                              fill
                              className="object-contain"
                              style={{
                                filter: "hue-rotate(45deg) saturate(0.7)",
                              }}
                            />
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Small sparkle effects */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut",
                        }}
                        className="absolute w-2 h-2 bg-primary rounded-full"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${10 + i * 12}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Gradient overlays for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40"></div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-8 z-10 relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="space-y-8"
                    >
                      {/* Animated badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full text-sm font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Available for freelance projects</span>
                      </motion.div>

                      {/* Main title */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                      >
                        <h1
                          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                          dangerouslySetInnerHTML={{
                            __html: getHighlightedText(
                              settings.title,
                              settings.highlight_words
                            ),
                          }}
                        />
                      </motion.div>

                      {/* Subtitle */}
                      {settings.subtitle && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                        >
                          <h2
                            className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-light"
                            dangerouslySetInnerHTML={{
                              __html: getHighlightedText(
                                settings.subtitle,
                                settings.highlight_words
                              ),
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Description */}
                      {settings.description && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        >
                          <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
                            {settings.description}
                          </p>
                        </motion.div>
                      )}

                      {/* Action buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="flex flex-wrap gap-4"
                      >
                        {settings.cta_primary_text &&
                          settings.cta_primary_url && (
                            <Button
                              size="lg"
                              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 pointer-events-none"
                            >
                              {settings.cta_primary_text}
                            </Button>
                          )}
                        {settings.cta_secondary_text &&
                          settings.cta_secondary_url && (
                            <Button
                              size="lg"
                              variant="outline"
                              className="gap-2 rounded-full px-8 border-2 hover:bg-primary/10 transition-all duration-300 pointer-events-none"
                            >
                              {settings.cta_secondary_text}
                            </Button>
                          )}
                      </motion.div>

                      {/* Social links */}
                      {socialLinks.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2, duration: 0.8 }}
                          className="flex space-x-4"
                        >
                          {socialLinks.slice(0, 3).map((link) => (
                            <motion.div
                              key={link.id}
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="group p-4 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-primary/10 text-primary transition-all duration-300 hover:shadow-lg pointer-events-none"
                            >
                              {getSocialIcon(link.platform)}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="relative flex justify-center lg:justify-end"
                    >
                      <div className="relative w-full max-w-lg">
                        {/* Image container with advanced effects */}
                        <div className="relative aspect-square">
                          {/* Animated background rings */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 30,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 p-4"
                          >
                            <div className="w-full h-full rounded-full border border-white/10"></div>
                          </motion.div>

                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{
                              duration: 25,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-2 rounded-full bg-gradient-to-l from-cyan-500/20 via-emerald-500/20 to-teal-500/20 p-4"
                          >
                            <div className="w-full h-full rounded-full border border-white/10"></div>
                          </motion.div>

                          {/* Main image */}
                          {settings.hero_image_url ? (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                              className="relative w-full h-full p-8"
                            >
                              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                                <Image
                                  src={settings.hero_image_url}
                                  alt="Hero Image"
                                  fill
                                  className="object-cover"
                                  priority
                                />

                                {/* Image overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/10"></div>
                              </div>

                              {/* Floating elements around image */}
                              <motion.div
                                animate={{
                                  y: [0, -10, 0],
                                  x: [0, 5, 0],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Sparkles className="w-8 h-8 text-white" />
                              </motion.div>

                              <motion.div
                                animate={{
                                  y: [0, 8, 0],
                                  x: [0, -3, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 6,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: 1,
                                }}
                                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                              />
                            </motion.div>
                          ) : (
                            // Enhanced placeholder
                            <div className="relative w-full h-full p-8">
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 rounded-full border-2 border-dashed border-primary/30 backdrop-blur-sm">
                                <div className="text-center">
                                  <div className="w-20 h-20 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <svg
                                      className="w-10 h-10 text-primary"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-muted-foreground text-sm font-medium">
                                    Upload Hero Image
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced scroll indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <span className="text-xs text-muted-foreground font-medium">
                      Scroll to explore
                    </span>
                    <div className="rounded-full hover:bg-primary/10 transition-all duration-300 p-2 pointer-events-none">
                      <ArrowDown className="text-muted-foreground w-5 h-5" />
                    </div>
                  </motion.div>
                </motion.div>
              </section>
            </div>
          </div>
        </div>

        {/* Preview Information */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t p-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium">Preview Mode:</span>{" "}
              {viewportSize.charAt(0).toUpperCase() + viewportSize.slice(1)}
            </div>
            <div className="flex items-center gap-4">
              <span>
                Scale:{" "}
                {viewportSize === "mobile"
                  ? "40%"
                  : viewportSize === "tablet"
                  ? "60%"
                  : "80%"}
              </span>
              <span>•</span>
              <span>Live Preview</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
