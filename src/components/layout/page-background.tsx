"use client";

import { useEffect, useState } from "react";
import ModernBackgroundSystem from "./modern-background-system";

export default function PageBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR issues
  if (!mounted) {
    return null;
  }

  // Use new modern background system for all pages
  // It handles admin exclusion internally
  return <ModernBackgroundSystem variant="auto" intensity="medium" />;
}