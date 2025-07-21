// src/hooks/use-view-tracking.ts
"use client";

import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseViewTrackingOptions {
  enabled?: boolean;
  delay?: number; // Delay before tracking view (in ms)
  threshold?: number; // Minimum time on page to count as view (in ms)
  debounceMs?: number; // Debounce multiple calls
}

interface ViewTrackingState {
  isTracked: boolean;
  isTracking: boolean;
  error: string | null;
  timeSpent: number;
}

export function useViewTracking(
  type: "post" | "project",
  id: number | string | null | undefined,
  options: UseViewTrackingOptions = {}
) {
  const {
    enabled = true,
    delay = 2000, // 2 second delay
    threshold = 3000, // 3 seconds minimum
    debounceMs = 500,
  } = options;

  const [state, setState] = useState<ViewTrackingState>({
    isTracked: false,
    isTracking: false,
    error: null,
    timeSpent: 0,
  });

  const tracked = useRef(false);
  const startTime = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const debounceRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Convert id to number for consistency
  const numericId = id ? Number(id) : null;

  // Session key for preventing duplicate tracking
  const getSessionKey = useCallback(() => {
    if (!numericId) return null;
    return `view_tracked_${type}_${numericId}_${new Date().toDateString()}`;
  }, [type, numericId]);

  // Check if already tracked today
  const isAlreadyTracked = useCallback(() => {
    try {
      const sessionKey = getSessionKey();
      if (!sessionKey) return false;
      return sessionStorage.getItem(sessionKey) === "true";
    } catch (error) {
      return false;
    }
  }, [getSessionKey]);

  // Mark as tracked in session
  const markAsTracked = useCallback(() => {
    try {
      const sessionKey = getSessionKey();
      if (sessionKey) {
        sessionStorage.setItem(sessionKey, "true");
      }
    } catch (error) {
      console.warn("Could not save to sessionStorage:", error);
    }
  }, [getSessionKey]);

  // Track view in database - improved reliability
  const trackView = useCallback(async () => {
    if (
      !mountedRef.current ||
      tracked.current ||
      !enabled ||
      !numericId ||
      isAlreadyTracked()
    ) {
      return;
    }

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the tracking call
    debounceRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        setState((prev) => ({ ...prev, isTracking: true, error: null }));
        tracked.current = true;

        let result;
        if (type === "post") {
          result = await supabase.rpc("increment_post_view", {
            post_id_param: numericId,
          });
        } else if (type === "project") {
          result = await supabase.rpc("increment_project_view", {
            project_id_param: numericId,
          });
        }

        if (!mountedRef.current) return;

        if (result?.error) {
          console.error(`❌ Error tracking ${type} view:`, result.error);
          tracked.current = false; // Reset on error to allow retry
          setState((prev) => ({
            ...prev,
            isTracking: false,
            error: result.error.message || "Failed to track view",
          }));
        } else {
          markAsTracked();
          setState((prev) => ({
            ...prev,
            isTracked: true,
            isTracking: false,
            error: null,
          }));
          console.log(`✅ ${type} view tracked for ID: ${numericId}`);
        }
      } catch (error) {
        if (!mountedRef.current) return;

        console.error(`❌ Error tracking ${type} view:`, error);
        tracked.current = false; // Reset on error to allow retry
        setState((prev) => ({
          ...prev,
          isTracking: false,
          error:
            error instanceof Error ? error.message : "Failed to track view",
        }));
      }
    }, debounceMs);
  }, [type, numericId, enabled, debounceMs, isAlreadyTracked, markAsTracked]);

  // Reset tracking when ID changes
  useEffect(() => {
    if (numericId) {
      tracked.current = false;
      startTime.current = Date.now();
      setState((prev) => ({
        ...prev,
        isTracked: isAlreadyTracked(),
        timeSpent: 0,
        error: null,
      }));
    }
  }, [numericId, isAlreadyTracked]);

  // Time tracking
  useEffect(() => {
    if (!enabled || !numericId) return;

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      const timeSpent = Date.now() - startTime.current;
      setState((prev) => ({ ...prev, timeSpent }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, numericId]);

  // Main tracking effect - simplified and more reliable
  useEffect(() => {
    if (!enabled || !numericId || isAlreadyTracked()) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up delayed tracking with threshold check
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      const timeSpent = Date.now() - startTime.current;
      if (timeSpent >= threshold) {
        trackView();
      }
    }, Math.max(delay, threshold));

    // Track on visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (!mountedRef.current) return;

      if (document.visibilityState === "hidden") {
        const timeSpent = Date.now() - startTime.current;
        if (timeSpent >= threshold && !tracked.current) {
          trackView();
        }
      }
    };

    // Track on page unload
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current;
      if (timeSpent >= threshold && !tracked.current) {
        // Use beacon for reliable tracking on page unload
        try {
          if (navigator.sendBeacon) {
            const data = JSON.stringify({
              type,
              id: numericId,
              timeSpent,
            });
            navigator.sendBeacon("/api/track-view", data);
          }
        } catch (error) {
          console.warn("Failed to send beacon:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, numericId, delay, threshold, trackView, isAlreadyTracked]);

  // Manual trigger for view tracking
  const triggerView = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    trackView();
  }, [trackView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    triggerView,
    ...state,
    timeSpent: Math.floor(state.timeSpent / 1000), // Return in seconds
  };
}
