// src/components/admin/loading-states.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "default" | "pulse" | "bounce" | "spin";
}

export function LoadingSpinner({
  size = "md",
  className,
  text = "Loading...",
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const spinnerVariants = {
    default: (
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
    ),
    pulse: (
      <div
        className={cn(
          "rounded-full bg-primary animate-pulse",
          sizeClasses[size]
        )}
      />
    ),
    bounce: (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: ["0%", "-50%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    ),
    spin: (
      <div className="relative">
        <div
          className={cn(
            "border-4 border-primary/20 border-t-primary rounded-full animate-spin",
            sizeClasses[size]
          )}
        />
        <div
          className={cn(
            "absolute inset-0 border-4 border-transparent border-r-purple-500 rounded-full animate-spin",
            sizeClasses[size]
          )}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
    ),
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-3">
        {spinnerVariants[variant]}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-sm font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  height?: string;
  title?: string;
  description?: string;
}

export function LoadingCard({
  className,
  height = "h-32",
  title,
  description,
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center",
          height,
          "space-y-4"
        )}
      >
        <LoadingSpinner variant="spin" />
        {title && <div className="font-medium">{title}</div>}
        {description && (
          <div className="text-sm text-muted-foreground text-center">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export function Skeleton({
  className,
  lines = 1,
  variant = "text",
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted";

  if (variant === "circular") {
    return (
      <div className={cn(baseClasses, "rounded-full w-12 h-12", className)} />
    );
  }

  if (variant === "rectangular") {
    return <div className={cn(baseClasses, "rounded w-full h-4", className)} />;
  }

  if (variant === "card") {
    return (
      <div className={cn("animate-pulse space-y-4 p-4", className)}>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            baseClasses,
            "rounded h-4 mb-2 last:mb-0",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-1/4 h-4" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between space-x-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-muted rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 80 + 20}%`,
                width: "100%",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <Skeleton className="w-1/4 h-3" />
          <Skeleton className="w-1/6 h-3" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "network" | "permission" | "notFound" | "timeout";
  showIcon?: boolean;
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
  variant = "default",
  showIcon = true,
}: ErrorStateProps) {
  const variants = {
    default: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      title: title || "Something went wrong",
      message: message || "An unexpected error occurred. Please try again.",
      color: "red",
    },
    network: {
      icon: <WifiOff className="w-12 h-12 text-orange-500" />,
      title: title || "Connection Error",
      message:
        message ||
        "Unable to connect to the server. Check your internet connection.",
      color: "orange",
    },
    permission: {
      icon: <XCircle className="w-12 h-12 text-yellow-500" />,
      title: title || "Access Denied",
      message: message || "You don't have permission to access this resource.",
      color: "yellow",
    },
    notFound: {
      icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
      title: title || "Not Found",
      message: message || "The requested resource could not be found.",
      color: "blue",
    },
    timeout: {
      icon: <Clock className="w-12 h-12 text-purple-500" />,
      title: title || "Request Timeout",
      message: message || "The request took too long to complete.",
      color: "purple",
    },
  };

  const config = variants[variant];

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {showIcon && config.icon}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-lg font-semibold"
        >
          {config.title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted-foreground max-w-md"
        >
          {config.message}
        </motion.p>
        {onRetry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button onClick={onRetry} variant="outline" className="mt-4 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "illustration" | "minimal";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-2", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          {icon && (
            <div
              className={cn(
                "mb-4",
                variant === "illustration" ? "opacity-30" : "opacity-50"
              )}
            >
              {icon}
            </div>
          )}
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-semibold mb-2"
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-md mb-4"
          >
            {description}
          </motion.p>
        )}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  status: "success" | "pending" | "warning" | "error" | "info";
  text?: string;
  className?: string;
  animated?: boolean;
}

export function StatusBadge({
  status,
  text,
  className,
  animated = false,
}: StatusBadgeProps) {
  const variants = {
    success: {
      icon: <CheckCircle className="w-3 h-3" />,
      text: text || "Success",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800",
    },
    pending: {
      icon: <Clock className="w-3 h-3" />,
      text: text || "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    },
    warning: {
      icon: <AlertCircle className="w-3 h-3" />,
      text: text || "Warning",
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800",
    },
    error: {
      icon: <XCircle className="w-3 h-3" />,
      text: text || "Error",
      className:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800",
    },
    info: {
      icon: <Zap className="w-3 h-3" />,
      text: text || "Info",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    },
  };

  const variant = variants[status];

  return (
    <motion.span
      initial={animated ? { scale: 0 } : false}
      animate={animated ? { scale: 1 } : false}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variant.className,
        className
      )}
    >
      <span className={animated ? "animate-pulse" : ""}>{variant.icon}</span>
      {variant.text}
    </motion.span>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  animated?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = "default",
  animated = true,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-secondary/20 rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantClasses[variant]
          )}
          initial={animated ? { width: 0 } : false}
          animate={animated ? { width: `${percentage}%` } : false}
          style={!animated ? { width: `${percentage}%` } : undefined}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 text-xs"
    >
      <motion.div
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500" : "bg-red-500"
        )}
        animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-muted-foreground font-medium">
        {isOnline ? "Online" : "Offline"}
      </span>
    </motion.div>
  );
}

// Loading overlay for full-screen loading
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: "default" | "blur" | "solid";
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  variant = "blur",
}: LoadingOverlayProps) {
  const overlayClasses = {
    default: "bg-background/80 backdrop-blur-sm",
    blur: "bg-background/60 backdrop-blur-md",
    solid: "bg-background",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            overlayClasses[variant]
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card p-8 rounded-2xl shadow-2xl border max-w-sm mx-4"
          >
            <LoadingSpinner variant="spin" size="lg" text={message} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pulse loading for real-time data
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
