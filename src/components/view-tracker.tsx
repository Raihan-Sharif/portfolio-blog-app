"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";

interface ViewTrackerProps {
  type: "post" | "project";
  id: number | string | null;
  enabled?: boolean;
}

/**
 * Standalone component for view tracking
 * Use this when you can't use the hook directly (e.g., in server components)
 */
export function ViewTracker({ type, id, enabled = true }: ViewTrackerProps) {
  const { triggerView, isTracked } = useViewTracking(type, id, {
    enabled: enabled && !!id,
    delay: 2000, // 2 seconds
    threshold: 5000, // 5 seconds minimum
  });

  return null; // This component doesn't render anything
}
