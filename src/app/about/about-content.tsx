"use client";

import { Button } from "@/components/ui/button";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

interface AboutSettings {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  profile_image_url?: string;
  resume_url?: string;
  years_experience?: number;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  skills_summary?: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  technologies?: string[];
  company_logo_url?: string;
  company_url?: string;
  employment_type?: string;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  grade_gpa?: string;
  institution_logo_url?: string;
  institution_url?: string;
  degree_type?: string;
}

interface Course {
  id: number;
  title: string;
  provider: string;
  description?: string;
  completion_date?: string;
  certificate_url?: string;
  course_url?: string;
  duration?: string;
  skills_learned?: string[];
  instructor?: string;
  platform?: string;
  rating?: number;
}

interface Workshop {
  id: number;
  title: string;
  organizer: string;
  description?: string;
  event_date?: string;
  location?: string;
  event_type?: string;
  certificate_url?: string;
  event_url?: string;
  skills_gained?: string[];
  duration?: string;
  attendees_count?: number;
}

interface Achievement {
  id: number;
  title: string;
  description?: string;
  achievement_date?: string;
  organization?: string;
  certificate_url?: string;
  achievement_url?: string;
  achievement_type?: string;
}

interface AboutContentProps {
  aboutSettings: AboutSettings | null;
  experiences: Experience[];
  education: Education[];
  courses: Course[];
  workshops: Workshop[];
  achievements: Achievement[];
}

