"use client";

import { motion } from "framer-motion";
import {
  Binary,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCode,
  GitBranch,
  Globe,
  Layers,
  MonitorSpeaker,
  Network,
  Palette,
  Server,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react";

// Define the Skill interface directly
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

// Comprehensive icon mapping for skills based on your database
const getSkillIcon = (skillName: string, iconString?: string) => {
  const iconProps = { size: 24, className: "transition-all duration-300" };

  // Database icon mapping - handles both current DB values and suggested Lucide icons
  const iconMap: Record<string, JSX.Element> = {
    // Current database icon values (from your CSV)
    dotnet: <Server {...iconProps} />,
    SiDotnet: <Server {...iconProps} />,
    SiReact: <Code2 {...iconProps} />,
    SiNextdotjs: <Globe {...iconProps} />,
    SiJavascript: <FileCode {...iconProps} />,
    SiMicrosoftsqlserver: <Database {...iconProps} />,
    SiAzuredevops: <Settings {...iconProps} />,

    // Recommended Lucide icon names for your database update
    Server: <Server {...iconProps} />,
    Code2: <Code2 {...iconProps} />,
    Globe: <Globe {...iconProps} />,
    FileCode: <FileCode {...iconProps} />,
    Database: <Database {...iconProps} />,
    Settings: <Settings {...iconProps} />,
    Terminal: <Terminal {...iconProps} />,
    Layers: <Layers {...iconProps} />,
    Cloud: <Cloud {...iconProps} />,
    Shield: <Shield {...iconProps} />,
    GitBranch: <GitBranch {...iconProps} />,
    Cpu: <Cpu {...iconProps} />,
    Network: <Network {...iconProps} />,
    Binary: <Binary {...iconProps} />,
    Boxes: <Boxes {...iconProps} />,
    MonitorSpeaker: <MonitorSpeaker {...iconProps} />,
    Wrench: <Wrench {...iconProps} />,
    Palette: <Palette {...iconProps} />,
    Smartphone: <Smartphone {...iconProps} />,
    Zap: <Zap {...iconProps} />,
  };

  // First try to use the exact icon string from database
  if (iconString && iconMap[iconString]) {
    return iconMap[iconString];
  }

  // Fallback to skill name-based intelligent mapping
  const name = skillName.toLowerCase();

  // Frontend Technologies
  if (name.includes("react")) return <Code2 {...iconProps} />;
  if (name.includes("next.js") || name.includes("nextjs"))
    return <Globe {...iconProps} />;
  if (name.includes("javascript") || name.includes("js"))
    return <FileCode {...iconProps} />;
  if (name.includes("typescript") || name.includes("ts"))
    return <FileCode {...iconProps} />;
  if (name.includes("html") || name.includes("css"))
    return <Globe {...iconProps} />;
  if (name.includes("vue") || name.includes("angular"))
    return <Code2 {...iconProps} />;
  if (name.includes("tailwind") || name.includes("bootstrap"))
    return <Palette {...iconProps} />;

  // Backend Technologies
  if (name.includes(".net") || name.includes("dotnet"))
    return <Server {...iconProps} />;
  if (name.includes("asp.net")) return <Server {...iconProps} />;
  if (name.includes("node") || name.includes("express"))
    return <Server {...iconProps} />;
  if (
    name.includes("python") ||
    name.includes("django") ||
    name.includes("flask")
  )
    return <Terminal {...iconProps} />;
  if (name.includes("java") || name.includes("spring"))
    return <Cpu {...iconProps} />;
  if (name.includes("php") || name.includes("laravel"))
    return <Server {...iconProps} />;

  // Database Technologies
  if (name.includes("sql server") || name.includes("mssql"))
    return <Database {...iconProps} />;
  if (
    name.includes("mysql") ||
    name.includes("postgresql") ||
    name.includes("postgres")
  )
    return <Database {...iconProps} />;
  if (name.includes("mongodb") || name.includes("nosql"))
    return <Database {...iconProps} />;
  if (name.includes("redis") || name.includes("cache"))
    return <Binary {...iconProps} />;

  // DevOps & Infrastructure
  if (name.includes("devops") || name.includes("ci/cd"))
    return <Settings {...iconProps} />;
  if (name.includes("docker") || name.includes("kubernetes"))
    return <Boxes {...iconProps} />;
  if (name.includes("aws") || name.includes("azure") || name.includes("cloud"))
    return <Cloud {...iconProps} />;
  if (
    name.includes("git") ||
    name.includes("github") ||
    name.includes("gitlab")
  )
    return <GitBranch {...iconProps} />;
  if (
    name.includes("linux") ||
    name.includes("ubuntu") ||
    name.includes("terminal")
  )
    return <Terminal {...iconProps} />;

  // Mobile Development
  if (
    name.includes("mobile") ||
    name.includes("android") ||
    name.includes("ios")
  )
    return <Smartphone {...iconProps} />;
  if (name.includes("flutter") || name.includes("react native"))
    return <Smartphone {...iconProps} />;

  // Security & Testing
  if (name.includes("security") || name.includes("auth"))
    return <Shield {...iconProps} />;
  if (name.includes("testing") || name.includes("qa") || name.includes("jest"))
    return <Wrench {...iconProps} />;

  // Design & UI/UX
  if (name.includes("design") || name.includes("ui") || name.includes("ux"))
    return <Palette {...iconProps} />;
  if (name.includes("figma") || name.includes("photoshop"))
    return <Palette {...iconProps} />;

  // Networks & APIs
  if (name.includes("api") || name.includes("rest") || name.includes("graphql"))
    return <Network {...iconProps} />;
  if (name.includes("microservices")) return <Layers {...iconProps} />;

  // Default icon for unknown skills
  return <Code2 {...iconProps} />;
};

// Get proficiency level styling
const getProficiencyLevel = (proficiency?: number) => {
  if (!proficiency)
    return {
      level: "Beginner",
      color: "from-gray-400 to-gray-500",
      textColor: "text-gray-600",
    };

  if (proficiency >= 90)
    return {
      level: "Expert",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-600",
    };
  if (proficiency >= 75)
    return {
      level: "Advanced",
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-600",
    };
  if (proficiency >= 50)
    return {
      level: "Intermediate",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
    };
  return {
    level: "Beginner",
    color: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-600",
  };
};

// Get category styling based on your actual database categories
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Frontend:
      "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800",
    Backend:
      "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800",
    Database:
      "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800",
    Infrastructure:
      "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800",
    DevOps:
      "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800",
    Mobile:
      "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800",
    Tools:
      "bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-200 dark:border-gray-800",
    Other:
      "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800",
  };

  return colors[category] || colors["Other"];
};

