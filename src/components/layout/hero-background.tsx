"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeroBackgroundProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'creative';
  intensity?: 'subtle' | 'medium' | 'strong';
}

export default function HeroBackground({
  className = '',
  variant = 'primary',
  intensity = 'medium'
}: HeroBackgroundProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  // Intensity calculations
  const getIntensity = (base: number) => {
    const multiplier = intensity === 'subtle' ? 0.7 : intensity === 'strong' ? 1.3 : 1;
    return base * multiplier;
  };

  const baseOpacity = isDark ? getIntensity(0.15) : getIntensity(0.08);
  const accentOpacity = isDark ? getIntensity(0.12) : getIntensity(0.06);
  const gradientOpacity = isDark ? getIntensity(0.18) : getIntensity(0.10);

  // Primary variant - Professional and elegant
  if (variant === 'primary') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Main gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? `radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59, 130, 246, ${gradientOpacity}), transparent 70%),
                 radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168, 85, 247, ${gradientOpacity * 0.8}), transparent 70%),
                 radial-gradient(ellipse 70% 35% at 50% 85%, rgba(16, 185, 129, ${gradientOpacity * 0.6}), transparent 70%)`
              : `radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59, 130, 246, ${gradientOpacity * 0.6}), transparent 70%),
                 radial-gradient(ellipse 60% 40% at 80% 70%, rgba(168, 85, 247, ${gradientOpacity * 0.5}), transparent 70%),
                 radial-gradient(ellipse 70% 35% at 50% 85%, rgba(16, 185, 129, ${gradientOpacity * 0.4}), transparent 70%)`
          }}
        />

        {/* Animated floating elements */}
        <div className="absolute top-1/4 right-1/4">
          <div
            className="w-80 h-80 rounded-full blur-3xl opacity-60"
            style={{
              background: `conic-gradient(from 45deg,
                ${isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.12)'},
                ${isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.08)'},
                ${isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.06)'},
                ${isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.10)'})`,
              animation: 'gradient-float 25s ease-in-out infinite'
            }}
          />
        </div>

        <div className="absolute bottom-1/4 left-1/4">
          <div
            className="w-96 h-96 rounded-full blur-3xl opacity-50"
            style={{
              background: `radial-gradient(ellipse 70% 70%,
                ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'} 0%,
                ${isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.06)'} 50%,
                transparent 100%)`,
              animation: 'gradient-float-delayed 30s ease-in-out infinite'
            }}
          />
        </div>

        {/* Premium dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${baseOpacity}), transparent 0)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 90% 70% at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at center, black 40%, transparent 90%)'
          }}
        />

        {/* Dynamic grid overlay */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, ${accentOpacity * 0.7}) 0.8px, transparent 0.8px),
              linear-gradient(90deg, rgba(59, 130, 246, ${accentOpacity * 0.7}) 0.8px, transparent 0.8px)
            `,
            backgroundSize: '120px 120px',
            maskImage: 'radial-gradient(ellipse 70% 50% at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at center, black 30%, transparent 80%)',
            animation: 'subtle-float 20s ease-in-out infinite'
          }}
        />

        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grain' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23ffffff' fill-opacity='0.1'/%3E%3Ccircle cx='50' cy='35' r='1.5' fill='%23ffffff' fill-opacity='0.08'/%3E%3Ccircle cx='80' cy='50' r='1' fill='%23ffffff' fill-opacity='0.12'/%3E%3Ccircle cx='30' cy='70' r='2.5' fill='%23ffffff' fill-opacity='0.06'/%3E%3Ccircle cx='70' cy='85' r='1.8' fill='%23ffffff' fill-opacity='0.09'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grain)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }

  // Secondary variant - Minimalist and clean
  if (variant === 'secondary') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Clean gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? `linear-gradient(135deg, rgba(59, 130, 246, ${gradientOpacity * 0.4}) 0%, transparent 70%),
                 linear-gradient(225deg, rgba(168, 85, 247, ${gradientOpacity * 0.3}) 0%, transparent 60%)`
              : `linear-gradient(135deg, rgba(59, 130, 246, ${gradientOpacity * 0.3}) 0%, transparent 70%),
                 linear-gradient(225deg, rgba(168, 85, 247, ${gradientOpacity * 0.2}) 0%, transparent 60%)`
          }}
        />

        {/* Minimal dot pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(148, 163, 184, ${baseOpacity * 0.6}), transparent 0)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 100% 80% at center, black 20%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at center, black 20%, transparent 85%)'
          }}
        />

        {/* Single floating accent */}
        <div className="absolute top-1/3 right-1/3">
          <div
            className="w-64 h-64 rounded-full blur-3xl opacity-40"
            style={{
              background: `radial-gradient(circle, ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)'}, transparent 70%)`,
              animation: 'subtle-float 35s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    );
  }

  // Creative variant - Bold and dynamic
  if (variant === 'creative') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Complex gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? `conic-gradient(from 0deg at 30% 30%, rgba(79, 70, 229, ${gradientOpacity}), rgba(236, 72, 153, ${gradientOpacity * 0.8}), rgba(245, 158, 11, ${gradientOpacity * 0.6}), rgba(16, 185, 129, ${gradientOpacity * 0.9}), rgba(59, 130, 246, ${gradientOpacity * 0.7})),
                 radial-gradient(ellipse 60% 80% at 70% 20%, rgba(168, 85, 247, ${gradientOpacity * 0.5}), transparent 70%)`
              : `conic-gradient(from 0deg at 30% 30%, rgba(79, 70, 229, ${gradientOpacity * 0.6}), rgba(236, 72, 153, ${gradientOpacity * 0.5}), rgba(245, 158, 11, ${gradientOpacity * 0.4}), rgba(16, 185, 129, ${gradientOpacity * 0.6}), rgba(59, 130, 246, ${gradientOpacity * 0.5})),
                 radial-gradient(ellipse 60% 80% at 70% 20%, rgba(168, 85, 247, ${gradientOpacity * 0.3}), transparent 70%)`
          }}
        />

        {/* Multiple animated elements */}
        <div className="absolute top-20 left-20">
          <div
            className="w-72 h-72 rounded-full blur-3xl opacity-50"
            style={{
              background: `conic-gradient(from 180deg,
                ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)'},
                ${isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)'})`,
              animation: 'gradient-float 20s ease-in-out infinite'
            }}
          />
        </div>

        <div className="absolute bottom-20 right-20">
          <div
            className="w-80 h-80 rounded-full blur-3xl opacity-45"
            style={{
              background: `conic-gradient(from 270deg,
                ${isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.10)'},
                ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)'})`,
              animation: 'gradient-float-slow 28s ease-in-out infinite'
            }}
          />
        </div>

        {/* Complex pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(148, 163, 184, ${baseOpacity}), transparent 0),
              linear-gradient(45deg, rgba(59, 130, 246, ${accentOpacity * 0.3}) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(168, 85, 247, ${accentOpacity * 0.2}) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 80px 80px, 80px 80px',
            maskImage: 'radial-gradient(ellipse 85% 75% at center, black 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at center, black 30%, transparent 90%)',
            animation: 'gradient-float-delayed 22s ease-in-out infinite'
          }}
        />

        {/* Dynamic noise texture */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M10 10h2v2h-2zM20 20h2v2h-2zM30 10h2v2h-2zM40 30h2v2h-2zM50 50h2v2h-2zM60 20h2v2h-2zM70 40h2v2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }

  return null;
}