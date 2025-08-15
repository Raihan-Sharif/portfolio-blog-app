"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GRADIENTS } from "@/lib/design-constants";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Clock,
  Code,
  Coffee,
  ExternalLink,
  Facebook,
  Github,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

interface AboutSettings {
  years_experience?: number;
  location?: string;
  email?: string;
  phone?: string;
}

interface FooterStats {
  totalProjects: number;
  totalPosts: number;
  totalSkills: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [aboutSettings, setAboutSettings] = useState<AboutSettings | null>(
    null
  );
  const [stats, setStats] = useState<FooterStats | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchFooterData();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchFooterData = async () => {
    try {
      // Fetch social links
      const { data: socialData } = await supabase
        .from("social_links")
        .select("*")
        .order("id");

      // Fetch about settings for contact info
      const { data: aboutData } = await supabase
        .from("about_settings")
        .select("years_experience, location, email, phone")
        .eq("is_active", true)
        .single();

      // Fetch service categories
      const { data: categoriesData } = await supabase
        .from("service_categories")
        .select("id, name, slug, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6); // Limit to 6 categories for footer

      // Fetch stats
      const [
        { count: totalProjects },
        { count: totalPosts },
        { count: totalSkills },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("published", true),
        supabase.from("skills").select("*", { count: "exact", head: true }),
      ]);

      setSocialLinks(socialData || []);
      setAboutSettings(aboutData);
      setServiceCategories(categoriesData || []);
      setStats({
        totalProjects: totalProjects || 0,
        totalPosts: totalPosts || 0,
        totalSkills: totalSkills || 0,
      });
    } catch (error) {
      console.error("Error fetching footer data:", error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconProps = { size: 20 };

    switch (platform.toLowerCase()) {
      case "github":
        return <Github {...iconProps} />;
      case "linkedin":
        return <Linkedin {...iconProps} />;
      case "twitter":
        return <Twitter {...iconProps} />;
      case "instagram":
        return <Instagram {...iconProps} />;
      case "youtube":
        return <Youtube {...iconProps} />;
      case "facebook":
        return <Facebook {...iconProps} />;
      case "email":
        return <Mail {...iconProps} />;
      default:
        return <ExternalLink {...iconProps} />;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/skills", label: "Skills" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  // Generate dynamic service links from categories
  const serviceLinks = [
    ...serviceCategories.map(category => ({
      label: category.name,
      href: `/services?category=${category.id}`
    })),
    // Add additional service links if needed
    ...(serviceCategories.length < 6 ? [
      { label: "View All Services", href: "/services" },
      { label: "Get Consultation", href: "/contact" }
    ] : [])
  ];

  return (
    <footer className="relative bg-card/50 backdrop-blur-sm border-t border-white/10">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Link href="/" className="inline-block mb-6">
              <h3 className={`text-2xl font-bold ${GRADIENTS.primaryText}`}>
                Raihan Sharif
              </h3>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Full Stack Developer with {aboutSettings?.years_experience || "6"}
              + years of experience in building modern web applications using
              cutting-edge technologies.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {aboutSettings?.location && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{aboutSettings.location}</span>
                </div>
              )}
              {aboutSettings?.email && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href={`mailto:${aboutSettings.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {aboutSettings.email}
                  </a>
                </div>
              )}
              {aboutSettings?.phone && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <a
                    href={`tel:${aboutSettings.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {aboutSettings.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 group"
                  aria-label={link.platform}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getSocialIcon(link.platform)}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 transform inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((service) => (
                <li key={service.label}>
                  <Link
                    href={service.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:translate-x-1 transform inline-block"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Stats & Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Portfolio Stats
            </h4>

            {stats && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">
                      Projects
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {stats.totalProjects}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <span className="text-sm text-muted-foreground">
                      Blog Posts
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-600"
                    >
                      {stats.totalPosts}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <span className="text-sm text-muted-foreground">
                      Skills
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/10 text-green-600"
                    >
                      {stats.totalSkills}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-3">
                Ready to start your project?
              </p>
              <Button asChild size="sm" className="w-full gap-2">
                <Link href="/contact">
                  <Mail className="w-4 h-4" />
                  Get In Touch
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Separator className="opacity-20" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span>© {currentYear} Raihan Sharif. All rights reserved.</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span>Designed & Developed with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>and</span>
            <Coffee className="w-4 h-4 text-amber-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
}
