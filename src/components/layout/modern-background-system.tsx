"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface BackgroundProps {
  variant?: 'home' | 'minimal' | 'dynamic' | 'auto';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export default function ModernBackgroundSystem({
  variant = 'auto',
  intensity = 'medium',
  className = ''
}: BackgroundProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Performance optimization: reduce complexity on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const isDark = theme === 'dark';

  // Intensity-based opacity calculations with mobile optimization
  const getOpacity = (base: number) => {
    const multiplier = intensity === 'subtle' ? 0.6 : intensity === 'strong' ? 1.4 : 1;
    const mobileReduction = isMobile ? 0.7 : 1; // Reduce on mobile for performance
    return base * multiplier * mobileReduction;
  };

  const baseOpacity = isDark ? getOpacity(0.08) : getOpacity(0.04);
  const accentOpacity = isDark ? getOpacity(0.05) : getOpacity(0.025);
  const gradientOpacity = isDark ? getOpacity(0.12) : getOpacity(0.06);

  // Auto variant selection based on route
  const getVariant = () => {
    if (variant !== 'auto') return variant;

    if (pathname === '/') return 'home';
    if (pathname?.includes('/admin')) return null; // No background
    if (pathname?.includes('/blog') || pathname?.includes('/contact')) return 'minimal';
    return 'dynamic';
  };

  const selectedVariant = getVariant();

  if (!selectedVariant) return null;

  // Home page - Premium animated background
  if (selectedVariant === 'home') {
    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        {/* Animated mesh gradient base */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, ${gradientOpacity * 0.6}), transparent 50%),
                   radial-gradient(circle at 80% 80%, rgba(168, 85, 247, ${gradientOpacity * 0.4}), transparent 50%),
                   radial-gradient(circle at 40% 60%, rgba(16, 185, 129, ${gradientOpacity * 0.3}), transparent 50%)`
                : `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, ${gradientOpacity * 0.4}), transparent 50%),
                   radial-gradient(circle at 80% 80%, rgba(168, 85, 247, ${gradientOpacity * 0.3}), transparent 50%),
                   radial-gradient(circle at 40% 60%, rgba(16, 185, 129, ${gradientOpacity * 0.2}), transparent 50%)`
            }}
          />
        </div>

        {/* Floating animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-subtle-float opacity-40"
             style={{
               background: `conic-gradient(from 0deg, ${isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.08)'},
                           ${isDark ? 'rgba(236, 72, 153, 0.12)' : 'rgba(236, 72, 153, 0.06)'},
                           ${isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)'})`,
               animation: 'gradient-float 20s ease-in-out infinite'
             }} />

        <div className="absolute top-3/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-subtle-float opacity-30"
             style={{
               background: `radial-gradient(ellipse, ${isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.06)'}, transparent 70%)`,
               animation: 'gradient-float-delayed 25s ease-in-out infinite'
             }} />

        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl animate-subtle-float opacity-25"
             style={{
               background: `radial-gradient(circle, ${isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'}, transparent 70%)`,
               animation: 'gradient-float-slow 30s ease-in-out infinite'
             }} />

        {/* Sophisticated dot pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${baseOpacity}), transparent 0)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 100% 60% at center, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at center, black, transparent)'
          }}
        />

        {/* Dynamic tech grid that responds to scroll */}
        <div
          className="absolute inset-0 animate-subtle-float"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, ${accentOpacity * 0.5}) 0.5px, transparent 0.5px),
              linear-gradient(90deg, rgba(59, 130, 246, ${accentOpacity * 0.5}) 0.5px, transparent 0.5px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 50% at center, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at center, black, transparent)'
          }}
        />

        {/* Subtle noise texture for depth */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }

  // Minimal variant for reading-focused pages
  if (selectedVariant === 'minimal') {
    return (
      <div className={`fixed inset-0 pointer-events-none ${className}`}>
        <div
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(148, 163, 184, ${baseOpacity * 0.6}), transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    );
  }

  // Dynamic variant for interactive pages
  if (selectedVariant === 'dynamic') {
    const getPageSpecificBackground = () => {
      // Projects pages - Tech-focused
      if (pathname?.startsWith('/projects')) {
        return (
          <>
            {/* Animated tech grid */}
            <div
              className="absolute inset-0 animate-subtle-float"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, ${accentOpacity}) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, ${accentOpacity}) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />

            {/* Floating tech elements */}
            <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl animate-gradient-float opacity-40"
                 style={{
                   background: `conic-gradient(from 45deg, ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'},
                               ${isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.06)'},
                               ${isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.04)'})`,
                 }} />
          </>
        );
      }

      // Services pages - Premium gradients
      if (pathname?.startsWith('/services')) {
        return (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-gradient-float-delayed opacity-30"
                 style={{
                   background: `conic-gradient(from 0deg, ${isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)'},
                               ${isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.08)'},
                               ${isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)'})`,
                 }} />

            <div
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${accentOpacity}), transparent 0)`,
                backgroundSize: '56px 56px',
              }}
            />
          </>
        );
      }

      // Skills pages - Structured patterns
      if (pathname?.startsWith('/skills')) {
        return (
          <div
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, ${baseOpacity}) 0.8px, transparent 0.8px),
                linear-gradient(90deg, rgba(59, 130, 246, ${baseOpacity}) 0.8px, transparent 0.8px),
                linear-gradient(rgba(168, 85, 247, ${accentOpacity}) 0.3px, transparent 0.3px),
                linear-gradient(90deg, rgba(168, 85, 247, ${accentOpacity}) 0.3px, transparent 0.3px)
              `,
              backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
            }}
          />
        );
      }

      // About pages - Organic waves
      if (pathname?.startsWith('/about')) {
        return (
          <>
            <div className="absolute inset-0">
              <div
                className="absolute top-0 left-0 w-full h-40 blur-2xl animate-gradient-float opacity-25"
                style={{
                  background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)'}, transparent)`,
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-full h-48 blur-2xl animate-gradient-float-delayed opacity-20"
                style={{
                  background: `linear-gradient(270deg, transparent, ${isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)'}, transparent)`,
                }}
              />
            </div>

            <div
              style={{
                backgroundImage: `
                  radial-gradient(ellipse 120% 40px at 50% 0%, rgba(59, 130, 246, ${accentOpacity}), transparent),
                  radial-gradient(ellipse 120% 40px at 50% 100%, rgba(168, 85, 247, ${accentOpacity * 0.8}), transparent)
                `,
                backgroundSize: '140px 80px',
                backgroundPosition: '0 0, 70px 40px',
              }}
            />
          </>
        );
      }

      // Default pattern
      return (
        <>
          <div
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${baseOpacity}), transparent 0)`,
              backgroundSize: '42px 42px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, ${accentOpacity}), transparent 0)`,
              backgroundSize: '84px 84px',
              backgroundPosition: '21px 21px',
            }}
          />
        </>
      );
    };

    return (
      <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
        {getPageSpecificBackground()}
      </div>
    );
  }

  return null;
}

