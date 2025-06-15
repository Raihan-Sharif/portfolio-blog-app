// src/hooks/use-online-tracking.ts
"use client";

import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef } from "react";

interface UseOnlineTrackingOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds
  sessionId?: string;
}

export function useOnlineTracking(
  user: any,
  options: UseOnlineTrackingOptions = {}
) {
  const {
    enabled = true,
    updateInterval = 30000, // 30 seconds
    sessionId,
  } = options;

  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(true);

  // Generate or use provided session ID
  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId;

    // Try to get from sessionStorage first
    let storedSessionId = sessionStorage.getItem("user_session_id");
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("user_session_id", storedSessionId);
    }
    return storedSessionId;
  }, [sessionId]);

  // Get user's IP address and user agent
  const getUserInfo = useCallback(async () => {
    const userAgent = navigator.userAgent;
    const pageUrl = window.location.pathname;

    // Get IP address (you might want to use a service for this)
    let ipAddress = null;
    try {
      // Optional: You can use a service like ipify.org
      // const response = await fetch('https://api.ipify.org?format=json');
      // const data = await response.json();
      // ipAddress = data.ip;
    } catch (error) {
      console.warn("Could not fetch IP address:", error);
    }

    return {
      userAgent,
      pageUrl,
      ipAddress,
    };
  }, []);

  // Update online status
  const updateOnlineStatus = useCallback(async () => {
    if (!enabled || !user) return;

    const now = Date.now();
    // Prevent too frequent updates
    if (now - lastUpdateRef.current < updateInterval / 2) {
      return;
    }

    try {
      const userInfo = await getUserInfo();
      const currentSessionId = getSessionId();

      await supabase.rpc("update_online_user", {
        p_user_id: user?.id || null,
        p_session_id: currentSessionId,
        p_ip_address: userInfo.ipAddress,
        p_user_agent: userInfo.userAgent,
        p_page_url: userInfo.pageUrl,
        p_is_authenticated: !!user?.id,
      });

      lastUpdateRef.current = now;
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  }, [enabled, user, updateInterval, getUserInfo, getSessionId]);

  // Track page visibility
  const handleVisibilityChange = useCallback(() => {
    isActiveRef.current = !document.hidden;

    if (isActiveRef.current) {
      // User came back to the page, update immediately
      updateOnlineStatus();
    }
  }, [updateOnlineStatus]);

  // Track user activity
  const handleActivity = useCallback(() => {
    if (isActiveRef.current) {
      const now = Date.now();
      // Update if enough time has passed since last update
      if (now - lastUpdateRef.current > updateInterval / 3) {
        updateOnlineStatus();
      }
    }
  }, [updateOnlineStatus, updateInterval]);

  // Set up tracking
  useEffect(() => {
    if (!enabled) return;

    // Initial update
    updateOnlineStatus();

    // Set up periodic updates
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        updateOnlineStatus();
      }
    }, updateInterval);

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const throttledActivity = throttle(handleActivity, updateInterval / 6); // Throttle activity updates

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledActivity);
      });
    };
  }, [
    enabled,
    updateInterval,
    updateOnlineStatus,
    handleVisibilityChange,
    handleActivity,
  ]);

  // Handle page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      // Note: We can't make async calls here, but we could use sendBeacon
      // if we had an endpoint that accepts beacon data
      navigator.sendBeacon &&
        navigator.sendBeacon(
          "/api/user-offline",
          JSON.stringify({
            sessionId: getSessionId(),
            userId: user?.id,
          })
        );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, user, getSessionId]);

  return {
    updateOnlineStatus,
    sessionId: getSessionId(),
  };
}

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}
