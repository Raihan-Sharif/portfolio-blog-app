// src/components/ui/alert.tsx
import { cn } from "@/lib/utils";
import * as React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success" | "info";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground backdrop-blur-sm transition-all duration-200",
        {
          "border-red-200/60 bg-red-50/80 text-red-900 dark:border-red-800/60 dark:bg-red-950/80 dark:text-red-100 [&>svg]:text-red-600 shadow-red-500/10 shadow-lg": variant === "destructive",
          "border-amber-200/60 bg-amber-50/80 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/80 dark:text-amber-100 [&>svg]:text-amber-600 shadow-amber-500/10 shadow-lg": variant === "warning",
          "border-emerald-200/60 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-100 [&>svg]:text-emerald-600 shadow-emerald-500/10 shadow-lg": variant === "success",
          "border-blue-200/60 bg-blue-50/80 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/80 dark:text-blue-100 [&>svg]:text-blue-600 shadow-blue-500/10 shadow-lg": variant === "info",
          "bg-background/80 text-foreground border-gray-200/60 dark:border-gray-800/60 shadow-gray-500/5 shadow-lg": variant === "default",
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
