import React from 'react';
import {
  // Technology icons from react-icons
  SiReact, SiNextdotjs, SiVuedotjs, SiAngular, SiSvelte,
  SiJavascript, SiTypescript, SiHtml5, SiCss3, SiSass, SiTailwindcss, SiBootstrap,
  SiNodedotjs, SiExpress, SiNestjs, SiPython, SiDjango, SiFlask, SiFastapi,
  SiPhp, SiLaravel, SiRuby, SiRubyonrails, SiSpring, SiGo, SiRust,
  SiDotnet, SiMysql, SiPostgresql, SiMongodb, SiRedis, SiSqlite,
  SiFirebase, SiSupabase, SiPrisma, SiGraphql, SiDocker, SiKubernetes,
  SiAmazons3, SiGooglecloud, SiHeroku, SiVercel, SiNetlify,
  SiJenkins, SiGithubactions, SiTerraform, SiAnsible, SiGit, SiGithub,
  SiGitlab, SiBitbucket, SiVisualstudiocode, SiPostman, SiFigma, SiAdobephotoshop,
  SiAdobeillustrator, SiAdobexd, SiFlutter, SiDart, SiSwift, SiKotlin,
  SiXamarin, SiIonic, SiJest, SiCypress, SiSelenium, SiPlaywright,
  SiWebpack, SiVite, SiRollup, SiBabel, SiEslint, SiPrettier, SiStorybook,
  SiLinux, SiWindows, SiMacos, SiUbuntu, SiCentos, SiRedhat, SiDebian,
  SiNginx, SiApache, SiElasticsearch, SiLogstash, SiKibana, SiPrometheus,
  SiGrafana, SiJira, SiTrello, SiSlack, SiDiscord, SiNotable, SiObsidian,
  SiConfluence, SiMiro, SiCanva, SiSketch, SiInvision, SiZeplin, SiFramer,
  SiWordpress, SiShopify, SiMagento, SiWoocommerce, SiStripe, SiPaypal,
  // Additional specific skill icons
  SiTensorflow, SiPytorch, SiOpencv, SiNumpy, SiPandas, SiJupyter,
  SiArduino, SiRaspberrypi, SiUnity, SiUnrealengine, SiBlender,
  SiSolidity, SiEthereum, SiBitcoin, SiWeb3Dotjs,
} from 'react-icons/si';
import {
  // Fallback generic icons from Lucide
  Code, Database, Cloud, Palette, Smartphone, Globe, Server, 
  GitBranch, Layers, Zap, Settings, Terminal, Monitor, Cpu, 
  HardDrive, Network, Shield, Container, Workflow, FileCode, 
  Braces, Hash, Coffee, Star, Sparkles, Award, Target, Brain,
  Activity, TrendingUp, Wrench, Package, Box, ChevronRight,
  Eye, EyeOff, Plus, Edit, Trash2, Save, X, Search, Filter, 
  Grid3X3, List, RefreshCw
} from 'lucide-react';

