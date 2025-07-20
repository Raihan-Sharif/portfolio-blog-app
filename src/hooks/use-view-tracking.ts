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
    delay = 1000, // 1 second delay
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

  // Convert id to number for consistency
  const numericId = id ? Number(id) : null;

  // Session key for preventing duplicate tracking
  const getSessionKey = useCallback(() => {
    if (!numericId) return null;
    return `view_tracked_${type}_${numericId}_${new Date().toDateString()}`;
  }, [type, numericId]);

  // Check if already tracked today
  const isAlreadyTracked = useCallback(() => {
    const sessionKey = getSessionKey();
    if (!sessionKey) return false;
    return sessionStorage.getItem(sessionKey) === "true";
  }, [getSessionKey]);

  // Mark as tracked in session
  const markAsTracked = useCallback(() => {
    const sessionKey = getSessionKey();
    if (sessionKey) {
      sessionStorage.setItem(sessionKey, "true");
    }
  }, [getSessionKey]);

  // Track view in database
  // Track view in database - optimized for performance
  const trackView = useCallback(async () => {
    if (tracked.current || !enabled || !numericId || isAlreadyTracked()) {
      return;
    }

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the tracking call
    debounceRef.current = setTimeout(async () => {
      try {
        setState((prev) => ({ ...prev, isTracking: true, error: null }));
        tracked.current = true;

        // Fire-and-forget tracking - don't await or block on this
        const trackingPromise = (async () => {
          if (type === "post") {
            return supabase.rpc("increment_post_view", {
              post_id_param: numericId,
            });
          } else if (type === "project") {
            return supabase.rpc("increment_project_view", {
              project_id_param: numericId,
            });
          }
        })();

        // Handle the response asynchronously without blocking
        trackingPromise.then(
          (result) => {
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
          },
          (error) => {
            console.error(`❌ Error tracking ${type} view:`, error);
            tracked.current = false; // Reset on error to allow retry
            setState((prev) => ({
              ...prev,
              isTracking: false,
              error:
                error instanceof Error ? error.message : "Failed to track view",
            }));
          }
        );

        // Immediately mark as tracking started (optimistic)
        setState((prev) => ({
          ...prev,
          isTracking: false, // Don't show loading state for tracking
          error: null,
        }));
      } catch (error) {
        console.error(`❌ Error setting up ${type} view tracking:`, error);
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
      const timeSpent = Date.now() - startTime.current;
      setState((prev) => ({ ...prev, timeSpent }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, numericId]);

  // Main tracking effect
  useEffect(() => {
    if (!enabled || !numericId || isAlreadyTracked()) return;

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

    // Track on scroll (user engagement)
    const handleScroll = () => {
      const timeSpent = Date.now() - startTime.current;
      if (timeSpent >= threshold && !tracked.current) {
        trackView();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
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
