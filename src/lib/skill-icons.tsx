import {
  Code,
  Database,
  Cloud,
  Palette,
  Smartphone,
  Globe,
  Server,
  GitBranch,
  Layers,
  Zap,
  Settings,
  Terminal,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Container,
  Workflow,
  FileCode,
  Braces,
  Hash,
  Coffee,
  ChevronRight,
  Box,
  Package,
  Wrench,
  Chrome,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  Star,
  Sparkles
} from "lucide-react";

// Comprehensive skill icon mapping
const SKILL_ICON_MAP: Record<string, JSX.Element> = {
  // Frontend Technologies
  'react': <div className="text-[#61DAFB]">⚛️</div>,
  'nextjs': <div className="text-black dark:text-white">▲</div>,
  'next.js': <div className="text-black dark:text-white">▲</div>,
  'vue': <div className="text-[#4FC08D]">🖖</div>,
  'vue.js': <div className="text-[#4FC08D]">🖖</div>,
  'angular': <div className="text-[#DD0031]">🅰️</div>,
  'svelte': <div className="text-[#FF3E00]">🔥</div>,
  'javascript': <div className="text-[#F7DF1E]">🟨</div>,
  'js': <div className="text-[#F7DF1E]">🟨</div>,
  'typescript': <div className="text-[#3178C6]">🔷</div>,
  'ts': <div className="text-[#3178C6]">🔷</div>,
  'html': <div className="text-[#E34F26]">🌐</div>,
  'html5': <div className="text-[#E34F26]">🌐</div>,
  'css': <div className="text-[#1572B6]">🎨</div>,
  'css3': <div className="text-[#1572B6]">🎨</div>,
  'sass': <div className="text-[#CC6699]">💅</div>,
  'scss': <div className="text-[#CC6699]">💅</div>,
  'tailwind': <div className="text-[#06B6D4]">🌊</div>,
  'tailwindcss': <div className="text-[#06B6D4]">🌊</div>,
  'bootstrap': <div className="text-[#7952B3]">🅱️</div>,
  'jquery': <div className="text-[#0769AD]">💎</div>,

  // Backend Technologies
  'nodejs': <div className="text-[#339933]">🟢</div>,
  'node.js': <div className="text-[#339933]">🟢</div>,
  'node': <div className="text-[#339933]">🟢</div>,
  'express': <div className="text-[#000000] dark:text-white">⚡</div>,
  'expressjs': <div className="text-[#000000] dark:text-white">⚡</div>,
  'nestjs': <div className="text-[#E0234E]">🐱</div>,
  'nest.js': <div className="text-[#E0234E]">🐱</div>,
  'python': <div className="text-[#3776AB]">🐍</div>,
  'django': <div className="text-[#092E20]">🎸</div>,
  'flask': <div className="text-[#000000] dark:text-white">🌶️</div>,
  'fastapi': <div className="text-[#009688]">🚀</div>,
  'php': <div className="text-[#777BB4]">🐘</div>,
  'laravel': <div className="text-[#FF2D20]">🔴</div>,
  'ruby': <div className="text-[#CC342D]">💎</div>,
  'rails': <div className="text-[#CC0000]">🚂</div>,
  'java': <div className="text-[#ED8B00]">☕</div>,
  'spring': <div className="text-[#6DB33F]">🌱</div>,
  'go': <div className="text-[#00ADD8]">🐹</div>,
  'golang': <div className="text-[#00ADD8]">🐹</div>,
  'rust': <div className="text-[#000000] dark:text-white">🦀</div>,
  'c#': <div className="text-[#239120]">🔷</div>,
  'csharp': <div className="text-[#239120]">🔷</div>,
  '.net': <div className="text-[#512BD4]">🔵</div>,
  'dotnet': <div className="text-[#512BD4]">🔵</div>,
  'asp.net': <div className="text-[#512BD4]">🔵</div>,

  // Databases
  'mysql': <div className="text-[#4479A1]">🐬</div>,
  'postgresql': <div className="text-[#336791]">🐘</div>,
  'postgres': <div className="text-[#336791]">🐘</div>,
  'mongodb': <div className="text-[#47A248]">🍃</div>,
  'mongo': <div className="text-[#47A248]">🍃</div>,
  'redis': <div className="text-[#DC382D]">🔴</div>,
  'sqlite': <div className="text-[#003B57]">💎</div>,
  'firebase': <div className="text-[#FFCA28]">🔥</div>,
  'supabase': <div className="text-[#3ECF8E]">⚡</div>,
  'prisma': <div className="text-[#2D3748]">🔷</div>,
  'graphql': <div className="text-[#E10098]">📈</div>,

  // DevOps & Cloud
  'docker': <div className="text-[#2496ED]">🐳</div>,
  'kubernetes': <div className="text-[#326CE5]">⎈</div>,
  'k8s': <div className="text-[#326CE5]">⎈</div>,
  'aws': <div className="text-[#FF9900]">☁️</div>,
  'azure': <div className="text-[#0078D4]">☁️</div>,
  'gcp': <div className="text-[#4285F4]">☁️</div>,
  'google cloud': <div className="text-[#4285F4]">☁️</div>,
  'heroku': <div className="text-[#430098]">📦</div>,
  'vercel': <div className="text-black dark:text-white">▲</div>,
  'netlify': <div className="text-[#00C7B7]">🌐</div>,
  'jenkins': <div className="text-[#D33833]">🔧</div>,
  'github actions': <div className="text-[#2088FF]">⚙️</div>,
  'circleci': <div className="text-[#343434]">⭕</div>,
  'terraform': <div className="text-[#623CE4]">🏗️</div>,
  'ansible': <div className="text-[#EE0000]">📋</div>,
  'vagrant': <div className="text-[#1563FF]">📦</div>,

  // Tools & Version Control
  'git': <div className="text-[#F05032]">🌳</div>,
  'github': <div className="text-black dark:text-white">🐙</div>,
  'gitlab': <div className="text-[#FCA326]">🦊</div>,
  'bitbucket': <div className="text-[#0052CC]">🪣</div>,
  'vscode': <div className="text-[#007ACC]">💻</div>,
  'vim': <div className="text-[#019733]">📝</div>,
  'intellij': <div className="text-[#000000] dark:text-white">💡</div>,
  'webstorm': <div className="text-[#000000] dark:text-white">🌊</div>,
  'postman': <div className="text-[#FF6C37]">📮</div>,
  'insomnia': <div className="text-[#4000BF]">😴</div>,
  'figma': <div className="text-[#F24E1E]">🎨</div>,
  'adobe': <div className="text-[#FF0000]">🅰️</div>,
  'photoshop': <div className="text-[#31A8FF]">🎨</div>,
  'illustrator': <div className="text-[#FF9A00]">🎨</div>,
  'xd': <div className="text-[#FF61F6]">🎨</div>,

  // Mobile Development
  'react native': <div className="text-[#61DAFB]">📱</div>,
  'flutter': <div className="text-[#02569B]">🐦</div>,
  'dart': <div className="text-[#0175C2]">🎯</div>,
  'swift': <div className="text-[#FA7343]">🦉</div>,
  'kotlin': <div className="text-[#7F52FF]">🎯</div>,
  'xamarin': <div className="text-[#3199DC]">📱</div>,
  'ionic': <div className="text-[#3880FF]">⚡</div>,

  // Testing
  'jest': <div className="text-[#C21325]">🃏</div>,
  'cypress': <div className="text-[#17202C]">🌲</div>,
  'selenium': <div className="text-[#43B02A]">🕷️</div>,
  'playwright': <div className="text-[#2EAD33]">🎭</div>,
  'testing-library': <div className="text-[#E33332]">🧪</div>,

  // Other Technologies
  'webpack': <div className="text-[#8DD6F9]">📦</div>,
  'vite': <div className="text-[#646CFF]">⚡</div>,
  'rollup': <div className="text-[#EC4A3F]">📦</div>,
  'babel': <div className="text-[#F9DC3E]">🐠</div>,
  'eslint': <div className="text-[#4B32C3]">📏</div>,
  'prettier': <div className="text-[#F7B93E]">✨</div>,
  'storybook': <div className="text-[#FF4785]">📚</div>,
};

