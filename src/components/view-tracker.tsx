// src/components/view-tracker.tsx
"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";
import { useEffect, useRef, useState } from "react";

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
  debug = false, // Disabled by default for production
}: ViewTrackerProps) {
  const [mounted, setMounted] = useState(false);
  const debugMountedRef = useRef(false);

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const { triggerView, isTracked, isTracking, error, timeSpent } =
    useViewTracking(type, id, {
      enabled: enabled && !!id && mounted,
      delay,
    });

  // Enhanced debug logging with Firefox-specific information
  useEffect(() => {
    if (!debug || !id || !mounted) return;

    const debugInfo = {
      isTracked,
      isTracking,
      timeSpent,
      error,
      enabled: enabled && !!id,
      delay,
      browser:
        typeof navigator !== "undefined"
          ? navigator.userAgent.includes("Firefox")
            ? "Firefox"
            : "Other"
          : "Unknown",
      storageAvailable: (() => {
        try {
          sessionStorage.setItem("__test__", "test");
          sessionStorage.removeItem("__test__");
          return true;
        } catch {
          return false;
        }
      })(),
    };

    console.log(`🔍 ViewTracker Debug - ${type}:${id}`, debugInfo);
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
    mounted,
  ]);

  // Mount/unmount logging for debugging
  useEffect(() => {
    if (debug && id && mounted && !debugMountedRef.current) {
      console.log(`🎬 ViewTracker mounted for ${type}:${id}`);
      debugMountedRef.current = true;
    }

    return () => {
      if (debug && id && debugMountedRef.current) {
        console.log(`🎬 ViewTracker unmounting for ${type}:${id}`);
        debugMountedRef.current = false;
      }
    };
  }, [debug, type, id, mounted]);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  // Show debug UI only in development mode and when explicitly enabled
  if (debug && process.env.NODE_ENV === "development" && id) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white text-xs p-4 rounded-lg max-w-sm border border-gray-600">
        <div className="font-bold text-green-400 mb-2">
          ViewTracker: {type}:{id}
        </div>

        <div className="space-y-1">
          <div>⏱️ Time: {timeSpent}s</div>
          <div>⏰ Delay: {delay}ms</div>
          <div>
            📊 Status:{" "}
            <span
              className={
                isTracking
                  ? "text-yellow-400"
                  : isTracked
                  ? "text-green-400"
                  : "text-gray-400"
              }
            >
              {isTracking
                ? "🟡 Tracking..."
                : isTracked
                ? "✅ Tracked"
                : "⏳ Waiting"}
            </span>
          </div>

          <div>
            🌐 Browser:{" "}
            {typeof navigator !== "undefined"
              ? navigator.userAgent.includes("Firefox")
                ? "🦊 Firefox"
                : "🌐 Other"
              : "❓ Unknown"}
          </div>

          <div>
            💾 Storage:{" "}
            {(() => {
              try {
                sessionStorage.setItem("__test__", "test");
                sessionStorage.removeItem("__test__");
                return "✅ Available";
              } catch {
                return "❌ Unavailable";
              }
            })()}
          </div>

          {error && <div className="text-red-400 mt-2">❌ Error: {error}</div>}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={triggerView}
            className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
          >
            🚀 Force Track
          </button>

          <button
            onClick={() => {
              // Clear session storage for this item
              try {
                const key = `view_tracked_${type}_${id}`;
                sessionStorage.removeItem(key);
                console.log(`🗑️ Cleared tracking for ${type}:${id}`);
                window.location.reload();
              } catch (error) {
                console.error("Failed to clear tracking:", error);
              }
            }}
            className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
          >
            🗑️ Reset
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export { useViewTracking } from "@/hooks/use-view-tracking";
