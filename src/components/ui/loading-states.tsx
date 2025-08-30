// src/components/ui/loading-states.tsx - Enhanced Loading States
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getSkeletonWidth, getSkeletonHeight } from "@/lib/utils";
import { Loader2, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "./button";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return <Loader2 className={cn("animate-spin", sizes[size], className)} />;
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface SectionLoadingProps {
  className?: string;
  message?: string;
}

export function SectionLoading({
  className,
  message = "Loading...",
}: SectionLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center space-y-4">
        <LoadingSpinner className="mx-auto text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroSkeleton() {
  return (
    <section className="min-h-screen flex items-center py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-28" />
            </div>
          </div>
          <div className="relative">
            <Skeleton className="w-80 h-80 rounded-full mx-auto" />
            {/* <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 animate-pulse" /> */}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSkeleton() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-64 mx-auto mb-6" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// NEW: About Page Specific Skeletons
export function AboutHeroSkeleton() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="relative w-64 h-64 mx-auto lg:mx-0">
              <Skeleton className="w-full h-full rounded-full" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 animate-pulse" />
            </div>
            <div className="flex justify-center lg:justify-start gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-28" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TimelineItemSkeleton() {
  return (
    <div className="relative pl-8 pb-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />

      {/* Timeline line */}
      <div className="absolute left-2 top-6 w-px h-full bg-border" />

      {/* Content */}
      <Card className="bg-card/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-12 h-12 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AboutSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="space-y-8 max-w-4xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <TimelineItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// NEW: Skills Page Specific Skeletons
export function SkillsHeroSkeleton() {
  return (
    <section className="text-center py-20">
      <div className="container mx-auto px-4">
        <Skeleton className="h-12 w-64 mx-auto mb-6" />
        <Skeleton className="h-4 w-96 mx-auto mb-12" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SkillCategorySkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card
            key={i}
            className="bg-card/60 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="w-full bg-muted rounded-full h-2">
                <Skeleton
                  className="h-2 rounded-full"
                  style={{ width: getSkeletonWidth(i) }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// NEW: Admin Dashboard Specific Skeletons
export function AdminHeaderSkeleton() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <div className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      </CardContent>
    </Card>
  );
}

export function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-end justify-between space-x-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton
              key={i}
              className="w-8 rounded-t"
              style={{ height: getSkeletonHeight(i) }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AdminHeaderSkeleton />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <RecentItemSkeleton key={i} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <RecentItemSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error States
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto text-destructive">
          <WifiOff size={64} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCcw size={16} />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

interface NetworkErrorProps {
  onRetry: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorState
      title="Connection Problem"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

interface ServerErrorProps {
  onRetry?: () => void;
}

export function ServerError({ onRetry }: ServerErrorProps) {
  return (
    <ErrorState
      title="Server Error"
      message="Our servers are experiencing issues. Please try again in a few moments."
      onRetry={onRetry}
    />
  );
}

// Loading wrapper that shows skeleton while loading
interface LoadingWrapperProps {
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingWrapper({
  loading,
  error,
  onRetry,
  skeleton,
  children,
}: LoadingWrapperProps) {
  if (loading) {
    return <>{skeleton}</>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load content"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}
