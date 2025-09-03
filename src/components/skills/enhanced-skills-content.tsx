"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Award,
  Brain,
  Code,
  Database,
  Palette,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { getSkillIcon } from "@/lib/skill-icons";

interface Skill {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  show_percentage?: boolean;
  created_at: string;
}

interface SkillsContentProps {
  skills: Skill[];
}

// Animation variants
const ANIMATIONS = {
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  },
};

// Spacing utilities
const SPACING = {
  section: "py-20",
  container: "max-w-6xl mx-auto px-4",
  grid: {
    skills: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  },
};

export default function EnhancedSkillsContent({ skills }: SkillsContentProps) {
  // Early return if skills is undefined or empty
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No skills to display</h2>
        <p className="text-muted-foreground">Skills will appear here once they're added.</p>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categories = Object.keys(skillsByCategory).sort();
  const totalSkills = skills.length;
  const averageProficiency = Math.round(
    skills.reduce((sum, skill) => sum + (skill.proficiency || 0), 0) / totalSkills
  );

  // Helper functions
  const getCategoryIcon = (category: string) => {
    const icons = {
      Frontend: <Code className="w-6 h-6" />,
      Backend: <Database className="w-6 h-6" />,
      Database: <Database className="w-6 h-6" />,
      DevOps: <Zap className="w-6 h-6" />,
      Design: <Palette className="w-6 h-6" />,
      Tools: <Zap className="w-6 h-6" />,
      Other: <Star className="w-6 h-6" />,
    };
    return icons[category as keyof typeof icons] || icons.Other;
  };

  const getCategoryGradient = (category: string) => {
    const gradients = {
      Frontend: "from-blue-500/20 to-cyan-500/20",
      Backend: "from-green-500/20 to-emerald-500/20",
      Database: "from-purple-500/20 to-violet-500/20",
      DevOps: "from-orange-500/20 to-red-500/20",
      Design: "from-pink-500/20 to-rose-500/20",
      Tools: "from-yellow-500/20 to-amber-500/20",
      Other: "from-gray-500/20 to-slate-500/20",
    };
    return gradients[category as keyof typeof gradients] || gradients.Other;
  };

  const getProficiencyConfig = (proficiency?: number) => {
    if (!proficiency) return { level: "Beginner", color: "from-gray-400 to-gray-500", textColor: "text-gray-600", icon: <Star className="w-3 h-3" /> };
    
    if (proficiency >= 90) return { level: "Master", color: "from-purple-500 to-purple-600", textColor: "text-purple-600", icon: <Award className="w-3 h-3" /> };
    if (proficiency >= 75) return { level: "Expert", color: "from-blue-500 to-blue-600", textColor: "text-blue-600", icon: <Target className="w-3 h-3" /> };
    if (proficiency >= 60) return { level: "Advanced", color: "from-green-500 to-green-600", textColor: "text-green-600", icon: <Brain className="w-3 h-3" /> };
    if (proficiency >= 40) return { level: "Intermediate", color: "from-yellow-500 to-yellow-600", textColor: "text-yellow-600", icon: <Zap className="w-3 h-3" /> };
    return { level: "Beginner", color: "from-gray-400 to-gray-500", textColor: "text-gray-600", icon: <Star className="w-3 h-3" /> };
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No skills to display</h2>
        <p className="text-muted-foreground">Skills will appear here once they're added.</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", SPACING.section)}>
      <div className={SPACING.container}>
        {/* Hero Section */}
        <motion.section
          variants={ANIMATIONS.fadeIn}
          initial="initial"
          animate="animate"
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Technical Skills & Expertise
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive overview of my technical capabilities, tools, and technologies
            that I use to bring ideas to life and solve complex problems.
          </p>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={ANIMATIONS.slideUp}
          initial="initial"
          animate="animate"
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {totalSkills}
              </div>
              <div className="text-muted-foreground">Technical Skills</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.length}
              </div>
              <div className="text-muted-foreground">Categories</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {averageProficiency}%
              </div>
              <div className="text-muted-foreground">Avg. Proficiency</div>
            </motion.div>
          </div>
        </motion.section>

        {/* Skills by Category */}
        <motion.div
          variants={ANIMATIONS.staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-20"
        >
          {categories.map((category) => (
            <motion.section
              key={category}
              variants={ANIMATIONS.staggerItem}
              className="relative"
            >
              {/* Category Header */}
              <div className="text-center mb-12">
                <div
                  className={`inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r ${getCategoryGradient(
                    category
                  )} border border-white/20 backdrop-blur-sm`}
                >
                  <div className="text-primary">
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {category}
                  </h2>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              {/* Skills Grid */}
              <div className={SPACING.grid.skills}>
                {skillsByCategory[category].map((skill, index) => {
                  const proficiencyConfig = getProficiencyConfig(skill.proficiency);

                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 },
                      }}
                      className="group"
                    >
                      <Card
                        className={`h-full bg-gradient-to-br ${getCategoryGradient(
                          category
                        )} border-2 border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 relative overflow-hidden`}
                      >
                        <CardContent className="p-6">
                          {/* Skill Icon */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                              <div className="text-primary group-hover:text-purple-600 transition-colors duration-300 text-2xl">
                                {getSkillIcon(skill.name, skill.icon, skill.category)}
                              </div>
                            </div>

                            {/* Proficiency Badge - Only show if percentage is enabled */}
                            {skill.show_percentage !== false && (
                              <Badge
                                variant="secondary"
                                className={`${proficiencyConfig.textColor} bg-white/20 backdrop-blur-sm border border-white/30 font-semibold`}
                              >
                                <div className="flex items-center gap-1">
                                  {proficiencyConfig.icon}
                                  {proficiencyConfig.level}
                                </div>
                              </Badge>
                            )}
                          </div>

                          {/* Skill Name */}
                          <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                            {skill.name}
                          </h3>

                          {/* Skill Display Logic */}
                          {skill.proficiency !== null && skill.proficiency !== undefined && (
                            <div className="space-y-4">
                              {skill.show_percentage === true ? (
                                /* Percentage View */
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Expertise Level
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                        {skill.proficiency}%
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={`${proficiencyConfig.textColor} border-current/30 text-xs px-3 py-1`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {proficiencyConfig.icon}
                                          {proficiencyConfig.level}
                                        </div>
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="relative">
                                    <div className="w-full h-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${skill.proficiency}%` }}
                                        viewport={{ once: true }}
                                        transition={{
                                          duration: 2,
                                          delay: index * 0.15,
                                          ease: "easeOut",
                                        }}
                                        className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden shadow-lg`}
                                      >
                                        <motion.div
                                          animate={{ x: ["-100%", "200%"] }}
                                          transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatDelay: 5,
                                            ease: "easeInOut",
                                          }}
                                          className="absolute top-0 left-0 h-full w-1/3 bg-white/60 transform skew-x-12 blur-sm"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/30 rounded-full"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"></div>
                                      </motion.div>
                                    </div>
                                    
                                    {/* Progress indicators */}
                                    <div className="flex justify-between items-center mt-2 px-1">
                                      {[0, 25, 50, 75, 100].map((mark) => (
                                        <div key={mark} className="flex flex-col items-center">
                                          <div className={`w-0.5 h-2 rounded-full transition-colors duration-500 ${
                                            (skill.proficiency || 0) >= mark 
                                              ? `${proficiencyConfig.color.includes('purple') ? 'bg-purple-400' : proficiencyConfig.color.includes('blue') ? 'bg-blue-400' : proficiencyConfig.color.includes('green') ? 'bg-green-400' : 'bg-orange-400'}` 
                                              : 'bg-muted-foreground/20'
                                          }`}></div>
                                          <span className={`text-xs mt-1 transition-colors duration-500 ${
                                            (skill.proficiency || 0) >= mark ? 'text-foreground/70 font-medium' : 'text-muted-foreground/40'
                                          }`}>
                                            {mark}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : skill.show_percentage === false ? (
                                /* Hidden Mode - Clean professional display */
                                <div className="flex justify-center items-center py-8">
                                  <div className="text-center space-y-4">
                                    <div className="relative">
                                      <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-slate-200 dark:border-slate-600">
                                        <div className="text-3xl opacity-60">
                                          {getSkillIcon(skill.name, skill.icon, skill.category)}
                                        </div>
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary/80 to-purple-600/80 rounded-full flex items-center justify-center shadow-lg">
                                        <div className="text-xs text-white font-bold">✓</div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-foreground">
                                        Professional Experience
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Proven expertise in production environments
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Professional Level View with Stars */
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      Mastery Level
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`${proficiencyConfig.textColor} bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm border border-white/40 font-semibold text-sm px-4 py-2 shadow-xl`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${proficiencyConfig.color.includes('purple') ? 'bg-purple-400' : proficiencyConfig.color.includes('blue') ? 'bg-blue-400' : proficiencyConfig.color.includes('green') ? 'bg-green-400' : 'bg-orange-400'} animate-pulse`}></div>
                                        {proficiencyConfig.icon}
                                        {proficiencyConfig.level}
                                      </div>
                                    </Badge>
                                  </div>
                                  
                                  <div className="relative">
                                    <div className="w-full h-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${skill.proficiency}%` }}
                                        viewport={{ once: true }}
                                        transition={{
                                          duration: 2,
                                          delay: index * 0.15,
                                          ease: "easeOut",
                                        }}
                                        className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden shadow-lg`}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/25 rounded-full"></div>
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_60%)] rounded-full"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full"></div>
                                      </motion.div>
                                    </div>
                                    
                                    {/* Skill level indicators with fixed stars */}
                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                      {[
                                        { level: 'Novice', min: 0, stars: 1 },
                                        { level: 'Intermediate', min: 25, stars: 2 },
                                        { level: 'Advanced', min: 50, stars: 3 },
                                        { level: 'Expert', min: 75, stars: 4 },
                                        { level: 'Master', min: 90, stars: 5 }
                                      ].map((item, i) => {
                                        const isActive = (skill.proficiency || 0) >= item.min;
                                        const isCurrent = (skill.proficiency || 0) >= item.min && (i === 4 || (skill.proficiency || 0) < [25, 50, 75, 90, 100][i]);
                                        return (
                                          <div key={item.level} className={`flex flex-col items-center p-2 rounded-lg transition-all duration-500 ${
                                            isCurrent 
                                              ? 'bg-primary/10 border border-primary/30 scale-105 shadow-lg' 
                                              : isActive 
                                              ? 'bg-muted/20 border border-muted/30' 
                                              : 'bg-muted/5 border border-muted/10'
                                          }`}>
                                            <div className={`flex justify-center mb-1 transition-all duration-500 ${
                                              isCurrent ? 'scale-110' : ''
                                            }`}>
                                              <div className="flex">
                                                {[...Array(5)].map((_, starIndex) => (
                                                  <span key={starIndex} className={`text-xs ${
                                                    starIndex < item.stars 
                                                      ? (isCurrent ? 'text-primary' : isActive ? 'text-yellow-500' : 'text-muted-foreground/40')
                                                      : 'text-muted-foreground/20'
                                                  }`}>
                                                    ⭐
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                            <span className={`text-xs font-medium transition-colors duration-500 text-center leading-tight ${
                                              isCurrent 
                                                ? 'text-primary' 
                                                : isActive 
                                                ? 'text-foreground/80' 
                                                : 'text-muted-foreground/40'
                                            }`}>
                                              {item.level}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </div>
    </div>
  );
}