// Utility component for custom patterns
export function CustomBackgroundPattern({
  pattern,
  size = 'md',
  opacity = 'medium',
  className = ''
}: {
  pattern: 'dots' | 'grid' | 'tech' | 'diamond' | 'organic';
  size?: 'sm' | 'md' | 'lg';
  opacity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';
  const sizeMap = { sm: '24px', md: '36px', lg: '48px' };
  const opacityMap = {
    subtle: isDark ? 0.04 : 0.02,
    medium: isDark ? 0.08 : 0.04,
    strong: isDark ? 0.12 : 0.06
  };

  const patternSize = sizeMap[size];
  const patternOpacity = opacityMap[opacity];

  const getPattern = () => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${patternOpacity}), transparent 0)`,
          backgroundSize: `${patternSize} ${patternSize}`
        };
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, ${patternOpacity}) 0.5px, transparent 0.5px),
            linear-gradient(90deg, rgba(148, 163, 184, ${patternOpacity}) 0.5px, transparent 0.5px)
          `,
          backgroundSize: `${patternSize} ${patternSize}`
        };
      case 'tech':
        return {
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, ${patternOpacity}) 0.8px, transparent 0.8px),
            linear-gradient(90deg, rgba(59, 130, 246, ${patternOpacity}) 0.8px, transparent 0.8px)
          `,
          backgroundSize: `${patternSize} ${patternSize}`
        };
      case 'diamond':
        return {
          backgroundImage: `
            radial-gradient(circle at 0.5px 0.5px, rgba(168, 85, 247, ${patternOpacity}) 0.5px, transparent 0.5px),
            radial-gradient(circle at 12.5px 12.5px, rgba(168, 85, 247, ${patternOpacity * 0.6}) 0.5px, transparent 0.5px)
          `,
          backgroundSize: `25px 25px`
        };
      case 'organic':
        return {
          backgroundImage: `
            radial-gradient(ellipse 100% 40px at 50% 0%, rgba(16, 185, 129, ${patternOpacity}), transparent),
            radial-gradient(ellipse 100% 40px at 50% 100%, rgba(59, 130, 246, ${patternOpacity * 0.8}), transparent)
          `,
          backgroundSize: '120px 80px',
          backgroundPosition: '0 0, 60px 40px'
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={getPattern()}
    />
  );
}