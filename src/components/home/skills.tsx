"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ANIMATIONS, GRADIENTS, SPACING } from "@/lib/design-constants";
import { getProficiencyConfig } from "@/lib/skill-utils";
import { getSkillIcon } from "@/lib/skill-icons";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  ChevronRight,
  Cloud,
  Code,
  Database,
  Palette,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Skill {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  show_percentage?: boolean;
  created_at: string;
}

interface SkillsProps {
  skills: Skill[];
}

const getCategoryIcon = (category: string) => {
  const icons = {
    Frontend: <Code className="w-5 h-5" />,
    Backend: <Database className="w-5 h-5" />,
    Database: <Database className="w-5 h-5" />,
    DevOps: <Cloud className="w-5 h-5" />,
    Infrastructure: <Cloud className="w-5 h-5" />,
    Mobile: <Code className="w-5 h-5" />,
    Tools: <Zap className="w-5 h-5" />,
    Design: <Palette className="w-5 h-5" />,
    Other: <Star className="w-5 h-5" />,
  };
  return icons[category as keyof typeof icons] || icons.Other;
};

const getCategoryGradient = (category: string) => {
  const gradients = {
    Frontend: "from-blue-500/20 to-cyan-500/20",
    Backend: "from-green-500/20 to-emerald-500/20",
    Database: "from-purple-500/20 to-pink-500/20",
    DevOps: "from-orange-500/20 to-red-500/20",
    Infrastructure: "from-orange-500/20 to-red-500/20",
    Mobile: "from-indigo-500/20 to-purple-500/20",
    Tools: "from-gray-500/20 to-slate-500/20",
    Design: "from-pink-500/20 to-rose-500/20",
    Other: "from-teal-500/20 to-cyan-500/20",
  };
  return gradients[category as keyof typeof gradients] || gradients.Other;
};

