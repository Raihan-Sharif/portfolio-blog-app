"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ANIMATIONS, GRADIENTS, SPACING } from "@/lib/design-constants";
import { getProficiencyConfig } from "@/lib/skill-utils";
import { SkillCardIcon } from "@/lib/enhanced-skill-icons";
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
  Target,
  Layers,
  Globe,
  Cpu,
  Rocket,
} from "lucide-react";
import Link from "next/link";

interface Skill {
  id: number;
  name: string;
  category?: string;
  proficiency?: number;
  icon?: string;
  brand_logo?: string;
  show_percentage?: boolean;
  created_at: string;
}

interface SkillsProps {
  skills: Skill[];
}

const getCategoryIcon = (category: string) => {
  const icons = {
    Frontend: <Code className="w-6 h-6" />,
    Backend: <Database className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    DevOps: <Cloud className="w-6 h-6" />,
    Infrastructure: <Cpu className="w-6 h-6" />,
    Mobile: <Globe className="w-6 h-6" />,
    Tools: <Zap className="w-6 h-6" />,
    Design: <Palette className="w-6 h-6" />,
    Other: <Star className="w-6 h-6" />,
  };
  return icons[category as keyof typeof icons] || icons.Other;
};

const getCategoryGradient = (category: string) => {
  const gradients = {
    Frontend: "from-blue-500/30 to-cyan-500/30",
    Backend: "from-green-500/30 to-emerald-500/30", 
    Database: "from-purple-500/30 to-violet-500/30",
    DevOps: "from-orange-500/30 to-red-500/30",
    Infrastructure: "from-slate-500/30 to-gray-600/30",
    Mobile: "from-indigo-500/30 to-purple-500/30",
    Tools: "from-yellow-500/30 to-amber-500/30",
    Design: "from-pink-500/30 to-rose-500/30",
    Other: "from-teal-500/30 to-cyan-500/30",
  };
  return gradients[category as keyof typeof gradients] || gradients.Other;
};

