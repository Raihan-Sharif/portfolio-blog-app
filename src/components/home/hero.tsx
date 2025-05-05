"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { SocialLink } from "@/types";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

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

  return (
    <section className="relative min-h-screen flex items-center py-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"></div>
      </div>
      <div className="container mx-auto px-4 z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={item}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Hi, I&apos;m <span className="text-primary">Raihan Sharif</span>
            </h1>
          </motion.div>
          <motion.div variants={item}>
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-6 text-muted-foreground">
              Full Stack Developer
            </h2>
          </motion.div>
          <motion.div variants={item}>
            <p className="text-lg mb-8 max-w-3xl text-muted-foreground">
              With over 6 years of experience, I specialize in building modern
              web applications using .NET, ASP.NET, React, Next.js, JavaScript,
              SQL Server, and DevOps. I focus on creating robust, scalable
              solutions with exceptional user experiences.
            </p>
          </motion.div>
          <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
            <Link href="/projects">
              <Button size="lg" className="rounded-full">
                View My Work
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full">
                Contact Me
              </Button>
            </Link>
          </motion.div>
          <motion.div variants={item} className="flex space-x-4">
            {socialLinks.slice(0, 3).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                aria-label={link.platform}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
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
          >
            <ArrowDown />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
