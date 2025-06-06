// src/app/about/about-content.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-16"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Profile Image */}
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative">
                  {/* Animated rings */}
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 animate-spin"
                    style={{ animationDuration: "8s" }}
                  ></div>
                  <div
                    className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500/20 via-primary/20 to-purple-500/20 animate-spin"
                    style={{
                      animationDuration: "6s",
                      animationDirection: "reverse",
                    }}
                  ></div>

                  <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm shadow-2xl">
                    {aboutSettings?.profile_image_url ? (
                      <Image
                        src={aboutSettings.profile_image_url}
                        alt={aboutSettings.title || "Profile"}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
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
                          <p className="text-muted-foreground text-sm">
                            Profile Image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About Info */}
              <div className="space-y-6">
                <div>
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
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {aboutSettings?.years_experience && (
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-2xl font-bold text-primary">
                        {aboutSettings.years_experience}+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Years Experience
                      </div>
                    </div>
                  )}
                  {experiences.length > 0 && (
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="text-2xl font-bold text-primary">
                        {experiences.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Companies
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4">
                  {aboutSettings?.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{aboutSettings.location}</span>
                    </div>
                  )}
                  {aboutSettings?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${aboutSettings.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {aboutSettings.email}
                      </a>
                    </div>
                  )}
                  {aboutSettings?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
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
                <div className="flex gap-4">
                  {aboutSettings?.website && (
                    <a
                      href={aboutSettings.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {aboutSettings?.github_url && (
                    <a
                      href={aboutSettings.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {aboutSettings?.linkedin_url && (
                    <a
                      href={aboutSettings.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {aboutSettings?.resume_url && (
                    <a
                      href={aboutSettings.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        <Download className="w-4 h-4" />
                        Download CV
                      </Button>
                    </a>
                  )}
                  <Link href="/contact">
                    <Button variant="outline" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Me
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Experience Section */}
          {experiences.length > 0 && (
            <motion.section variants={itemVariants} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Briefcase className="w-8 h-8 text-primary" />
                  Professional Experience
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                      <div className="flex flex-col md:flex-row gap-6">
                        {exp.company_logo_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <Image
                              src={exp.company_logo_url}
                              alt={`${exp.company} logo`}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold">
                                {exp.position}
                              </h3>
                              <div className="flex items-center gap-2 text-primary">
                                {exp.company_url ? (
                                  <a
                                    href={exp.company_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {exp.company}
                                  </a>
                                ) : (
                                  exp.company
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
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                {getEmploymentIcon(exp.employment_type)}
                                <span className="capitalize">
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

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {exp.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <motion.section variants={itemVariants} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  Education
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {edu.institution_logo_url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                          <Image
                            src={edu.institution_logo_url}
                            alt={`${edu.institution} logo`}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getDegreeIcon(edu.degree_type)}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{edu.degree}</h3>
                        {edu.field_of_study && (
                          <p className="text-primary text-sm">
                            {edu.field_of_study}
                          </p>
                        )}
                        <div className="text-muted-foreground">
                          {edu.institution_url ? (
                            <a
                              href={edu.institution_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
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
            </motion.section>
          )}

          {/* Courses Section */}
          {courses.length > 0 && (
            <motion.section variants={itemVariants} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Professional Courses
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                      <p className="text-primary">{course.provider}</p>
                      {course.platform && (
                        <p className="text-muted-foreground text-sm">
                          {course.platform}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {course.completion_date && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-3 h-3" />
                          Completed: {formatDate(course.completion_date)}
                        </div>
                      )}

                      {course.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-3 h-3" />
                          Duration: {course.duration}
                        </div>
                      )}

                      {course.instructor && (
                        <div className="text-muted-foreground text-sm">
                          Instructor: {course.instructor}
                        </div>
                      )}

                      {course.rating && (
                        <div className="flex items-center gap-2">
                          {renderStars(course.rating)}
                          <span className="text-sm text-muted-foreground">
                            ({course.rating}/5)
                          </span>
                        </div>
                      )}

                      {course.description && (
                        <p className="text-muted-foreground text-sm">
                          {course.description}
                        </p>
                      )}

                      {course.skills_learned &&
                        course.skills_learned.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.skills_learned.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex gap-2 pt-2">
                        {course.certificate_url && (
                          <a
                            href={course.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              Certificate
                            </Button>
                          </a>
                        )}
                        {course.course_url && (
                          <a
                            href={course.course_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Course
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Workshops Section */}
          {workshops.length > 0 && (
            <motion.section variants={itemVariants} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  Workshops & Events
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshops.map((workshop, index) => (
                  <motion.div
                    key={workshop.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-2">
                        {workshop.title}
                      </h3>
                      <p className="text-primary">{workshop.organizer}</p>
                      {workshop.event_type && (
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-md text-xs mt-2 capitalize">
                          {workshop.event_type}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {workshop.event_date && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(workshop.event_date)}
                        </div>
                      )}

                      {workshop.location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="w-3 h-3" />
                          {workshop.location}
                        </div>
                      )}

                      {workshop.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-3 h-3" />
                          {workshop.duration}
                        </div>
                      )}

                      {workshop.attendees_count && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Users className="w-3 h-3" />
                          {workshop.attendees_count} attendees
                        </div>
                      )}

                      {workshop.description && (
                        <p className="text-muted-foreground text-sm">
                          {workshop.description}
                        </p>
                      )}

                      {workshop.skills_gained &&
                        workshop.skills_gained.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {workshop.skills_gained.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex gap-2 pt-2">
                        {workshop.certificate_url && (
                          <a
                            href={workshop.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              Certificate
                            </Button>
                          </a>
                        )}
                        {workshop.event_url && (
                          <a
                            href={workshop.event_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Event
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Achievements Section */}
          {achievements.length > 0 && (
            <motion.section variants={itemVariants} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  Achievements & Awards
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {achievement.title}
                      </h3>
                      {achievement.organization && (
                        <p className="text-primary">
                          {achievement.organization}
                        </p>
                      )}
                      {achievement.achievement_type && (
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs mt-2 capitalize">
                          {achievement.achievement_type}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {achievement.achievement_date && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(achievement.achievement_date)}
                        </div>
                      )}

                      {achievement.description && (
                        <p className="text-muted-foreground text-sm text-center">
                          {achievement.description}
                        </p>
                      )}

                      <div className="flex justify-center gap-2 pt-2">
                        {achievement.certificate_url && (
                          <a
                            href={achievement.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              Certificate
                            </Button>
                          </a>
                        )}
                        {achievement.achievement_url && (
                          <a
                            href={achievement.achievement_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Call to Action */}
          <motion.section variants={itemVariants} className="text-center">
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
              <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Ready to bring your ideas to life? I'm always excited to work on
                new projects and collaborate with amazing people.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    <Mail className="w-5 h-5" />
                    Get In Touch
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Briefcase className="w-5 h-5" />
                    View My Work
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
