"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define the HeroSettings interface
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

// Define the SocialLink interface
interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

export default function Hero() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Fetch hero settings
        const { data: heroData, error: heroError } = await supabase
          .from("hero_settings")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (heroError && heroError.code !== "PGRST116") {
          console.error("Error fetching hero settings:", heroError);
        } else if (heroData) {
          setHeroSettings(heroData);
        }

        // Fetch social links
        const { data: socialData, error: socialError } = await supabase
          .from("social_links")
          .select("*")
          .order("id");

        if (socialError) {
          console.error("Error fetching social links:", socialError);
        } else {
          setSocialLinks(socialData || []);
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
          '<span class="text-primary bg-primary/10 px-2 py-1 rounded-md">$1</span>'
        );
      }
    });

    return highlightedText;
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center py-16">
        <div className="container mx-auto px-4 z-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

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
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={item}>
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

            {settings.subtitle && (
              <motion.div variants={item}>
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

            {settings.description && (
              <motion.div variants={item}>
                <p className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
                  {settings.description}
                </p>
              </motion.div>
            )}

            <motion.div variants={item} className="flex flex-wrap gap-4">
              {settings.cta_primary_text && settings.cta_primary_url && (
                <Link href={settings.cta_primary_url}>
                  <Button
                    size="lg"
                    className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {settings.cta_secondary_text}
                  </Button>
                </Link>
              )}
            </motion.div>

            {socialLinks.length > 0 && (
              <motion.div variants={item} className="flex space-x-4">
                {socialLinks.slice(0, 3).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    aria-label={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg aspect-square">
              {/* Background SVG Effect */}
              {settings.background_svg_url && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 opacity-20"
                >
                  <Image
                    src={settings.background_svg_url}
                    alt="Background design"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              )}

              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-10 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-10 left-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"
                />
              </div>

              {/* Hero Image */}
              {settings.hero_image_url ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={settings.hero_image_url}
                    alt="Raihan Sharif"
                    fill
                    className="object-contain z-10 drop-shadow-2xl"
                    priority
                  />

                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent rounded-full blur-3xl"></div>
                </motion.div>
              ) : (
                // Placeholder when no image is set
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border-2 border-dashed border-primary/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-primary"
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
                    <p className="text-muted-foreground text-sm">Hero Image</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowDown className="text-muted-foreground" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
