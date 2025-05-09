"use client";

import { supabase } from "@/lib/supabase/client";
import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define the SocialLink interface directly
interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching social links:", error);
        return;
      }

      setSocialLinks(data || []);
    };

    fetchSocialLinks();
  }, []);

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
        return null;
    }
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Raihan Sharif</h3>
            <p className="text-muted-foreground mb-4">
              Full Stack Developer with 6+ years of experience in .NET, React,
              Next.js, and more.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span className="text-muted-foreground">
                  contact@raihansharif.com
                </span>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Raihan Sharif. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Designed & Developed with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
