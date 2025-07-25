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

// Global tracking cache to prevent double increments across components
const globalTrackingCache = new Map<string, boolean>();

// Simplified storage manager with global cache integration
class ViewStorage {
  private static instance: ViewStorage;
  private memoryCache = new Map<string, boolean>();
  private storageEnabled = false;

  private constructor() {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const testKey = "__vt_test";
        sessionStorage.setItem(testKey, "1");
        sessionStorage.removeItem(testKey);
        this.storageEnabled = true;
      }
    } catch {
      this.storageEnabled = false;
    }
  }

  static getInstance(): ViewStorage {
    if (!ViewStorage.instance) {
      ViewStorage.instance = new ViewStorage();
    }
    return ViewStorage.instance;
  }

  set(key: string, value: boolean): void {
    // Update all caches
    this.memoryCache.set(key, value);
    globalTrackingCache.set(key, value);

    if (this.storageEnabled) {
      try {
        sessionStorage.setItem(key, value ? "1" : "0");
      } catch {
        // Silent fail
      }
    }
  }

  get(key: string): boolean {
    // Check global cache first (most reliable for preventing duplicates)
    if (globalTrackingCache.has(key)) {
      return globalTrackingCache.get(key)!;
    }

    // Check memory cache
    if (this.memoryCache.has(key)) {
      const value = this.memoryCache.get(key)!;
      globalTrackingCache.set(key, value);
      return value;
    }

    // Check session storage
    if (this.storageEnabled) {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored !== null) {
          const value = stored === "1";
          this.memoryCache.set(key, value);
          globalTrackingCache.set(key, value);
          return value;
        }
      } catch {
        // Silent fail
      }
    }

    return false;
  }
}

export function useViewTracking(
  type: "post" | "project",
  id: number | string | null | undefined,
  options: UseViewTrackingOptions = {}
) {
  const { enabled = true, delay = 3000 } = options;

  const [state, setState] = useState<ViewTrackingState>({
    isTracked: false,
    isTracking: false,
    error: null,
    timeSpent: 0,
  });

  // Single ref for all tracking state
  const trackingRef = useRef({
    hasExecuted: false,
    isExecuting: false,
    timeoutId: null as NodeJS.Timeout | null,
    intervalId: null as NodeJS.Timeout | null,
    startTime: Date.now(),
    currentId: null as number | null,
  });

  const storage = ViewStorage.getInstance();

  // Convert ID to number safely
  const numericId = (() => {
    if (!id) return null;
    const parsed = typeof id === "string" ? parseInt(id, 10) : Number(id);
    return isNaN(parsed) ? null : parsed;
  })();

  // Generate unique tracking key
  const trackingKey = numericId ? `vt_${type}_${numericId}` : null;

  // Check if already tracked (multiple levels of protection)
  const isAlreadyTracked = useCallback(() => {
    if (!trackingKey) return false;
    return storage.get(trackingKey);
  }, [trackingKey, storage]);

  // Core tracking function with bulletproof duplicate prevention
  const executeTracking = useCallback(async () => {
    if (!numericId || !enabled || !trackingKey) return;

    // Multi-level duplicate prevention
    if (
      trackingRef.current.hasExecuted ||
      trackingRef.current.isExecuting ||
      globalTrackingCache.get(trackingKey) ||
      storage.get(trackingKey)
    ) {
      setState((prev) => ({ ...prev, isTracked: true }));
      return;
    }

    // Lock execution immediately
    trackingRef.current.isExecuting = true;
    trackingRef.current.hasExecuted = true;
    globalTrackingCache.set(trackingKey, true);

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    try {
      let result;

      // Use the correct function names that exist in your database
      if (type === "post") {
        result = await supabase.rpc("increment_post_view", {
          post_id_param: numericId,
        });
      } else if (type === "project") {
        result = await supabase.rpc("increment_project_view", {
          project_id_param: numericId,
        });
      }

      if (result?.error) {
        throw new Error(result.error.message);
      }

      // Mark as successfully tracked in all caches
      storage.set(trackingKey, true);

      setState((prev) => ({
        ...prev,
        isTracked: true,
        isTracking: false,
        error: null,
      }));
    } catch (error) {
      // On error, reset flags to allow retry
      trackingRef.current.hasExecuted = false;
      trackingRef.current.isExecuting = false;
      globalTrackingCache.delete(trackingKey);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to track view";
      setState((prev) => ({
        ...prev,
        isTracking: false,
        error: errorMessage,
      }));
    } finally {
      trackingRef.current.isExecuting = false;
    }
  }, [numericId, enabled, type, trackingKey, storage]);

  // Manual trigger for testing (clears all caches first)
  const triggerView = useCallback(() => {
    if (!trackingKey) return;

    // Clear timeout
    if (trackingRef.current.timeoutId) {
      clearTimeout(trackingRef.current.timeoutId);
      trackingRef.current.timeoutId = null;
    }

    // Reset all tracking flags and caches
    trackingRef.current.hasExecuted = false;
    trackingRef.current.isExecuting = false;
    globalTrackingCache.delete(trackingKey);
    storage.set(trackingKey, false);

    // Execute immediately
    executeTracking();
  }, [executeTracking, trackingKey, storage]);

  // Reset when ID changes
  useEffect(() => {
    if (numericId !== trackingRef.current.currentId) {
      // Clear timers
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
        trackingRef.current.timeoutId = null;
      }

      // Reset tracking state
      trackingRef.current.hasExecuted = false;
      trackingRef.current.isExecuting = false;
      trackingRef.current.startTime = Date.now();
      trackingRef.current.currentId = numericId;

      // Check if already tracked
      const alreadyTracked = isAlreadyTracked();
      setState((prev) => ({
        ...prev,
        isTracked: alreadyTracked,
        isTracking: false,
        error: null,
        timeSpent: 0,
      }));
    }
  }, [numericId, isAlreadyTracked]);

  // Time tracking
  useEffect(() => {
    if (!enabled || !numericId) return;

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

  // Main tracking effect with React StrictMode protection
  useEffect(() => {
    if (
      !enabled ||
      !numericId ||
      trackingRef.current.hasExecuted ||
      isAlreadyTracked()
    ) {
      if (isAlreadyTracked()) {
        setState((prev) => ({ ...prev, isTracked: true }));
      }
      return;
    }

    // Clear existing timeout
    if (trackingRef.current.timeoutId) {
      clearTimeout(trackingRef.current.timeoutId);
    }

    // Schedule tracking with delay
    trackingRef.current.timeoutId = setTimeout(() => {
      // Final check before execution (prevents React StrictMode double calls)
      if (
        enabled &&
        numericId &&
        !trackingRef.current.hasExecuted &&
        !isAlreadyTracked()
      ) {
        executeTracking();
      }
    }, delay);

    return () => {
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
        trackingRef.current.timeoutId = null;
      }
    };
  }, [enabled, numericId, delay, executeTracking, isAlreadyTracked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingRef.current.timeoutId) {
        clearTimeout(trackingRef.current.timeoutId);
      }
      if (trackingRef.current.intervalId) {
        clearInterval(trackingRef.current.intervalId);
      }
    };
  }, []);

  return {
    triggerView,
    ...state,
  };
}