export default function Skills({ skills }: SkillsProps) {
  // Group skills by category with better handling
  const categoryMap: Record<string, Skill[]> = {};
  skills.forEach((skill) => {
    const category = skill.category || "Other";
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    categoryMap[category].push(skill);
  });

  // Sort categories and skills
  const sortedCategories = Object.keys(categoryMap).sort();
  sortedCategories.forEach((category) => {
    categoryMap[category].sort(
      (a, b) => (b.proficiency || 0) - (a.proficiency || 0)
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05,
      },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-accent/30 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Skills
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Technologies and tools I've mastered over my{" "}
            <span className="text-primary font-semibold">6+ years</span> in
            software development. Each skill represents countless hours of
            learning, building, and problem-solving.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {sortedCategories.map((category) => (
            <motion.div key={category} variants={categoryVariants}>
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                  {category}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryMap[category].map((skill, index) => {
                  const proficiencyInfo = getProficiencyLevel(
                    skill.proficiency
                  );
                  const categoryColor = getCategoryColor(category);

                  return (
                    <motion.div
                      key={skill.id}
                      variants={skillVariants}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 },
                      }}
                      className={`
                        relative p-6 rounded-2xl border-2 backdrop-blur-sm
                        hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300
                        group cursor-pointer ${categoryColor}
                      `}
                    >
                      {/* Skill Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                          <div className="text-primary group-hover:text-purple-600 transition-colors duration-300">
                            {getSkillIcon(skill.name, skill.icon)}
                          </div>
                        </div>

                        {/* Proficiency Badge */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${proficiencyInfo.textColor} bg-white/20 backdrop-blur-sm border border-white/30`}
                        >
                          {proficiencyInfo.level}
                        </div>
                      </div>

                      {/* Skill Name */}
                      <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                        {skill.name}
                      </h4>

                      {/* Proficiency Bar */}
                      {skill.proficiency && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Proficiency
                            </span>
                            <span className="font-semibold">
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
                              className={`h-full bg-gradient-to-r ${proficiencyInfo.color} rounded-full relative`}
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
                                className="absolute top-0 left-0 h-full w-1/3 bg-white/30 transform skew-x-12"
                              />
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-full">
            <Zap className="text-primary" size={20} />
            <span className="text-sm font-medium">
              Always learning and expanding my skillset
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