// Comprehensive skill icon mapping with react-icons
const COMPREHENSIVE_SKILL_ICONS: Record<string, { icon: React.ReactNode; category: string; color?: string }> = {
  // Frontend Technologies
  'react': { icon: <SiReact />, category: 'Frontend', color: '#61DAFB' },
  'nextjs': { icon: <SiNextdotjs />, category: 'Frontend', color: '#000000' },
  'next.js': { icon: <SiNextdotjs />, category: 'Frontend', color: '#000000' },
  'vue': { icon: <SiVuedotjs />, category: 'Frontend', color: '#4FC08D' },
  'vue.js': { icon: <SiVuedotjs />, category: 'Frontend', color: '#4FC08D' },
  'angular': { icon: <SiAngular />, category: 'Frontend', color: '#DD0031' },
  'svelte': { icon: <SiSvelte />, category: 'Frontend', color: '#FF3E00' },
  'javascript': { icon: <SiJavascript />, category: 'Frontend', color: '#F7DF1E' },
  'js': { icon: <SiJavascript />, category: 'Frontend', color: '#F7DF1E' },
  'typescript': { icon: <SiTypescript />, category: 'Frontend', color: '#3178C6' },
  'ts': { icon: <SiTypescript />, category: 'Frontend', color: '#3178C6' },
  'html': { icon: <SiHtml5 />, category: 'Frontend', color: '#E34F26' },
  'html5': { icon: <SiHtml5 />, category: 'Frontend', color: '#E34F26' },
  'css': { icon: <SiCss3 />, category: 'Frontend', color: '#1572B6' },
  'css3': { icon: <SiCss3 />, category: 'Frontend', color: '#1572B6' },
  'sass': { icon: <SiSass />, category: 'Frontend', color: '#CC6699' },
  'scss': { icon: <SiSass />, category: 'Frontend', color: '#CC6699' },
  'tailwind': { icon: <SiTailwindcss />, category: 'Frontend', color: '#06B6D4' },
  'tailwindcss': { icon: <SiTailwindcss />, category: 'Frontend', color: '#06B6D4' },
  'bootstrap': { icon: <SiBootstrap />, category: 'Frontend', color: '#7952B3' },

  // Backend Technologies
  'nodejs': { icon: <SiNodedotjs />, category: 'Backend', color: '#339933' },
  'node.js': { icon: <SiNodedotjs />, category: 'Backend', color: '#339933' },
  'node': { icon: <SiNodedotjs />, category: 'Backend', color: '#339933' },
  'express': { icon: <SiExpress />, category: 'Backend', color: '#000000' },
  'expressjs': { icon: <SiExpress />, category: 'Backend', color: '#000000' },
  'nestjs': { icon: <SiNestjs />, category: 'Backend', color: '#E0234E' },
  'nest.js': { icon: <SiNestjs />, category: 'Backend', color: '#E0234E' },
  'python': { icon: <SiPython />, category: 'Backend', color: '#3776AB' },
  'django': { icon: <SiDjango />, category: 'Backend', color: '#092E20' },
  'flask': { icon: <SiFlask />, category: 'Backend', color: '#000000' },
  'fastapi': { icon: <SiFastapi />, category: 'Backend', color: '#009688' },
  'php': { icon: <SiPhp />, category: 'Backend', color: '#777BB4' },
  'laravel': { icon: <SiLaravel />, category: 'Backend', color: '#FF2D20' },
  'ruby': { icon: <SiRuby />, category: 'Backend', color: '#CC342D' },
  'rails': { icon: <SiRubyonrails />, category: 'Backend', color: '#CC0000' },
  'ruby on rails': { icon: <SiRubyonrails />, category: 'Backend', color: '#CC0000' },
  'java': { icon: <Coffee />, category: 'Backend', color: '#ED8B00' },
  'spring': { icon: <SiSpring />, category: 'Backend', color: '#6DB33F' },
  'go': { icon: <SiGo />, category: 'Backend', color: '#00ADD8' },
  'golang': { icon: <SiGo />, category: 'Backend', color: '#00ADD8' },
  'rust': { icon: <SiRust />, category: 'Backend', color: '#000000' },
  'c#': { icon: <Hash />, category: 'Backend', color: '#239120' },
  'csharp': { icon: <Hash />, category: 'Backend', color: '#239120' },
  '.net': { icon: <SiDotnet />, category: 'Backend', color: '#512BD4' },
  'dotnet': { icon: <SiDotnet />, category: 'Backend', color: '#512BD4' },
  'asp.net': { icon: <SiDotnet />, category: 'Backend', color: '#512BD4' },

  // Databases
  'mysql': { icon: <SiMysql />, category: 'Database', color: '#4479A1' },
  'postgresql': { icon: <SiPostgresql />, category: 'Database', color: '#336791' },
  'postgres': { icon: <SiPostgresql />, category: 'Database', color: '#336791' },
  'mongodb': { icon: <SiMongodb />, category: 'Database', color: '#47A248' },
  'mongo': { icon: <SiMongodb />, category: 'Database', color: '#47A248' },
  'redis': { icon: <SiRedis />, category: 'Database', color: '#DC382D' },
  'sqlite': { icon: <SiSqlite />, category: 'Database', color: '#003B57' },
  'firebase': { icon: <SiFirebase />, category: 'Database', color: '#FFCA28' },
  'supabase': { icon: <SiSupabase />, category: 'Database', color: '#3ECF8E' },
  'prisma': { icon: <SiPrisma />, category: 'Database', color: '#2D3748' },
  'graphql': { icon: <SiGraphql />, category: 'Database', color: '#E10098' },
  'sql server': { icon: <Database />, category: 'Database', color: '#CC2927' },
  'microsoft sql server': { icon: <Database />, category: 'Database', color: '#CC2927' },
  'sqlserver': { icon: <Database />, category: 'Database', color: '#CC2927' },
  'mssql': { icon: <Database />, category: 'Database', color: '#CC2927' },

  // DevOps & Cloud
  'docker': { icon: <SiDocker />, category: 'DevOps', color: '#2496ED' },
  'kubernetes': { icon: <SiKubernetes />, category: 'DevOps', color: '#326CE5' },
  'k8s': { icon: <SiKubernetes />, category: 'DevOps', color: '#326CE5' },
  'aws': { icon: <SiAmazons3 />, category: 'DevOps', color: '#FF9900' },
  'amazon web services': { icon: <SiAmazons3 />, category: 'DevOps', color: '#FF9900' },
  'azure': { icon: <Cloud />, category: 'DevOps', color: '#0078D4' },
  'microsoft azure': { icon: <Cloud />, category: 'DevOps', color: '#0078D4' },
  'gcp': { icon: <SiGooglecloud />, category: 'DevOps', color: '#4285F4' },
  'google cloud': { icon: <SiGooglecloud />, category: 'DevOps', color: '#4285F4' },
  'heroku': { icon: <SiHeroku />, category: 'DevOps', color: '#430098' },
  'vercel': { icon: <SiVercel />, category: 'DevOps', color: '#000000' },
  'netlify': { icon: <SiNetlify />, category: 'DevOps', color: '#00C7B7' },
  'jenkins': { icon: <SiJenkins />, category: 'DevOps', color: '#D33833' },
  'github actions': { icon: <SiGithubactions />, category: 'DevOps', color: '#2088FF' },
  'terraform': { icon: <SiTerraform />, category: 'DevOps', color: '#623CE4' },
  'ansible': { icon: <SiAnsible />, category: 'DevOps', color: '#EE0000' },
  'devops': { icon: <Workflow />, category: 'DevOps', color: '#0078D4' },
  'azure devops': { icon: <Workflow />, category: 'DevOps', color: '#0078D4' },
  'ado': { icon: <Workflow />, category: 'DevOps', color: '#0078D4' },

  // Tools & Version Control
  'git': { icon: <SiGit />, category: 'Tools', color: '#F05032' },
  'github': { icon: <SiGithub />, category: 'Tools', color: '#181717' },
  'gitlab': { icon: <SiGitlab />, category: 'Tools', color: '#FCA326' },
  'bitbucket': { icon: <SiBitbucket />, category: 'Tools', color: '#0052CC' },
  'vscode': { icon: <SiVisualstudiocode />, category: 'Tools', color: '#007ACC' },
  'visual studio code': { icon: <SiVisualstudiocode />, category: 'Tools', color: '#007ACC' },
  'postman': { icon: <SiPostman />, category: 'Tools', color: '#FF6C37' },
  'figma': { icon: <SiFigma />, category: 'Design', color: '#F24E1E' },
  'photoshop': { icon: <SiAdobephotoshop />, category: 'Design', color: '#31A8FF' },
  'illustrator': { icon: <SiAdobeillustrator />, category: 'Design', color: '#FF9A00' },
  'adobe xd': { icon: <SiAdobexd />, category: 'Design', color: '#FF61F6' },
  'xd': { icon: <SiAdobexd />, category: 'Design', color: '#FF61F6' },

  // Mobile Development
  'react native': { icon: <SiReact />, category: 'Mobile', color: '#61DAFB' },
  'flutter': { icon: <SiFlutter />, category: 'Mobile', color: '#02569B' },
  'dart': { icon: <SiDart />, category: 'Mobile', color: '#0175C2' },
  'swift': { icon: <SiSwift />, category: 'Mobile', color: '#FA7343' },
  'kotlin': { icon: <SiKotlin />, category: 'Mobile', color: '#7F52FF' },
  'xamarin': { icon: <SiXamarin />, category: 'Mobile', color: '#3199DC' },
  'ionic': { icon: <SiIonic />, category: 'Mobile', color: '#3880FF' },

  // Testing
  'jest': { icon: <SiJest />, category: 'Tools', color: '#C21325' },
  'cypress': { icon: <SiCypress />, category: 'Tools', color: '#17202C' },
  'selenium': { icon: <SiSelenium />, category: 'Tools', color: '#43B02A' },
  'playwright': { icon: <SiPlaywright />, category: 'Tools', color: '#2EAD33' },

  // Build Tools & Bundlers
  'webpack': { icon: <SiWebpack />, category: 'Tools', color: '#8DD6F9' },
  'vite': { icon: <SiVite />, category: 'Tools', color: '#646CFF' },
  'rollup': { icon: <SiRollup />, category: 'Tools', color: '#EC4A3F' },
  'babel': { icon: <SiBabel />, category: 'Tools', color: '#F9DC3E' },
  'eslint': { icon: <SiEslint />, category: 'Tools', color: '#4B32C3' },
  'prettier': { icon: <SiPrettier />, category: 'Tools', color: '#F7B93E' },
  'storybook': { icon: <SiStorybook />, category: 'Tools', color: '#FF4785' },

  // Operating Systems
  'linux': { icon: <SiLinux />, category: 'Infrastructure', color: '#FCC624' },
  'ubuntu': { icon: <SiUbuntu />, category: 'Infrastructure', color: '#E95420' },
  'windows': { icon: <SiWindows />, category: 'Infrastructure', color: '#0078D6' },
  'macos': { icon: <SiMacos />, category: 'Infrastructure', color: '#000000' },

  // Data Science & AI
  'tensorflow': { icon: <SiTensorflow />, category: 'Other', color: '#FF6F00' },
  'pytorch': { icon: <SiPytorch />, category: 'Other', color: '#EE4C2C' },
  'opencv': { icon: <SiOpencv />, category: 'Other', color: '#5C3EE8' },
  'numpy': { icon: <SiNumpy />, category: 'Other', color: '#013243' },
  'pandas': { icon: <SiPandas />, category: 'Other', color: '#150458' },
  'jupyter': { icon: <SiJupyter />, category: 'Other', color: '#F37626' },

  // Blockchain & Web3
  'solidity': { icon: <SiSolidity />, category: 'Other', color: '#363636' },
  'ethereum': { icon: <SiEthereum />, category: 'Other', color: '#3C3C3D' },
  'bitcoin': { icon: <SiBitcoin />, category: 'Other', color: '#F7931A' },
  'web3': { icon: <SiWeb3Dotjs />, category: 'Other', color: '#F16822' },
  'web3.js': { icon: <SiWeb3Dotjs />, category: 'Other', color: '#F16822' },

  // CMS & E-commerce
  'wordpress': { icon: <SiWordpress />, category: 'Other', color: '#21759B' },
  'shopify': { icon: <SiShopify />, category: 'Other', color: '#7AB55C' },
  'magento': { icon: <SiMagento />, category: 'Other', color: '#FF6600' },
  'stripe': { icon: <SiStripe />, category: 'Other', color: '#008CDD' },
  'paypal': { icon: <SiPaypal />, category: 'Other', color: '#00457C' },

  // Game Development
  'unity': { icon: <SiUnity />, category: 'Other', color: '#000000' },
  'unreal engine': { icon: <SiUnrealengine />, category: 'Other', color: '#0E1128' },
  'blender': { icon: <SiBlender />, category: 'Other', color: '#F5792A' },

  // Hardware & IoT
  'arduino': { icon: <SiArduino />, category: 'Other', color: '#00979D' },
  'raspberry pi': { icon: <SiRaspberrypi />, category: 'Other', color: '#A22846' },
};

