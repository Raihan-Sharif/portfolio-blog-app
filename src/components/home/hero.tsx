// src/components/home/hero.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define the interfaces
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
  created_at: string;
  updated_at?: string;
}

interface HeroProps {
  heroSettings: HeroSettings | null;
  socialLinks?: SocialLink[]; // Make this optional with ?
}

export default function Hero({
  heroSettings = null,
  socialLinks = [],
}: HeroProps) {
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

  // Function to highlight specific words in text
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

  return (
    <section className="relative min-h-screen flex items-center py-16 overflow-hidden">
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

          {/* Medium floating elements */}
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 50, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
              delay: 3,
            }}
            className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl"
          />

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

        {/* Custom SVG Background Integration */}
        {settings.background_svg_url && (
          <div className="absolute inset-0">
            {/* Primary SVG layer */}
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
                  style={{ filter: "hue-rotate(45deg) saturate(0.7)" }}
                />
              </div>
            </motion.div>

            {/* Secondary SVG layer with different effects */}
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ duration: 3, ease: "easeOut", delay: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-5xl max-h-5xl">
                <Image
                  src={settings.background_svg_url}
                  alt="Background design overlay"
                  fill
                  className="object-contain"
                  style={{
                    filter: "hue-rotate(120deg) saturate(0.5) blur(1px)",
                    transform: "rotate(15deg)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
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
              {settings.cta_primary_text && settings.cta_primary_url && (
                <Link href={settings.cta_primary_url}>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8"
                  >
                    {settings.cta_primary_text}
                  </Button>
                </Link>
              )}
              {settings.cta_secondary_text && settings.cta_secondary_url && (
                <Link href={settings.cta_secondary_url}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full px-8 border-2 hover:bg-primary/10 transition-all duration-300"
                  >
                    {settings.cta_secondary_text}
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Social links */}
            {socialLinks && socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex space-x-4"
              >
                {socialLinks.slice(0, 3).map((link) => (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group p-4 rounded-full bg-card/50 backdrop-blur-sm border border-white/10 hover:border-primary/30 hover:bg-primary/10 text-primary transition-all duration-300 hover:shadow-lg"
                    aria-label={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </motion.div>{" "}
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
                        alt="Raihan Sharif"
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
                          Professional Photo
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
            className="rounded-full hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowDown className="text-muted-foreground w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
