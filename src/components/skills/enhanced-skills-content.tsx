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
  Cloud,
  Globe,
  Cpu,
  Layers,
  Rocket,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SkillCardIcon } from "@/lib/enhanced-skill-icons";

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
    skills: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4",
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
      Frontend: <Code className="w-8 h-8" />,
      Backend: <Database className="w-8 h-8" />,
      Database: <Database className="w-8 h-8" />,
      DevOps: <Cloud className="w-8 h-8" />,
      Infrastructure: <Cpu className="w-8 h-8" />,
      Mobile: <Globe className="w-8 h-8" />,
      Design: <Palette className="w-8 h-8" />,
      Tools: <Zap className="w-8 h-8" />,
      Other: <Star className="w-8 h-8" />,
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
      Design: "from-pink-500/30 to-rose-500/30",
      Tools: "from-yellow-500/30 to-amber-500/30",
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
      Design: "from-pink-400 via-rose-400 to-pink-400",
      Tools: "from-yellow-400 via-amber-400 to-yellow-400",
      Other: "from-teal-400 via-cyan-400 to-teal-400",
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-slate-950/50 dark:via-slate-900 dark:to-slate-800/30">
      {/* Revolutionary Background Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic floating shapes */}
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [0, 80, 0],
            y: [0, -60, 0],
            rotate: [0, 120, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/5 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 0.6, 1],
            opacity: [0.3, 0.8, 0.3],
            x: [0, -100, 0],
            y: [0, 80, 0],
            rotate: [0, -240, 0]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Advanced grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[length:80px_80px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        
        {/* Enhanced floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-primary/25 to-purple-500/25 rounded-full shadow-xl"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.3, 1.5, 0.3],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className={SPACING.container}>
        {/* Premium Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24 pt-16"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-primary/25 via-purple-500/25 to-primary/25 border-2 border-primary/40 rounded-full backdrop-blur-sm mb-8">
              <Rocket className="w-6 h-6 text-primary animate-pulse" />
              <span className="font-bold text-primary text-lg">Complete Technical Arsenal</span>
              <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-blue-600 via-purple-600 to-slate-900 dark:from-white dark:via-blue-400 dark:via-purple-400 dark:to-white bg-clip-text text-transparent leading-tight">
              Technical Skills
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-5xl mx-auto leading-relaxed mb-8">
              A comprehensive showcase of cutting-edge technologies, frameworks, and tools that power modern digital solutions
            </p>

            <div className="flex flex-wrap justify-center gap-4 font-semibold">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-full backdrop-blur-sm">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-400 text-sm">{totalSkills} Technologies</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full backdrop-blur-sm">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400 text-sm">{categories.length} Categories</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 dark:text-purple-400 text-sm">{averageProficiency}% Mastery</span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Ultra-Premium Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-32"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { 
                icon: <Layers className="w-12 h-12" />, 
                value: totalSkills, 
                label: "Technical Skills", 
                subtitle: "Comprehensive toolkit",
                gradient: "from-blue-500 to-cyan-500",
                bg: "from-blue-500/25 to-cyan-500/25"
              },
              { 
                icon: <Award className="w-12 h-12" />, 
                value: skills.filter(s => (s.proficiency || 0) >= 90).length, 
                label: "Expert Level", 
                subtitle: "Advanced mastery",
                gradient: "from-green-500 to-emerald-500",
                bg: "from-green-500/25 to-emerald-500/25"
              },
              { 
                icon: <Target className="w-12 h-12" />, 
                value: `${averageProficiency}%`, 
                label: "Average Proficiency", 
                subtitle: "Overall competency",
                gradient: "from-purple-500 to-pink-500",
                bg: "from-purple-500/25 to-pink-500/25"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.7, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                whileHover={{ scale: 1.05, y: -15 }}
                className="group relative"
              >
                <div className={`relative p-10 rounded-4xl bg-gradient-to-br ${stat.bg} border-3 border-white/30 dark:border-slate-700/30 backdrop-blur-2xl hover:shadow-3xl hover:shadow-primary/25 transition-all duration-700 overflow-hidden`}>
                  {/* Animated border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-30 rounded-4xl transition-opacity duration-700`} />
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-2xl`}>
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.8 + index * 0.3 }}
                      className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </motion.div>
                    
                    <div className="text-slate-800 dark:text-slate-200 font-bold mb-2">
                      {stat.label}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                      {stat.subtitle}
                    </div>
                  </div>

                  {/* Enhanced hover effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-10 rounded-4xl`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Revolutionary Skills by Category */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="space-y-32"
        >
          {categories.map((category) => (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Ultra-Premium Category Header */}
              <div className="text-center mb-20">
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`relative inline-flex items-center gap-6 mb-8 px-12 py-6 rounded-full bg-gradient-to-r ${getCategoryGradient(category)} border-3 border-white/40 dark:border-slate-600/40 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryBorderGradient(category)} opacity-20 rounded-full`} />
                  
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${getCategoryBorderGradient(category).replace('via-', 'to-')} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <div className="text-white">
                      {getCategoryIcon(category)}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {category}
                    </h2>
                    <div className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                      {skillsByCategory[category].length} Technologies
                    </div>
                  </div>
                </motion.div>
                
                <div className="w-40 h-2 bg-gradient-to-r from-primary via-purple-600 to-primary mx-auto rounded-full shadow-lg"></div>
              </div>

              {/* Revolutionary Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {skillsByCategory[category].map((skill, index) => {
                  const proficiencyConfig = getProficiencyConfig(skill.proficiency);
                  const categoryGradient = getCategoryGradient(category);
                  const borderGradient = getCategoryBorderGradient(category);

                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.7, y: 80 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 80,
                        damping: 20
                      }}
                      whileHover={{
                        scale: 1.08,
                        y: -20,
                        transition: { 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 150
                        },
                      }}
                      className="group"
                    >
                      <Card className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-white/98 via-white/95 to-white/92 dark:from-slate-800/98 dark:via-slate-700/95 dark:to-slate-800/92 border-2 border-white/50 dark:border-slate-600/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden group-hover:border-primary/50">
                        
                        {/* Dynamic border animation */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${borderGradient} opacity-0 group-hover:opacity-40 transition-opacity duration-700`} style={{
                          padding: '3px',
                          background: `linear-gradient(135deg, transparent, rgba(59,130,246,0.4), transparent)`,
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor'
                        }} />
                        
                        {/* Enhanced background effects */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-3xl`} />
                        
                        <CardContent className="relative z-10 p-0 h-full flex flex-col items-center text-center space-y-4">
                          {/* Premium Icon Display */}
                          <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <SkillCardIcon
                              skillName={skill.name}
                              iconImage={skill.brand_logo}
                              textIcon={skill.icon}
                              category={skill.category}
                              showPercentage={skill.show_percentage}
                              size="lg"
                              className="relative shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-110"
                            />
                          </div>

                          {/* Enhanced Skill Information */}
                          <div className="flex-grow flex flex-col justify-center space-y-3">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                              {skill.name}
                            </h3>
                            
                            <Badge
                              variant="outline"
                              className="text-xs px-3 py-1 bg-white/70 dark:bg-slate-700/70 border border-white/70 dark:border-slate-500/70 text-slate-700 dark:text-slate-300 font-medium backdrop-blur-sm self-center"
                            >
                              {skill.category || 'Technology'}
                            </Badge>
                          </div>

                          {/* Ultra-Enhanced Progress System */}
                          {skill.proficiency !== null && skill.proficiency !== undefined && (
                            <div className="w-full space-y-3 flex-shrink-0">
                              {skill.show_percentage === true ? (
                                <>
                                  <div className="flex flex-col items-center space-y-2">
                                    <Badge
                                      variant="secondary"
                                      className={`bg-gradient-to-r ${proficiencyConfig.color} text-white font-bold text-sm px-4 py-2 shadow-lg`}
                                    >
                                      {skill.proficiency}%
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`${proficiencyConfig.textColor} bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-white/60 dark:border-slate-500/60 font-medium text-xs px-3 py-1`}
                                    >
                                      <div className="flex items-center gap-1">
                                        {proficiencyConfig.icon}
                                        {proficiencyConfig.level}
                                      </div>
                                    </Badge>
                                  </div>
                                  
                                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${skill.proficiency}%` }}
                                      viewport={{ once: true }}
                                      transition={{
                                        duration: 1.5,
                                        delay: index * 0.1,
                                        ease: "easeOut",
                                      }}
                                      className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full relative overflow-hidden shadow-lg`}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
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
                              ) : skill.show_percentage === false ? (
                                <div className="space-y-3">
                                  <Badge
                                    variant="secondary"
                                    className={`bg-gradient-to-r ${proficiencyConfig.color} text-white font-bold text-sm px-4 py-2 shadow-lg`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {proficiencyConfig.icon}
                                      Professional
                                    </div>
                                  </Badge>
                                  
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
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <Badge
                                    variant="secondary"
                                    className={`bg-gradient-to-r ${proficiencyConfig.color} text-white font-bold text-sm px-4 py-2 shadow-lg`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {proficiencyConfig.icon}
                                      {proficiencyConfig.level}
                                    </div>
                                  </Badge>
                                  
                                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${skill.proficiency}%` }}
                                      viewport={{ once: true }}
                                      transition={{
                                        duration: 1.5,
                                        delay: index * 0.1,
                                        ease: "easeOut",
                                      }}
                                      className={`h-full bg-gradient-to-r ${proficiencyConfig.color} rounded-full shadow-lg`}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>

                        {/* Ultimate shine effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800 pointer-events-none opacity-0 group-hover:opacity-100" />
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Premium Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center mt-32 mb-16"
        >
          <div className="relative inline-flex items-center gap-6 px-10 py-6 bg-gradient-to-r from-primary/25 via-purple-500/25 to-primary/25 border-3 border-primary/40 rounded-full backdrop-blur-xl mb-12 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-purple-500/15 rounded-full"></div>
            <Sparkles className="relative text-primary w-8 h-8 animate-pulse" />
            <span className="relative font-bold text-lg text-primary">
              Always Learning • Forever Growing • Never Settling
            </span>
            <div className="relative w-4 h-4 bg-primary rounded-full animate-ping"></div>
          </div>
          
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This comprehensive overview represents years of dedicated learning and hands-on experience. 
            Each technology shown has been battle-tested in real-world projects and continues to evolve with industry standards.
          </p>
        </motion.div>
      </div>
    </div>
  );
}