export default function Skills({ skills }: SkillsProps) {
  // Group skills by category
  const categoryMap: Record<string, Skill[]> = {};
  skills.forEach((skill) => {
    const category = skill.category || "Other";
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    categoryMap[category].push(skill);
  });

  // Sort categories and get top skills for preview
  const sortedCategories = Object.keys(categoryMap).sort();
  const topSkills = skills
    .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
    .slice(0, 8); // Show top 8 skills

  const totalSkills = skills.length;
  const averageProficiency = Math.round(
    skills.reduce((sum, skill) => sum + (skill.proficiency || 0), 0) /
      totalSkills
  );
  const expertSkills = skills.filter(
    (skill) => (skill.proficiency || 0) >= 90
  ).length;

  return (
    <section
      className={`${SPACING.section} ${GRADIENTS.background} relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className={`${SPACING.container} relative z-10`}>
        {/* Section Header */}
        <motion.div {...ANIMATIONS.fadeIn} className="text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 ${GRADIENTS.primaryText}`}
          >
            Skills & Expertise
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mastering cutting-edge technologies to build exceptional digital
            experiences.
            <span className="block mt-2 text-primary font-semibold">
              {totalSkills} skills across {sortedCategories.length} categories
            </span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {totalSkills}
            </div>
            <div className="text-muted-foreground">Total Skills</div>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {expertSkills}
            </div>
            <div className="text-muted-foreground">Expert Level</div>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {averageProficiency}%
            </div>
            <div className="text-muted-foreground">Avg. Proficiency</div>
          </div>
        </motion.div>

        {/* Skills Preview Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSkills.map((skill, index) => {
              const proficiencyConfig = getProficiencyConfig(skill.proficiency);
              const categoryGradient = getCategoryGradient(
                skill.category || "Other"
              );

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
                  className="group cursor-pointer"
                >
                  <div
                    className={`h-full p-6 rounded-2xl border-2 border-white/10 backdrop-blur-sm bg-gradient-to-br ${categoryGradient} hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Skill Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-primary group-hover:text-purple-600 transition-colors duration-300 text-xl">
                          {getSkillIcon(skill.name, skill.icon)}
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`${proficiencyConfig.textColor} bg-white/20 backdrop-blur-sm border border-white/30 font-semibold text-xs`}
                      >
                        <div className="flex items-center gap-1">
                          {proficiencyConfig.icon}
                          {proficiencyConfig.level}
                        </div>
                      </Badge>
                    </div>

                    {/* Skill Name */}
                    <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors duration-300 text-lg">
                      {skill.name}
                    </h3>

                    {/* Professional Skill Display */}
                    {skill.proficiency !== null &&
                      skill.proficiency !== undefined && (
                        <div className="space-y-3">
                          {skill.show_percentage === true ? (
                            /* Percentage View */
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Expertise Level
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    {skill.proficiency}%
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`${proficiencyConfig.textColor} border-current/30 text-xs px-2 py-0.5`}
                                  >
                                    {proficiencyConfig.level}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <div className="w-full h-2.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${skill.proficiency}%` }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 1.5,
                                      delay: index * 0.1,
                                      ease: "easeOut",
                                    }}
                                    className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden shadow-sm`}
                                  >
                                    {/* Enhanced shine effect */}
                                    <motion.div
                                      animate={{
                                        x: ["-100%", "200%"],
                                      }}
                                      transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        repeatDelay: 4,
                                        ease: "easeInOut",
                                      }}
                                      className="absolute top-0 left-0 h-full w-1/3 bg-white/50 transform skew-x-12 blur-sm"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 rounded-full"></div>
                                  </motion.div>
                                </div>
                                
                                {/* Progress indicators */}
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground/60">
                                  <span>•</span>
                                  <span>•</span>
                                  <span>•</span>
                                  <span>•</span>
                                  <span>•</span>
                                </div>
                              </div>
                            </>
                          ) : skill.show_percentage === false ? (
                            /* Hidden Mode - Professional display without labels */
                            <div className="flex justify-center items-center py-6">
                              <div className="relative group">
                                <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-600 group-hover:scale-110 transition-all duration-300">
                                  <div className="text-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                    {getSkillIcon(skill.name, skill.icon, skill.category)}
                                  </div>
                                </div>
                                {/* Subtle verification badge */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                                  <div className="text-xs text-white font-bold">✓</div>
                                </div>
                                {/* Professional glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                            </div>
                          ) : (
                            /* Professional Level View */
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Skill Mastery
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`${proficiencyConfig.textColor} bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30 font-semibold text-xs px-3 py-1 shadow-lg`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${proficiencyConfig.color.includes('emerald') ? 'bg-emerald-400' : proficiencyConfig.color.includes('blue') ? 'bg-blue-400' : proficiencyConfig.color.includes('purple') ? 'bg-purple-400' : 'bg-orange-400'} animate-pulse`}></div>
                                    {proficiencyConfig.icon}
                                    {proficiencyConfig.level}
                                  </div>
                                </Badge>
                              </div>
                              
                              {/* Professional skill visualization */}
                              <div className="relative">
                                <div className="w-full h-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${skill.proficiency}%` }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 1.5,
                                      delay: index * 0.1,
                                      ease: "easeOut",
                                    }}
                                    className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden`}
                                  >
                                    {/* Subtle pattern overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/15 rounded-full"></div>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] rounded-full"></div>
                                  </motion.div>
                                </div>
                                
                                {/* Skill level markers */}
                                <div className="flex justify-between mt-2">
                                  {['Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'].map((level, i) => {
                                    const isActive = (skill.proficiency || 0) > i * 20;
                                    return (
                                      <div key={level} className="flex flex-col items-center">
                                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                                          isActive 
                                            ? `${proficiencyConfig.color.includes('emerald') ? 'bg-emerald-400' : proficiencyConfig.color.includes('blue') ? 'bg-blue-400' : proficiencyConfig.color.includes('purple') ? 'bg-purple-400' : 'bg-orange-400'} shadow-sm` 
                                            : 'bg-muted-foreground/20'
                                        }`}></div>
                                        <span className={`text-xs mt-1 transition-colors duration-500 ${
                                          isActive ? 'text-foreground/80 font-medium' : 'text-muted-foreground/40'
                                        }`}>
                                          {level.slice(0, 3)}
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Categories Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Skill Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedCategories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div
                  className={`p-4 rounded-xl text-center bg-gradient-to-br ${getCategoryGradient(
                    category
                  )} border border-white/10 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-primary">
                      {getCategoryIcon(category)}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{category}</h4>
                  <p className="text-xs text-muted-foreground">
                    {categoryMap[category].length} skills
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-full backdrop-blur-sm mb-8">
            <Sparkles className="text-primary w-5 h-5" />
            <span className="font-medium">
              Always learning and expanding my skillset
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary/90 to-purple-600/90 hover:from-primary hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-3"
            >
              <Link href="/skills">
                <Zap className="w-5 h-5" />
                Explore All Skills
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 text-primary hover:text-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-3 bg-white/5 backdrop-blur-sm"
            >
              <Link href="/projects">
                <Code className="w-5 h-5" />
                See Skills in Action
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
