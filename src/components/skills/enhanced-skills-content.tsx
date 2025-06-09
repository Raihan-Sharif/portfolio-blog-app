"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ANIMATIONS, GRADIENTS, SPACING } from "@/lib/design-constants";
import { getProficiencyConfig, getSkillIcon } from "@/lib/skill-utils";
import { motion } from "framer-motion";
import { Cloud, Code, Database, Palette, Star, Zap } from "lucide-react";

interface Skill {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  created_at: string;
}

interface EnhancedSkillsContentProps {
  skillsByCategory: Record<string, Skill[]>;
}

const getCategoryIcon = (category: string) => {
  const icons = {
    Frontend: <Code className="w-6 h-6" />,
    Backend: <Database className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    DevOps: <Cloud className="w-6 h-6" />,
    Infrastructure: <Cloud className="w-6 h-6" />,
    Mobile: <Code className="w-6 h-6" />,
    Tools: <Zap className="w-6 h-6" />,
    Design: <Palette className="w-6 h-6" />,
    Other: <Star className="w-6 h-6" />,
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

export default function EnhancedSkillsContent({
  skillsByCategory,
}: EnhancedSkillsContentProps) {
  const categories = Object.keys(skillsByCategory).sort();
  const totalSkills = Object.values(skillsByCategory).flat().length;
  const averageProficiency = Math.round(
    Object.values(skillsByCategory)
      .flat()
      .reduce((sum, skill) => sum + (skill.proficiency || 0), 0) / totalSkills
  );

  return (
    <div
      className={`min-h-screen ${GRADIENTS.background} relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <motion.div
          {...ANIMATIONS.staggerContainer}
          className={SPACING.container}
        >
          {/* Hero Section */}
          <motion.section
            {...ANIMATIONS.fadeIn}
            className="text-center mb-20 pt-16"
          >
            <h1
              className={`text-4xl md:text-6xl font-bold mb-6 ${GRADIENTS.primaryText}`}
            >
              Skills & Expertise
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
              A comprehensive overview of my technical skills and expertise
              developed over{" "}
              <span className="text-primary font-semibold">6+ years</span> in
              software development. Each skill represents countless hours of
              learning, building, and mastering.
            </p>

            {/* Stats Cards */}
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
                    const proficiencyConfig = getProficiencyConfig(
                      skill.proficiency
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
                                  {getSkillIcon(skill.name, skill.icon)}
                                </div>
                              </div>

                              {/* Proficiency Badge */}
                              <Badge
                                variant="secondary"
                                className={`${proficiencyConfig.textColor} bg-white/20 backdrop-blur-sm border border-white/30 font-semibold`}
                              >
                                <div className="flex items-center gap-1">
                                  {proficiencyConfig.icon}
                                  {proficiencyConfig.level}
                                </div>
                              </Badge>
                            </div>

                            {/* Skill Name */}
                            <h3 className="text-lg font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                              {skill.name}
                            </h3>

                            {/* Proficiency Bar */}
                            {skill.proficiency !== null &&
                              skill.proficiency !== undefined && (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">
                                      Proficiency
                                    </span>
                                    <span className="font-bold text-foreground">
                                      {skill.proficiency}%
                                    </span>
                                  </div>

                                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{
                                        width: `${skill.proficiency}%`,
                                      }}
                                      viewport={{ once: true }}
                                      transition={{
                                        duration: 1.5,
                                        delay: index * 0.1,
                                        ease: "easeOut",
                                      }}
                                      className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden`}
                                    >
                                      {/* Animated shine effect */}
                                      <motion.div
                                        animate={{
                                          x: ["-100%", "200%"],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          repeatDelay: 3,
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
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.section {...ANIMATIONS.fadeIn} className="text-center mt-20">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-full backdrop-blur-sm">
              <Zap className="text-primary w-6 h-6" />
              <span className="font-medium text-lg">
                Always learning and expanding my skillset
              </span>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