// Fallback icons for categories
const CATEGORY_ICON_MAP: Record<string, JSX.Element> = {
  'frontend': <Code className="w-full h-full text-blue-500" />,
  'backend': <Server className="w-full h-full text-green-500" />,
  'database': <Database className="w-full h-full text-purple-500" />,
  'devops': <Cloud className="w-full h-full text-orange-500" />,
  'infrastructure': <Network className="w-full h-full text-gray-500" />,
  'mobile': <Smartphone className="w-full h-full text-pink-500" />,
  'tools': <Wrench className="w-full h-full text-yellow-500" />,
  'design': <Palette className="w-full h-full text-indigo-500" />,
  'testing': <Shield className="w-full h-full text-red-500" />,
  'other': <Star className="w-full h-full text-gray-500" />,
};

/**
 * Get the appropriate icon for a skill
 * @param skillName - The name of the skill
 * @param customIcon - Optional custom icon override
 * @param category - Optional category for fallback icon
 * @returns JSX.Element representing the skill icon
 */
export function getSkillIcon(
  skillName: string,
  customIcon?: string | null,
  category?: string
): JSX.Element {
  // If custom icon is provided, use it
  if (customIcon) {
    return <span className="text-2xl">{customIcon}</span>;
  }

  // Normalize skill name for lookup
  const normalizedName = skillName.toLowerCase().trim();
  
  // Try to find exact match
  if (SKILL_ICON_MAP[normalizedName]) {
    return SKILL_ICON_MAP[normalizedName];
  }

  // Try partial matches for common variations
  const partialMatch = Object.keys(SKILL_ICON_MAP).find(key => 
    normalizedName.includes(key) || key.includes(normalizedName)
  );
  
  if (partialMatch && SKILL_ICON_MAP[partialMatch]) {
    return SKILL_ICON_MAP[partialMatch];
  }

  // Fall back to category icon
  if (category) {
    const categoryIcon = CATEGORY_ICON_MAP[category.toLowerCase()];
    if (categoryIcon) {
      return categoryIcon;
    }
  }

  // Ultimate fallback based on skill name patterns
  if (normalizedName.includes('js') || normalizedName.includes('script')) {
    return <Code className="w-full h-full text-yellow-500" />;
  }
  
  if (normalizedName.includes('db') || normalizedName.includes('sql') || normalizedName.includes('mongo')) {
    return <Database className="w-full h-full text-purple-500" />;
  }
  
  if (normalizedName.includes('cloud') || normalizedName.includes('aws') || normalizedName.includes('azure')) {
    return <Cloud className="w-full h-full text-blue-500" />;
  }
  
  if (normalizedName.includes('design') || normalizedName.includes('ui') || normalizedName.includes('ux')) {
    return <Palette className="w-full h-full text-pink-500" />;
  }

  // Default fallback
  return <Sparkles className="w-full h-full text-gray-500" />;
}

/**
 * Get all available skill icons (for admin interface)
 * @returns Object with skill names as keys and icons as values
 */
export function getAllSkillIcons(): Record<string, JSX.Element> {
  return SKILL_ICON_MAP;
}

/**
 * Get suggested icons for a skill name
 * @param skillName - The skill name to get suggestions for
 * @returns Array of suggested icon keys
 */
export function getSuggestedIcons(skillName: string): string[] {
  const normalizedName = skillName.toLowerCase().trim();
  
  return Object.keys(SKILL_ICON_MAP).filter(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  ).slice(0, 5);
}