const getCategoryBorderGradient = (category: string) => {
  const gradients = {
    Frontend: "from-blue-400 via-cyan-400 to-blue-400",
    Backend: "from-green-400 via-emerald-400 to-green-400",
    Database: "from-purple-400 via-violet-400 to-purple-400", 
    DevOps: "from-orange-400 via-red-400 to-orange-400",
    Infrastructure: "from-slate-400 via-gray-500 to-slate-400",
    Mobile: "from-indigo-400 via-purple-400 to-indigo-400",
    Tools: "from-yellow-400 via-amber-400 to-yellow-400",
    Design: "from-pink-400 via-rose-400 to-pink-400",
    Other: "from-teal-400 via-cyan-400 to-teal-400",
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
    <section className={`${SPACING.section} relative overflow-hidden bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-950/50 dark:via-slate-900 dark:to-slate-800/30`}>
      {/* Revolutionary Background Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/25 via-pink-500/20 to-indigo-500/25 rounded-full blur-3xl"
          animate={{
            scale: [1, 0.7, 1],
            opacity: [0.4, 0.9, 0.4],
            x: [0, -60, 0],
            y: [0, 40, 0],
            rotate: [0, -180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-green-500/20 via-teal-500/15 to-emerald-500/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 270, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Floating tech particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full shadow-lg"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className={`${SPACING.container} relative z-10`}>
        {/* Hero Header with Premium Design */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 border border-primary/30 rounded-full backdrop-blur-sm mb-6">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Premium Tech Stack</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
              Skills & Expertise
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Crafting next-generation digital experiences with cutting-edge technologies
              <span className="block mt-3 font-semibold text-primary">
                🚀 {totalSkills} Elite Skills • 🎯 {sortedCategories.length} Categories • ⚡ {averageProficiency}% Mastery
              </span>
            </p>
          </motion.div>
        </motion.div>

        {/* Premium Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto"
        >
          {[
            { 
              icon: <Layers className="w-10 h-10" />, 
              value: totalSkills, 
              label: "Technical Skills", 
              gradient: "from-blue-500 to-cyan-500",
              bg: "from-blue-500/20 to-cyan-500/20"
            },
            { 
              icon: <Target className="w-10 h-10" />, 
              value: expertSkills, 
              label: "Expert Level", 
              gradient: "from-green-500 to-emerald-500",
              bg: "from-green-500/20 to-emerald-500/20"
            },
            { 
              icon: <Award className="w-10 h-10" />, 
              value: `${averageProficiency}%`, 
              label: "Mastery Level", 
              gradient: "from-purple-500 to-pink-500",
              bg: "from-purple-500/20 to-pink-500/20"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${stat.bg} border-2 border-white/20 dark:border-slate-700/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden`}>
                {/* Animated border gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`} />
                
                <div className="relative z-10 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                    className={`text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </motion.div>
                  
                  <div className="text-slate-600 dark:text-slate-300 font-semibold">
                    {stat.label}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-5 rounded-3xl`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Skills Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-primary dark:from-white dark:to-primary bg-clip-text text-transparent">
              Featured Technologies
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full mb-8"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {topSkills.map((skill, index) => {
              const proficiencyConfig = getProficiencyConfig(skill.proficiency);
              const categoryGradient = getCategoryGradient(skill.category || "Other");
              const borderGradient = getCategoryBorderGradient(skill.category || "Other");

              return (
                <motion.div
                  key={skill.id}
                  initial={{ 
                    opacity: 0, 
                    scale: 0.6,
                    y: 60
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -15,
                    transition: { 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200
                    },
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/95 via-white/90 to-white/85 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/85 border-2 border-transparent bg-clip-padding backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden group-hover:border-primary/50">
                    
                    {/* Dynamic border gradient */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${borderGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} style={{
                      padding: '2px',
                      background: `linear-gradient(135deg, transparent, rgba(59,130,246,0.3), transparent)`,
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor'
                    }} />
                    
                    {/* Background pattern */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                      {/* Enhanced Icon */}
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <SkillCardIcon
                          skillName={skill.name}
                          iconImage={skill.brand_logo}
                          category={skill.category}
                          showPercentage={skill.show_percentage}
                          size="lg"
                          className="relative shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Skill Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                          {skill.name}
                        </h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {skill.category}
                        </div>
                      </div>

                      {/* Enhanced Progress */}
                      {skill.proficiency !== null && skill.proficiency !== undefined && (
                        <div className="w-full space-y-3">
                          {skill.show_percentage ? (
                            <>
                              <Badge
                                variant="secondary"
                                className={`${proficiencyConfig.textColor} bg-gradient-to-r ${proficiencyConfig.color} text-white font-bold text-sm px-4 py-2 shadow-lg`}
                              >
                                {skill.proficiency}%
                              </Badge>
                              
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${skill.proficiency}%` }}
                                  viewport={{ once: true }}
                                  transition={{
                                    duration: 2,
                                    delay: index * 0.1,
                                    ease: "easeOut",
                                  }}
                                  className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden shadow-lg`}
                                >
                                  <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      repeatDelay: 3,
                                      ease: "easeInOut",
                                    }}
                                    className="absolute top-0 left-0 h-full w-1/3 bg-white/60 blur-sm skew-x-12"
                                  />
                                </motion.div>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-center space-x-2">
                              {[1, 2, 3, 4, 5].map((dot) => {
                                const isActive = dot <= Math.ceil((skill.proficiency || 0) / 20);
                                return (
                                  <motion.div
                                    key={dot}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 + dot * 0.1 }}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                                      isActive
                                        ? `bg-gradient-to-r ${proficiencyConfig.color} shadow-lg shadow-primary/50`
                                        : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Premium shine effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none opacity-0 group-hover:opacity-100" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Premium Category Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-primary dark:from-white dark:to-primary bg-clip-text text-transparent">
              Technology Categories
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized expertise across diverse technology domains
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedCategories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.08, y: -8 }}
                className="group cursor-pointer"
              >
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${getCategoryGradient(category)} border-2 border-white/30 dark:border-slate-600/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 overflow-hidden`}>
                  
                  {/* Dynamic background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(category)} opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-3xl`} />
                  
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-700/90 dark:to-slate-600/70 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-2xl group-hover:shadow-primary/50">
                      <div className="text-primary group-hover:text-white transition-colors duration-300">
                        {getCategoryIcon(category)}
                      </div>
                    </div>
                    
                    <h4 className="font-bold mb-3 text-slate-900 dark:text-white group-hover:text-white transition-colors duration-300">
                      {category}
                    </h4>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white font-medium transition-colors duration-300">
                        {categoryMap[category].length} skill{categoryMap[category].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Premium hover effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryBorderGradient(category)} opacity-20 rounded-3xl`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="relative inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 border-2 border-primary/30 rounded-full backdrop-blur-sm mb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full"></div>
            <Sparkles className="relative text-primary w-6 h-6 animate-pulse" />
            <span className="relative font-semibold text-primary">
              Continuously evolving • Always innovating
            </span>
            <div className="relative w-2 h-2 bg-primary rounded-full animate-ping"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="gap-3 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-primary text-white border-0 shadow-2xl hover:shadow-primary/50 transition-all duration-500 font-bold px-10 py-4 rounded-2xl text-lg group relative overflow-hidden"
            >
              <Link href="/skills">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Rocket className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">Explore All Skills</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-3 border-3 border-primary/40 hover:bg-primary/10 hover:border-primary/60 text-primary hover:text-primary shadow-2xl hover:shadow-primary/30 transition-all duration-500 font-bold px-10 py-4 rounded-2xl text-lg bg-white/10 backdrop-blur-sm group relative overflow-hidden"
            >
              <Link href="/projects">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <Code className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">See Skills in Action</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
