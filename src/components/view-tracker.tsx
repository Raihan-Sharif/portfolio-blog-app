// src/components/view-tracker.tsx
"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";
import { useEffect } from "react";

interface ViewTrackerProps {
  type: "post" | "project";
  id: number | string | null | undefined;
  enabled?: boolean;
  delay?: number;
  debug?: boolean;
}

export function ViewTracker({
  type,
  id,
  enabled = true,
  delay = 3000, // 3 seconds
  debug = true, // Enable debug by default for now
}: ViewTrackerProps) {
  const { triggerView, isTracked, isTracking, error, timeSpent } =
    useViewTracking(type, id, {
      enabled: enabled && !!id,
      delay,
    });

  // Debug logging
  useEffect(() => {
    if (debug && id) {
      console.log(`🔍 ViewTracker Debug - ${type}:${id}`, {
        isTracked,
        isTracking,
        timeSpent,
        error,
        enabled: enabled && !!id,
        delay,
      });
    }
  }, [
    debug,
    type,
    id,
    isTracked,
    isTracking,
    timeSpent,
    error,
    enabled,
    delay,
  ]);

  // Show debug info in development
  if (debug && process.env.NODE_ENV === "development" && id) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs">
        <div className="font-bold">
          ViewTracker: {type}:{id}
        </div>
        <div>Time: {timeSpent}s</div>
        <div>Delay: {delay}ms</div>
        <div>
          Status:{" "}
          {isTracking
            ? "🟡 Tracking..."
            : isTracked
            ? "✅ Tracked"
            : "⏳ Waiting"}
        </div>
        {error && <div className="text-red-400">Error: {error}</div>}
        <button
          onClick={triggerView}
          className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Force Track Now
        </button>
      </div>
    );
  }

  return null;
}

export { useViewTracking } from "@/hooks/use-view-tracking";
