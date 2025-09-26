"use client";

import React from "react";

interface DotPatternBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const DotPatternBackground = React.forwardRef<HTMLDivElement, DotPatternBackgroundProps>(
  ({ children, className = "" }, ref) => {
  return (
    <div ref={ref} className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/50 ${className}`}>
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.300)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.700)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/6 w-80 h-80 bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-t from-cyan-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

DotPatternBackground.displayName = "DotPatternBackground";

export default DotPatternBackground;