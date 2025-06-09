"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ANIMATIONS, GRADIENTS, SPACING } from "@/lib/design-constants";
import { getProficiencyConfig, getSkillIcon } from "@/lib/skill-utils";
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

                    {/* Proficiency Bar */}
                    {skill.proficiency !== null &&
                      skill.proficiency !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-medium">
                              Proficiency
                            </span>
                            <span className="font-bold">
                              {skill.proficiency}%
                            </span>
                          </div>

                          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.proficiency}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1.2,
                                delay: index * 0.1,
                                ease: "easeOut",
                              }}
                              className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden`}
                            >
                              {/* Shine effect */}
                              <motion.div
                                animate={{
                                  x: ["-100%", "200%"],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 4,
                                  ease: "easeInOut",
                                }}
                                className="absolute top-0 left-0 h-full w-1/3 bg-white/40 transform skew-x-12"
                              />
                            </motion.div>
                          </div>
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
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
              className="gap-2 border-primary/20 hover:bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-300"
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
