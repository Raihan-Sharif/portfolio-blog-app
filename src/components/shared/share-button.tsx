"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
  variant?: "default" | "floating" | "inline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ShareButton({
  title,
  description,
  url,
  className,
  variant = "default",
  size = "md",
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasWebShare, setHasWebShare] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = description || title;

  // Check if Web Share API is available
  useEffect(() => {
    setHasWebShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      // Try Web Share API first
      if (hasWebShare && navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);

        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // If Web Share API fails or user cancels, try clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardErr) {
        console.log("Share failed:", err, clipboardErr);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Define theme-aware variants
  const variants = {
    default: cn(
      "bg-card hover:bg-accent border border-border text-card-foreground hover:text-accent-foreground",
      "shadow-md hover:shadow-lg backdrop-blur-sm",
      "dark:bg-card dark:hover:bg-accent dark:border-border dark:text-card-foreground"
    ),
    floating: cn(
      "bg-background/10 hover:bg-background/20 border border-foreground/20 text-foreground",
      "backdrop-blur-md shadow-lg hover:shadow-xl",
      "dark:bg-background/10 dark:hover:bg-background/20 dark:border-foreground/20 dark:text-foreground"
    ),
    inline: cn(
      "bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary hover:text-primary",
      "shadow-sm hover:shadow-md",
      "dark:bg-primary/10 dark:hover:bg-primary/20 dark:border-primary/30 dark:text-primary"
    ),
  };

  // Define sizes
  const sizes = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      className={cn(
        "gap-2 transition-all duration-300 hover:scale-105",
        variants[variant],
        sizes[size],
        className
      )}
      variant="ghost"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="copied"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Check className={cn("text-green-500", iconSizes[size])} />
            {showLabel && <span>Copied!</span>}
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {hasWebShare ? (
              <Share2 className={cn(iconSizes[size])} />
            ) : (
              <Copy className={cn(iconSizes[size])} />
            )}
            {showLabel && (
              <span>
                {isSharing ? "Sharing..." : hasWebShare ? "Share" : "Copy Link"}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
