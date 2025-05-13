"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function ViewTracker({ postId }: { postId: number }) {
  useEffect(() => {
    const trackView = async () => {
      try {
        // First check if this is a genuine new view (could implement more sophisticated
        // tracking with session/cookie-based checks in a production app)
        const viewTimestamp = sessionStorage.getItem(`post-view-${postId}`);
        const currentTime = Date.now();

        // Only count as a new view if first time or more than 30 minutes since last view
        if (
          !viewTimestamp ||
          currentTime - parseInt(viewTimestamp) > 30 * 60 * 1000
        ) {
          // Update session storage
          sessionStorage.setItem(`post-view-${postId}`, currentTime.toString());

          // Call the RPC function to update view count
          const { error } = await supabase.rpc("increment_post_view", {
            post_id_param: postId,
          });

          if (error) {
            console.error("Error tracking view:", error);
          }
        }
      } catch (error) {
        console.error("Error in view tracking:", error);
      }
    };

    trackView();
  }, [postId]);

  return null; // This component doesn't render anything
}
