// src/components/providers/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Enhanced theme hook with additional utilities
export function useThemeEnhanced() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: "system",
      setTheme: () => {},
      systemTheme: undefined,
      resolvedTheme: undefined,
      themes: ["light", "dark", "system"],
      mounted: false,
    };
  }

  // Import next-themes hook only on client side
  const { theme, setTheme, systemTheme, resolvedTheme, themes } =
    require("next-themes").useTheme();

  return {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
    themes,
    mounted,
  };
}
