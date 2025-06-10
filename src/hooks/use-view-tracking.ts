"use client";

import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef } from "react";

interface UseViewTrackingOptions {
  enabled?: boolean;
  delay?: number; // Delay before tracking view (in ms)
  threshold?: number; // Minimum time on page to count as view (in ms)
}

export function useViewTracking(
  type: "post" | "project",
  id: number | string | null | undefined,
  options: UseViewTrackingOptions = {}
) {
  const {
    enabled = true,
    delay = 1000, // 1 second delay
    threshold = 3000, // 3 seconds minimum
  } = options;

  const tracked = useRef(false);
  const startTime = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const trackView = useCallback(async () => {
    // Don't track if already tracked, not enabled, or no ID
    if (tracked.current || !enabled || !id) return;

    try {
      tracked.current = true;

      if (type === "post") {
        // Increment post view using the database function
        await supabase.rpc("increment_post_view", {
          post_id_param: Number(id),
        });
      } else if (type === "project") {
        // Increment project view using the database function
        await supabase.rpc("increment_project_view", {
          project_id_param: Number(id),
        });
      }

      console.log(`${type} view tracked for ID: ${id}`);
    } catch (error) {
      console.error(`Error tracking ${type} view:`, error);
      tracked.current = false; // Reset on error to allow retry
    }
  }, [type, id, enabled]);

  useEffect(() => {
    // Reset tracking when ID changes
    if (id) {
      tracked.current = false;
      startTime.current = Date.now();
    }
  }, [id]);

  useEffect(() => {
    if (!enabled || !id) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up delayed tracking
    timeoutRef.current = setTimeout(() => {
      trackView();
    }, delay);

    // Track when user leaves the page if they've been here long enough
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current;
      if (timeSpent >= threshold && !tracked.current) {
        // Use sendBeacon for reliable tracking on page unload
        trackView();
      }
    };

    // Track when user switches tabs or loses focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeSpent = Date.now() - startTime.current;
        if (timeSpent >= threshold && !tracked.current) {
          trackView();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, id, delay, threshold, trackView]);

  // Manual trigger for view tracking
  const triggerView = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    trackView();
  }, [trackView]);

  return { triggerView, isTracked: tracked.current };
}
