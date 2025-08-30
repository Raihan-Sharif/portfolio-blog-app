// src/components/providers/theme-provider.tsx
"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Enhanced theme hook with additional utilities
import { useTheme } from "next-themes";

export function useThemeEnhanced() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, systemTheme, resolvedTheme, themes } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Return consistent values on server and first render
  if (!mounted) {
    return {
      theme: "system",
      setTheme: (() => {}) as (theme: string) => void,
      systemTheme: undefined,
      resolvedTheme: undefined,
      themes: ["light", "dark", "system"],
      mounted: false,
    };
  }

  return {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
    themes,
    mounted,
  };
}
