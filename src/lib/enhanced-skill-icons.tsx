import React from 'react';
import Image from 'next/image';
import { getComprehensiveSkillIcon } from './comprehensive-skill-icons';
import { cn } from './utils';

interface EnhancedSkillIconProps {
  skillName: string;
  iconImage?: string | null;
  textIcon?: string | null;
  category?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPercentage?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const responsiveSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10', // Slightly smaller when percentage is shown
  xl: 'w-12 h-12'  // Smaller when percentage is shown
};

/**
 * Enhanced skill icon component with image priority system
 * Priority: 1. Image icon > 2. Text/emoji icon > 3. Category-based icon
 * 
 * When percentage is hidden: Icons are larger and more prominent
 * When percentage is shown: Icons are smaller to balance the layout
 */
export function EnhancedSkillIcon({
  skillName,
  iconImage,
  textIcon,
  category,
  size = 'md',
  showPercentage = true,
  className
}: EnhancedSkillIconProps) {
  // Choose size based on percentage visibility
  const effectiveSize = showPercentage ? size : (size === 'sm' ? 'md' : size === 'md' ? 'lg' : size);
  const sizeClass = showPercentage ? responsiveSizeClasses[effectiveSize] : sizeClasses[effectiveSize];
  
  // Priority 1: Image icon (highest priority)
  if (iconImage) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClass, className)}>
        <Image
          src={iconImage}
          alt={`${skillName} icon`}
          width={64}
          height={64}
          className="w-full h-full object-contain rounded-sm"
          onError={(e) => {
            // Fallback to next priority if image fails to load
            console.warn(`Failed to load skill icon image: ${iconImage}`);
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback content (hidden unless image fails) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0">
          {textIcon ? (
            <span className="text-lg">{textIcon}</span>
          ) : (
            <div className="text-sm">
              {getComprehensiveSkillIcon(skillName, textIcon, category)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Priority 2: Text/emoji icon
  if (textIcon && textIcon.trim()) {
    return (
      <div className={cn("flex items-center justify-center", sizeClass, className)}>
        <span className={cn("text-center", effectiveSize === 'xl' ? 'text-2xl' : effectiveSize === 'lg' ? 'text-xl' : 'text-lg')}>
          {textIcon}
        </span>
      </div>
    );
  }

  // Priority 3: Category-based comprehensive icon (fallback)
  return (
    <div className={cn("flex items-center justify-center", sizeClass, className)}>
      <div className={cn("text-center", effectiveSize === 'xl' ? 'text-xl' : effectiveSize === 'lg' ? 'text-lg' : 'text-base')}>
        {getComprehensiveSkillIcon(skillName, textIcon, category)}
      </div>
    </div>
  );
}

/**
 * Skill icon display for cards with enhanced responsive behavior
 * Optimized for vertical card layouts with prominent brand logo display
 */
export function SkillCardIcon({
  skillName,
  iconImage,
  textIcon,
  category,
  showPercentage = true,
  size = 'lg',
  className
}: Omit<EnhancedSkillIconProps, 'size'> & { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  // Size configurations for different contexts
  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 'sm' as const },
    md: { container: 'w-16 h-16', icon: 'md' as const },
    lg: { container: 'w-20 h-20', icon: 'lg' as const },
    xl: { container: 'w-24 h-24', icon: 'xl' as const },
  };
  
  const config = sizeConfig[size];
  
  return (
    <div className={cn(
      "rounded-2xl flex items-center justify-center transition-all duration-300 group relative overflow-hidden",
      config.container,
      "bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800",
      "border border-slate-200/60 dark:border-slate-600/60",
      "shadow-lg hover:shadow-xl hover:shadow-primary/20 dark:hover:shadow-primary/10",
      "hover:scale-105 hover:border-primary/30 dark:hover:border-primary/40",
      "backdrop-blur-sm",
      className
    )}>
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_70%)] opacity-60" />
      
      <EnhancedSkillIcon
        skillName={skillName}
        iconImage={iconImage}
        textIcon={textIcon}
        category={category}
        size={config.icon}
        showPercentage={showPercentage}
        className="relative z-10 drop-shadow-sm"
      />
      
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </div>
  );
}

/**
 * Compact skill icon for lists and grids
 */
export function CompactSkillIcon({
  skillName,
  iconImage,
  textIcon,
  category,
  className
}: Omit<EnhancedSkillIconProps, 'size' | 'showPercentage'>) {
  return (
    <div className={cn(
      "w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700",
      "border border-slate-200/60 dark:border-slate-600/60 flex items-center justify-center",
      "shadow-sm hover:shadow-md transition-all duration-200",
      className
    )}>
      <EnhancedSkillIcon
        skillName={skillName}
        iconImage={iconImage}
        textIcon={textIcon}
        category={category}
        size="sm"
        showPercentage={true}
      />
    </div>
  );
}

/**
 * Hero skill icon for large displays with premium styling
 */
export function HeroSkillIcon({
  skillName,
  iconImage,
  textIcon,
  category,
  className
}: Omit<EnhancedSkillIconProps, 'size' | 'showPercentage'>) {
  return (
    <div className={cn(
      "w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-white/50 to-purple-500/10 dark:from-primary/20 dark:via-slate-800/50 dark:to-purple-500/20",
      "border border-primary/30 dark:border-primary/40 shadow-2xl hover:shadow-3xl",
      "flex items-center justify-center transition-all duration-500 hover:scale-105",
      "backdrop-blur-sm relative overflow-hidden group",
      className
    )}>
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] opacity-50" />
      
      <EnhancedSkillIcon
        skillName={skillName}
        iconImage={iconImage}
        textIcon={textIcon}
        category={category}
        size="xl"
        showPercentage={false}
        className="relative z-10 drop-shadow-lg"
      />
    </div>
  );
}