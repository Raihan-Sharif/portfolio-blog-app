"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

export default function ViewTracker({ postId }: { postId: number }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Prevent multiple tracking in the same component instance
    if (hasTracked.current) return;

    const trackView = async () => {
      try {
        // Create a unique key for this post and session
        const sessionKey = `post-view-${postId}`;
        const viewTimestamp = sessionStorage.getItem(sessionKey);
        const currentTime = Date.now();

        // Only count as a new view if first time or more than 30 minutes since last view
        if (
          !viewTimestamp ||
          currentTime - parseInt(viewTimestamp) > 30 * 60 * 1000
        ) {
          // Update session storage first to prevent duplicate calls
          sessionStorage.setItem(sessionKey, currentTime.toString());
          hasTracked.current = true;

          // Add a small delay to ensure the page is fully loaded
          setTimeout(async () => {
            try {
              // Call the increment function
              const { error } = await supabase.rpc("increment_post_view", {
                post_id_param: postId,
              });

              if (error) {
                console.error("Error tracking view:", error);
                // Reset session storage if there was an error
                sessionStorage.removeItem(sessionKey);
                hasTracked.current = false;
              }
            } catch (error) {
              console.error("Error in view tracking:", error);
              sessionStorage.removeItem(sessionKey);
              hasTracked.current = false;
            }
          }, 1000);
        } else {
          hasTracked.current = true;
        }
      } catch (error) {
        console.error("Error in view tracking setup:", error);
      }
    };

    // Only track if we're in a browser environment
    if (typeof window !== "undefined") {
      trackView();
    }
  }, [postId]);

  return null; // This component doesn't render anything
}