export default function AboutContent({
  aboutSettings,
  experiences,
  education,
  courses,
  workshops,
  achievements,
}: AboutContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const profileScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const profileY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getEmploymentIcon = (type?: string) => {
    switch (type) {
      case "full-time":
        return <Briefcase className="w-4 h-4" />;
      case "part-time":
        return <Clock className="w-4 h-4" />;
      case "contract":
        return <Building className="w-4 h-4" />;
      case "freelance":
        return <Users className="w-4 h-4" />;
      case "internship":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getDegreeIcon = (type?: string) => {
    switch (type) {
      case "bachelor":
        return <GraduationCap className="w-4 h-4" />;
      case "master":
        return <BookOpen className="w-4 h-4" />;
      case "phd":
        return <Star className="w-4 h-4" />;
      case "diploma":
        return <Award className="w-4 h-4" />;
      case "certificate":
        return <Trophy className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background relative overflow-hidden"
    >
      {/* Enhanced Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Dynamic background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -120, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -40, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-red-500/5 rounded-full blur-2xl"
          />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
              className="absolute w-3 h-3 bg-primary/40 rounded-full"
              style={{
                top: `${10 + i * 12}%`,
                left: `${5 + i * 11}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <motion.section
          ref={heroRef}
          className="py-20 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Enhanced Profile Image Section */}
              <motion.div
                className="relative flex justify-center lg:justify-start"
                style={{ scale: profileScale, y: profileY }}
              >
                <div className="relative">
                  {/* Dynamic Background Rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-6 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-sm"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-sm"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-red-500/20 blur-sm"
                  />

                  {/* Main Image Container */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative w-80 h-80 rounded-full overflow-hidden"
                  >
                    {aboutSettings?.profile_image_url ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full h-full z-20"
                      >
                        <Image
                          src={aboutSettings.profile_image_url}
                          alt={aboutSettings.title || "Profile"}
                          fill
                          className="object-cover z-30"
                          priority
                        />
                        {/* Dynamic overlay effects - BEHIND the image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/10 z-10" />
                      </motion.div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-20 h-20 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center"
                          >
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
                          </motion.div>
                          <p className="text-muted-foreground text-sm">
                            Profile Image
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Glass morphism border effect - NOT covering the image */}
                    <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none z-40" />
                  </motion.div>

                  {/* Floating decorative elements */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 10, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-2xl z-50"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 12, 0],
                      x: [0, -8, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-xl flex items-center justify-center z-50"
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      x: [0, 15, 0],
                      rotate: [0, -180, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                    className="absolute top-1/2 -right-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center z-50"
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              {/* Enhanced About Info */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Animated title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {aboutSettings?.title || "About Me"}
                  </h1>
                  {aboutSettings?.subtitle && (
                    <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
                      {aboutSettings.subtitle}
                    </h2>
                  )}
                  {aboutSettings?.description && (
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {aboutSettings.description}
                    </p>
                  )}
                </motion.div>

                {/* Enhanced Stats Cards */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  {aboutSettings?.years_experience && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {aboutSettings.years_experience}+
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Years Experience
                      </div>
                    </motion.div>
                  )}
                  {experiences.length > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-3xl font-bold text-emerald-600">
                          {experiences.length}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Companies
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Contact Info */}
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  {aboutSettings?.location && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-muted-foreground bg-card/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{aboutSettings.location}</span>
                    </motion.div>
                  )}
                  {aboutSettings?.email && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-muted-foreground bg-card/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                    >
                      <Mail className="w-4 h-4" />

                      <a
                        href={`mailto:${aboutSettings.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {aboutSettings.email}
                      </a>
                    </motion.div>
                  )}
                  {aboutSettings?.phone && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-muted-foreground bg-card/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                    >
                      <Phone className="w-4 h-4" />

                      <a
                        href={`tel:${aboutSettings.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {aboutSettings.phone}
                      </a>
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Social Links */}
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  {aboutSettings?.website && (
                    <motion.a
                      href={aboutSettings.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 text-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <Globe className="w-5 h-5" />
                    </motion.a>
                  )}
                  {aboutSettings?.github_url && (
                    <motion.a
                      href={aboutSettings.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-full bg-gradient-to-r from-gray-500/20 to-slate-500/20 backdrop-blur-sm border border-white/20 text-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                  )}
                  {aboutSettings?.linkedin_url && (
                    <motion.a
                      href={aboutSettings.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/20 text-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25"
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                  )}
                </motion.div>

                {/* Enhanced Action Buttons */}
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1.3 }}
                >
                  {aboutSettings?.resume_url && (
                    <motion.a
                      href={aboutSettings.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                        <Download className="w-4 h-4" />
                        Download CV
                      </Button>
                    </motion.a>
                  )}
                  <Link href="/contact">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="gap-2 border-2 hover:bg-primary/10"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Me
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Experience Section */}
        {experiences.length > 0 && (
          <motion.section
            className="py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  Professional Experience
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </motion.div>

              {/* Timeline Layout */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-blue-500 hidden lg:block"></div>

                <div className="space-y-12">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`relative lg:w-1/2 ${
                        index % 2 === 0 ? "lg:pr-12" : "lg:pl-12 lg:ml-auto"
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg hidden lg:block"></div>

                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-card/60 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {exp.company_logo_url && (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0"
                            >
                              <Image
                                src={exp.company_logo_url}
                                alt={`${exp.company} logo`}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </motion.div>
                          )}

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold mb-1">
                                  {exp.position}
                                </h3>
                                <div className="flex items-center gap-2 text-primary mb-2">
                                  {exp.company_url ? (
                                    <a
                                      href={exp.company_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline font-semibold"
                                    >
                                      {exp.company}
                                    </a>
                                  ) : (
                                    <span className="font-semibold">
                                      {exp.company}
                                    </span>
                                  )}
                                  <ExternalLink className="w-4 h-4" />
                                </div>
                                {exp.location && (
                                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <MapPin className="w-3 h-3" />
                                    {exp.location}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                  {getEmploymentIcon(exp.employment_type)}
                                  <span className="capitalize bg-primary/10 px-2 py-1 rounded-full">
                                    {exp.employment_type?.replace("-", " ")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(exp.start_date)} -{" "}
                                  {exp.is_current
                                    ? "Present"
                                    : formatDate(exp.end_date)}
                                </div>
                              </div>
                            </div>

                            {exp.description && (
                              <p className="text-muted-foreground mb-4">
                                {exp.description}
                              </p>
                            )}

                            {exp.technologies &&
                              exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {exp.technologies.map((tech, techIndex) => (
                                    <motion.span
                                      key={techIndex}
                                      whileHover={{ scale: 1.05 }}
                                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                                    >
                                      {tech}
                                    </motion.span>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <motion.section
            className="py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                  </div>
                  Education
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                  >
                    <div className="flex items-start gap-4">
                      {edu.institution_logo_url ? (
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0"
                        >
                          <Image
                            src={edu.institution_logo_url}
                            alt={`${edu.institution} logo`}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getDegreeIcon(edu.degree_type)}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{edu.degree}</h3>
                        {edu.field_of_study && (
                          <p className="text-emerald-600 text-sm font-medium">
                            {edu.field_of_study}
                          </p>
                        )}
                        <div className="text-muted-foreground">
                          {edu.institution_url ? (
                            <a
                              href={edu.institution_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-emerald-600 transition-colors"
                            >
                              {edu.institution}
                            </a>
                          ) : (
                            edu.institution
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(edu.start_date)} -{" "}
                          {edu.is_current
                            ? "Present"
                            : formatDate(edu.end_date)}
                        </div>
                        {edu.grade_gpa && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Grade: {edu.grade_gpa}
                          </div>
                        )}
                        {edu.description && (
                          <p className="text-muted-foreground text-sm mt-3">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Enhanced Call to Action */}
        <motion.section
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="relative bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10 overflow-hidden">
                {/* Background animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-2xl"
                />

                <h2 className="text-3xl font-bold mb-4">
                  Let&apos;s Work Together
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Ready to bring your ideas to life? I&apos;m always excited to
                  work on new projects and collaborate with amazing people.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/contact">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Mail className="w-5 h-5" />
                        Get In Touch
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/projects">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 border-2"
                      >
                        <Briefcase className="w-5 h-5" />
                        View My Work
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