// Fallback icons for categories
const CATEGORY_FALLBACK_ICONS: Record<string, React.ReactNode> = {
  'frontend': <Code className="w-full h-full" />,
  'backend': <Server className="w-full h-full" />,
  'database': <Database className="w-full h-full" />,
  'devops': <Cloud className="w-full h-full" />,
  'infrastructure': <Network className="w-full h-full" />,
  'mobile': <Smartphone className="w-full h-full" />,
  'tools': <Wrench className="w-full h-full" />,
  'design': <Palette className="w-full h-full" />,
  'other': <Star className="w-full h-full" />,
};

/**
 * Get a comprehensive skill icon with proper fallbacks
 * @param skillName - The name of the skill
 * @param customIcon - Optional custom icon override
 * @param category - Optional category for fallback
 * @returns React element for the icon
 */
export function getComprehensiveSkillIcon(
  skillName: string,
  customIcon?: string | null,
  category?: string
): React.ReactNode {
  // If custom icon is provided, use it
  if (customIcon && customIcon.trim()) {
    return <span className="text-xl">{customIcon}</span>;
  }

  // Handle empty or invalid skill names
  if (!skillName || typeof skillName !== 'string') {
    return <Sparkles className="w-full h-full text-gray-500" />;
  }

  // Normalize skill name for lookup
  const normalizedName = skillName.toLowerCase().trim();
  
  // Try to find exact match
  const exactMatch = COMPREHENSIVE_SKILL_ICONS[normalizedName];
  if (exactMatch && exactMatch.icon) {
    return <div style={{ color: exactMatch.color }} className="flex items-center justify-center w-full h-full">
      {exactMatch.icon}
    </div>;
  }

  // Try partial matches for common variations
  const partialMatch = Object.entries(COMPREHENSIVE_SKILL_ICONS).find(([key, data]) => 
    data.icon && (normalizedName.includes(key) || key.includes(normalizedName))
  );
  
  if (partialMatch) {
    const [, iconData] = partialMatch;
    return <div style={{ color: iconData.color }} className="flex items-center justify-center w-full h-full">
      {iconData.icon}
    </div>;
  }

  // Fall back to category icon
  if (category && typeof category === 'string') {
    const categoryIcon = CATEGORY_FALLBACK_ICONS[category.toLowerCase()];
    if (categoryIcon) {
      return <div className="flex items-center justify-center w-full h-full text-slate-500">
        {categoryIcon}
      </div>;
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

  if (normalizedName.includes('mobile') || normalizedName.includes('app')) {
    return <Smartphone className="w-full h-full text-green-500" />;
  }

  if (normalizedName.includes('web') || normalizedName.includes('site')) {
    return <Globe className="w-full h-full text-blue-500" />;
  }

  // Default fallback
  return <Star className="w-full h-full text-gray-500" />;
}

/**
 * Get all available skill icons for dropdown selection
 * @returns Array of skill options with icons
 */
export function getAllSkillOptions(): Array<{
  value: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  color?: string;
}> {
  return Object.entries(COMPREHENSIVE_SKILL_ICONS).map(([key, data]) => ({
    value: key,
    label: key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    icon: data.icon,
    category: data.category,
    color: data.color
  })).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get skill options filtered by category
 * @param category - Category to filter by
 * @returns Filtered array of skill options
 */
export function getSkillOptionsByCategory(category: string): Array<{
  value: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  color?: string;
}> {
  return getAllSkillOptions().filter(option => 
    option.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get suggested icons for a skill name
 * @param skillName - The skill name to get suggestions for
 * @returns Array of suggested skill options
 */
export function getSuggestedSkillOptions(skillName: string): Array<{
  value: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  color?: string;
}> {
  const normalizedName = skillName.toLowerCase().trim();
  
  return getAllSkillOptions().filter(option => 
    option.value.includes(normalizedName) || 
    normalizedName.includes(option.value) ||
    option.label.toLowerCase().includes(normalizedName)
  ).slice(0, 10);
}

/**
 * Get all available categories
 * @returns Array of unique categories
 */
export function getSkillCategories(): string[] {
  const categories = new Set(
    Object.values(COMPREHENSIVE_SKILL_ICONS).map(data => data.category)
  );
  return Array.from(categories).sort();
}