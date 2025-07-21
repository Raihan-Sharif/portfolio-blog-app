// src/hooks/use-view-tracking.ts
"use client";

import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseViewTrackingOptions {
  enabled?: boolean;
  delay?: number;
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
    delay = 3000, // 3 seconds total delay before tracking
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
  const intervalRef = useRef<NodeJS.Timeout>();

  // Convert id to number for consistency
  const numericId = id ? Number(id) : null;

  // Simple session key for preventing duplicate tracking
  const getSessionKey = useCallback(() => {
    if (!numericId) return null;
    return `view_tracked_${type}_${numericId}`;
  }, [type, numericId]);

  // Check if already tracked in this session
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

  // Track view in database - simplified
  const trackView = useCallback(async () => {
    if (tracked.current || !enabled || !numericId) {
      console.log("❌ Tracking skipped:", {
        tracked: tracked.current,
        enabled,
        numericId,
      });
      return;
    }

    console.log(`🎯 Starting to track ${type} view for ID: ${numericId}`);

    try {
      setState((prev) => ({ ...prev, isTracking: true, error: null }));
      tracked.current = true;

      let result;
      if (type === "post") {
        console.log("📝 Calling increment_post_view...");
        result = await supabase.rpc("increment_post_view", {
          post_id_param: numericId,
        });
      } else if (type === "project") {
        console.log("🚀 Calling increment_project_view...");
        result = await supabase.rpc("increment_project_view", {
          project_id_param: numericId,
        });
      }

      console.log("📊 RPC Result:", result);

      if (result?.error) {
        console.error(`❌ RPC Error for ${type}:`, result.error);
        tracked.current = false;
        setState((prev) => ({
          ...prev,
          isTracking: false,
          error: result.error.message || "Failed to track view",
        }));
      } else {
        console.log(
          `✅ Successfully tracked ${type} view for ID: ${numericId}`
        );
        markAsTracked();
        setState((prev) => ({
          ...prev,
          isTracked: true,
          isTracking: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error(`❌ Exception tracking ${type} view:`, error);
      tracked.current = false;
      setState((prev) => ({
        ...prev,
        isTracking: false,
        error: error instanceof Error ? error.message : "Failed to track view",
      }));
    }
  }, [type, numericId, enabled, markAsTracked]);

  // Reset when ID changes
  useEffect(() => {
    if (numericId) {
      console.log(`🔄 Resetting tracking for ${type}:${numericId}`);
      tracked.current = false;
      startTime.current = Date.now();
      setState((prev) => ({
        ...prev,
        isTracked: isAlreadyTracked(),
        isTracking: false,
        timeSpent: 0,
        error: null,
      }));
    }
  }, [numericId, type, isAlreadyTracked]);

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

  // Main tracking effect - FIXED: Use delay as the actual wait time
  useEffect(() => {
    if (!enabled || !numericId || isAlreadyTracked()) {
      console.log("❌ Tracking not started:", {
        enabled,
        numericId,
        alreadyTracked: isAlreadyTracked(),
      });
      return;
    }

    console.log(
      `⏰ Setting up tracking timer for ${type}:${numericId} (delay: ${delay}ms)`
    );

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start tracking after delay - FIXED: Just wait for delay, no threshold check
    timeoutRef.current = setTimeout(() => {
      const timeSpent = Date.now() - startTime.current;
      console.log(
        `⏱️ Timer fired for ${type}:${numericId}, time spent: ${timeSpent}ms`
      );

      // Always track when timer fires (no additional threshold check)
      trackView();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, numericId, delay, trackView, isAlreadyTracked, type]);

  // Manual trigger
  const triggerView = useCallback(() => {
    console.log(`🔄 Manual trigger for ${type}:${numericId}`);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    trackView();
  }, [trackView, type, numericId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    triggerView,
    ...state,
    timeSpent: Math.floor(state.timeSpent / 1000), // Return in seconds
  };
}
