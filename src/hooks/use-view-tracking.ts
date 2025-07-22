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

// Enhanced storage manager for Firefox compatibility
class ViewTrackingStorage {
  private static instance: ViewTrackingStorage;
  private memoryStore = new Map<string, boolean>();
  private storageAvailable: boolean = false;

  private constructor() {
    // Test storage availability on initialization
    this.storageAvailable = this.testStorageAvailability();
  }

  static getInstance(): ViewTrackingStorage {
    if (!ViewTrackingStorage.instance) {
      ViewTrackingStorage.instance = new ViewTrackingStorage();
    }
    return ViewTrackingStorage.instance;
  }

  private testStorageAvailability(): boolean {
    try {
      const testKey = "__storage_test__";
      sessionStorage.setItem(testKey, "test");
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return retrieved === "test";
    } catch {
      return false;
    }
  }

  setItem(key: string, value: boolean): void {
    // Always store in memory for immediate access
    this.memoryStore.set(key, value);

    // Try to store in sessionStorage if available
    if (this.storageAvailable) {
      try {
        sessionStorage.setItem(key, value.toString());
      } catch (error) {
        console.warn("SessionStorage failed, using memory only:", error);
        this.storageAvailable = false;
      }
    }
  }

  getItem(key: string): boolean {
    // Check memory first for speed
    if (this.memoryStore.has(key)) {
      return this.memoryStore.get(key)!;
    }

    // Fallback to sessionStorage if available
    if (this.storageAvailable) {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored !== null) {
          const value = stored === "true";
          this.memoryStore.set(key, value); // Cache in memory
          return value;
        }
      } catch (error) {
        console.warn("SessionStorage read failed:", error);
        this.storageAvailable = false;
      }
    }

    return false;
  }

  hasItem(key: string): boolean {
    return (
      this.memoryStore.has(key) ||
      (this.storageAvailable && sessionStorage.getItem(key) !== null)
    );
  }

  removeItem(key: string): void {
    this.memoryStore.delete(key);
    if (this.storageAvailable) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn("SessionStorage remove failed:", error);
      }
    }
  }

  clear(): void {
    this.memoryStore.clear();
    if (this.storageAvailable) {
      try {
        // Only clear our tracking keys
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("view_tracked_")) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn("SessionStorage clear failed:", error);
      }
    }
  }
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

  // Use refs to prevent race conditions
  const trackingRef = useRef({
    hasTracked: false,
    isCurrentlyTracking: false,
    startTime: Date.now(),
    timeoutId: null as NodeJS.Timeout | null,
    intervalId: null as NodeJS.Timeout | null,
    numericId: null as number | null,
  });

  const storageManager = ViewTrackingStorage.getInstance();

  // Convert id to number for consistency
  const numericId = id
    ? typeof id === "string"
      ? parseInt(id, 10)
      : Number(id)
    : null;

  // Stable session key generation
  const getSessionKey = useCallback(() => {
    if (!numericId) return null;
    return `view_tracked_${type}_${numericId}`;
  }, [type, numericId]);

  // Check if already tracked with fallback strategies
  const isAlreadyTracked = useCallback(() => {
    const sessionKey = getSessionKey();
    if (!sessionKey) return false;
    return storageManager.getItem(sessionKey);
  }, [getSessionKey, storageManager]);

  // Mark as tracked with enhanced reliability
  const markAsTracked = useCallback(() => {
    const sessionKey = getSessionKey();
    if (sessionKey) {
      storageManager.setItem(sessionKey, true);
    }
  }, [getSessionKey, storageManager]);

  // Enhanced database tracking with proper state management
  const trackView = useCallback(async () => {
    const sessionKey = getSessionKey();

    // Prevent duplicate tracking with multiple checks
    if (
      trackingRef.current.hasTracked ||
      trackingRef.current.isCurrentlyTracking ||
      !enabled ||
      !numericId ||
      (sessionKey && storageManager.getItem(sessionKey))
    ) {
      console.log("❌ Tracking prevented:", {
        hasTracked: trackingRef.current.hasTracked,
        isCurrentlyTracking: trackingRef.current.isCurrentlyTracking,
        enabled,
        numericId,
        alreadyStored: sessionKey ? storageManager.getItem(sessionKey) : false,
      });
      return;
    }

    console.log(`🎯 Starting to track ${type} view for ID: ${numericId}`);

    try {
      // Set tracking flags immediately
      trackingRef.current.isCurrentlyTracking = true;
      trackingRef.current.hasTracked = true;

      // Update state to show tracking in progress
      setState((prev) => ({
        ...prev,
        isTracking: true,
        error: null,
      }));

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

        // Reset tracking flags on error
        trackingRef.current.hasTracked = false;
        trackingRef.current.isCurrentlyTracking = false;

        setState((prev) => ({
          ...prev,
          isTracking: false,
          error: result.error.message || "Failed to track view",
        }));
      } else {
        console.log(
          `✅ Successfully tracked ${type} view for ID: ${numericId}`
        );

        // Mark as successfully tracked
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

      // Reset tracking flags on exception
      trackingRef.current.hasTracked = false;
      trackingRef.current.isCurrentlyTracking = false;

      setState((prev) => ({
        ...prev,
        isTracking: false,
        error: error instanceof Error ? error.message : "Failed to track view",
      }));
    } finally {
      // Always clear the currently tracking flag
      trackingRef.current.isCurrentlyTracking = false;
    }
  }, [type, numericId, enabled, markAsTracked, getSessionKey, storageManager]);

  // Reset tracking when ID changes (with proper cleanup)
  useEffect(() => {
    if (numericId !== trackingRef.current.numericId) {
      console.log(`🔄 Resetting tracking for ${type}:${numericId}`);

      // Clear any existing timers
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
        trackingRef.current.timeoutId = null;
      }

      // Reset tracking state
      trackingRef.current.hasTracked = false;
      trackingRef.current.isCurrentlyTracking = false;
      trackingRef.current.startTime = Date.now();
      trackingRef.current.numericId = numericId;

      // Update component state
      const alreadyTracked = isAlreadyTracked();
      setState((prev) => ({
        ...prev,
        isTracked: alreadyTracked,
        isTracking: false,
        timeSpent: 0,
        error: null,
      }));
    }
  }, [numericId, type, isAlreadyTracked]);

  // Time tracking with improved interval management
  useEffect(() => {
    if (!enabled || !numericId) return;

    // Clear any existing interval
    if (trackingRef.current.intervalId) {
      clearInterval(trackingRef.current.intervalId);
    }

    trackingRef.current.intervalId = setInterval(() => {
      const timeSpent = Math.floor(
        (Date.now() - trackingRef.current.startTime) / 1000
      );
      setState((prev) => ({ ...prev, timeSpent }));
    }, 1000);

    return () => {
      if (trackingRef.current.intervalId) {
        clearInterval(trackingRef.current.intervalId);
        trackingRef.current.intervalId = null;
      }
    };
  }, [enabled, numericId]);

  // Main tracking effect with Firefox-specific improvements
  useEffect(() => {
    if (!enabled || !numericId) {
      return;
    }

    // Don't start tracking if already tracked
    if (isAlreadyTracked()) {
      console.log("❌ Tracking not started - already tracked:", {
        enabled,
        numericId,
        alreadyTracked: true,
      });
      setState((prev) => ({ ...prev, isTracked: true }));
      return;
    }

    console.log(
      `⏰ Setting up tracking timer for ${type}:${numericId} (delay: ${delay}ms)`
    );

    // Clear any existing timeout
    if (trackingRef.current.timeoutId) {
      clearTimeout(trackingRef.current.timeoutId);
    }

    // Use requestAnimationFrame for better Firefox compatibility
    const scheduleTracking = () => {
      trackingRef.current.timeoutId = setTimeout(() => {
        // Double-check conditions before tracking
        if (enabled && numericId && !isAlreadyTracked()) {
          const timeSpent = Date.now() - trackingRef.current.startTime;
          console.log(
            `⏱️ Timer fired for ${type}:${numericId}, time spent: ${timeSpent}ms`
          );
          trackView();
        }
      }, delay);
    };

    // Use requestAnimationFrame to ensure DOM is ready (Firefox compatibility)
    requestAnimationFrame(scheduleTracking);

    return () => {
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
        trackingRef.current.timeoutId = null;
      }
    };
  }, [enabled, numericId, delay, trackView, type]); // Removed isAlreadyTracked from deps to prevent race conditions

  // Manual trigger for testing
  const triggerView = useCallback(() => {
    console.log(`🔄 Manual trigger for ${type}:${numericId}`);

    // Clear timeout and force track
    if (trackingRef.current.timeoutId) {
      clearTimeout(trackingRef.current.timeoutId);
      trackingRef.current.timeoutId = null;
    }

    // Reset tracking flags to allow manual trigger
    trackingRef.current.hasTracked = false;
    trackingRef.current.isCurrentlyTracking = false;

    trackView();
  }, [trackView, type, numericId]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
      }
      if (trackingRef.current.intervalId) {
        clearInterval(trackingRef.current.intervalId);
      }

      // Reset tracking state
      trackingRef.current.hasTracked = false;
      trackingRef.current.isCurrentlyTracking = false;
    };
  }, []);

  return {
    triggerView,
    ...state,
  };
}
