import {
  Award,
  Binary,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Network,
  Palette,
  Server,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";

export const getSkillIcon = (skillName: string, iconString?: string) => {
  const iconProps = { className: "w-6 h-6" };

  // Database icon mapping
  const iconMap: Record<string, JSX.Element> = {
    // Current database values
    dotnet: <Server {...iconProps} />,
    SiDotnet: <Server {...iconProps} />,
    SiReact: <Code2 {...iconProps} />,
    SiNextdotjs: <Globe {...iconProps} />,
    SiJavascript: <Code2 {...iconProps} />,
    SiMicrosoftsqlserver: <Database {...iconProps} />,
    SiAzuredevops: <Settings {...iconProps} />,

    // Lucide icons
    Server: <Server {...iconProps} />,
    Code2: <Code2 {...iconProps} />,
    Globe: <Globe {...iconProps} />,
    Database: <Database {...iconProps} />,
    Settings: <Settings {...iconProps} />,
    Terminal: <Terminal {...iconProps} />,
    Cloud: <Cloud {...iconProps} />,
    Shield: <Shield {...iconProps} />,
    GitBranch: <GitBranch {...iconProps} />,
    Cpu: <Cpu {...iconProps} />,
    Network: <Network {...iconProps} />,
    Binary: <Binary {...iconProps} />,
    Boxes: <Boxes {...iconProps} />,
    Wrench: <Wrench {...iconProps} />,
    Palette: <Palette {...iconProps} />,
    Smartphone: <Smartphone {...iconProps} />,
    Zap: <Zap {...iconProps} />,
  };

  // First try exact icon match
  if (iconString && iconMap[iconString]) {
    return iconMap[iconString];
  }

  // Fallback to name-based mapping
  const name = skillName.toLowerCase();

  // Frontend
  if (name.includes("react")) return <Code2 {...iconProps} />;
  if (name.includes("next")) return <Globe {...iconProps} />;
  if (name.includes("javascript") || name.includes("typescript"))
    return <Code2 {...iconProps} />;
  if (name.includes("html") || name.includes("css"))
    return <Globe {...iconProps} />;

  // Backend
  if (name.includes(".net") || name.includes("dotnet"))
    return <Server {...iconProps} />;
  if (name.includes("node")) return <Server {...iconProps} />;
  if (name.includes("python")) return <Terminal {...iconProps} />;

  // Database
  if (name.includes("sql") || name.includes("database"))
    return <Database {...iconProps} />;
  if (name.includes("mongodb")) return <Database {...iconProps} />;

  // DevOps
  if (name.includes("docker")) return <Boxes {...iconProps} />;
  if (name.includes("aws") || name.includes("azure") || name.includes("cloud"))
    return <Cloud {...iconProps} />;
  if (name.includes("git")) return <GitBranch {...iconProps} />;

  // Default
  return <Code2 {...iconProps} />;
};

export const getProficiencyConfig = (proficiency?: number) => {
  if (!proficiency) {
    return {
      level: "Beginner",
      color: "from-gray-400 to-gray-500",
      textColor: "text-gray-600",
      icon: <Star className="w-4 h-4" />,
    };
  }

  if (proficiency >= 90) {
    return {
      level: "Expert",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-600",
      icon: <Award className="w-4 h-4" />,
    };
  }

  if (proficiency >= 75) {
    return {
      level: "Advanced",
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-600",
      icon: <TrendingUp className="w-4 h-4" />,
    };
  }

  if (proficiency >= 50) {
    return {
      level: "Intermediate",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
      icon: <Sparkles className="w-4 h-4" />,
    };
  }

  return {
    level: "Beginner",
    color: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-600",
    icon: <Star className="w-4 h-4" />,
  };
};
