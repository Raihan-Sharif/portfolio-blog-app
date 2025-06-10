// src/components/view-tracker.tsx
"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";
import { useEffect } from "react";

interface ViewTrackerProps {
  type: "post" | "project";
  id: number | string | null | undefined;
  enabled?: boolean;
  delay?: number;
  threshold?: number;
  debug?: boolean;
  onTrackingStart?: () => void;
  onTrackingComplete?: () => void;
  onTrackingError?: (error: string) => void;
}

/**
 * Client component for view tracking that can be used in server components
 * Handles view tracking with advanced features like debouncing, session management, and error handling
 */
export function ViewTracker({
  type,
  id,
  enabled = true,
  delay = 2000,
  threshold = 5000,
  debug = false,
  onTrackingStart,
  onTrackingComplete,
  onTrackingError,
}: ViewTrackerProps) {
  const { triggerView, isTracked, isTracking, error, timeSpent } =
    useViewTracking(type, id, {
      enabled: enabled && !!id,
      delay,
      threshold,
    });

  // Handle tracking state changes
  useEffect(() => {
    if (isTracking && onTrackingStart) {
      onTrackingStart();
    }
  }, [isTracking, onTrackingStart]);

  useEffect(() => {
    if (isTracked && onTrackingComplete) {
      onTrackingComplete();
    }
  }, [isTracked, onTrackingComplete]);

  useEffect(() => {
    if (error && onTrackingError) {
      onTrackingError(error);
    }
  }, [error, onTrackingError]);

  // Debug logging
  useEffect(() => {
    if (debug && id) {
      console.log(`📊 ViewTracker Debug - ${type}:${id}`, {
        isTracked,
        isTracking,
        timeSpent,
        error,
      });
    }
  }, [debug, type, id, isTracked, isTracking, timeSpent, error]);

  // This component renders nothing - it only handles view tracking
  return null;
}

// Enhanced ViewTracker with visual feedback (optional)
interface ViewTrackerWithFeedbackProps extends ViewTrackerProps {
  showFeedback?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function ViewTrackerWithFeedback({
  showFeedback = false,
  position = "bottom-right",
  ...props
}: ViewTrackerWithFeedbackProps) {
  const { isTracked, isTracking, timeSpent, error } = useViewTracking(
    props.type,
    props.id,
    {
      enabled: props.enabled && !!props.id,
      delay: props.delay,
      threshold: props.threshold,
    }
  );

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  if (!showFeedback || !props.id) {
    return <ViewTracker {...props} />;
  }

  return (
    <>
      <ViewTracker {...props} />

      {/* Visual feedback for development/debug */}
      {(isTracking || isTracked || error) && (
        <div
          className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg">
            {isTracking && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Tracking view...</span>
              </div>
            )}

            {isTracked && !isTracking && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>View tracked ({timeSpent}s)</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Tracking failed</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Hooks for advanced usage
export { useViewTracking } from "@/hooks/use-view-tracking";

// Higher-order component for automatic view tracking
interface WithViewTrackingProps {
  type: "post" | "project";
  id: number | string | null | undefined;
  trackingOptions?: {
    enabled?: boolean;
    delay?: number;
    threshold?: number;
  };
}

export function withViewTracking<P extends object>(
  Component: React.ComponentType<P>,
  trackingConfig: WithViewTrackingProps
) {
  return function WrappedComponent(props: P) {
    return (
      <>
        <ViewTracker
          type={trackingConfig.type}
          id={trackingConfig.id}
          {...trackingConfig.trackingOptions}
        />
        <Component {...props} />
      </>
    );
  };
}
