// src/components/ui/dashboard-skeleton.tsx
"use client";

import { cn, getSkeletonHeight } from "@/lib/utils";
import { Skeleton } from "./skeleton";

// Dashboard Stat Card Skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative overflow-hidden transition-all duration-300 border-0 bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl shadow-xl p-6",
      className
    )}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-lg">
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br from-primary to-purple-600 rounded-full -translate-y-16 translate-x-16" />
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ className, height = 300 }: { className?: string; height?: number }) {
  return (
    <div className={cn(
      "border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-6",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner space-x-1">
          <Skeleton className="h-8 w-10 rounded-lg" />
          <Skeleton className="h-8 w-12 rounded-lg" />
          <Skeleton className="h-8 w-10 rounded-lg" />
        </div>
      </div>
      
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4`} style={{ height }}>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-end space-x-2 h-8">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton 
                  key={j} 
                  className="flex-1 bg-gradient-to-t from-primary/20 to-primary/5" 
                  style={{ height: getSkeletonHeight(i * 7 + j, 20) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Skeleton className="w-3 h-3 rounded mr-2" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center">
            <Skeleton className="w-3 h-3 rounded mr-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent Content List Skeleton
export function RecentContentSkeleton({ className, items = 5 }: { className?: string; items?: number }) {
  return (
    <div className={cn(
      "border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-6",
      className
    )}>
      <div className="flex flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/50 dark:to-slate-700/50"
          >
            <div className="flex items-start space-x-4">
              <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Skeleton className="w-3 h-3 mr-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="w-3 h-3 mr-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="w-3 h-3 mr-1" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Online Users Skeleton
export function OnlineUsersSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-6",
      className
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
          <Skeleton className="w-5 h-5" />
        </div>
        <Skeleton className="h-6 w-28" />
      </div>
      
      <div className="flex items-center justify-center h-48 mb-4">
        <div className="relative">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="absolute inset-6 rounded-full" />
        </div>
      </div>
      
      <div className="flex justify-around text-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-8 mx-auto" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-8 mx-auto" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Quick Actions Skeleton
export function QuickActionsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-6",
      className
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
          <Skeleton className="w-5 h-5" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 border-2 border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
            <div className="absolute top-2 right-2">
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Content List Skeleton
export function TopContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-6",
      className
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
          <Skeleton className="w-5 h-5" />
        </div>
        <Skeleton className="h-6 w-28" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <Skeleton className="text-xs w-3 h-3" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-8 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Complete Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Online Users Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OnlineUsersSkeleton />
        <RecentContentSkeleton className="lg:col-span-2" items={3} />
      </div>

      {/* Analytics Section Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartSkeleton className="xl:col-span-2" />
        <TopContentSkeleton />
      </div>

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContentSkeleton />
        <RecentContentSkeleton />
      </div>

      {/* Monthly Chart Skeleton */}
      <ChartSkeleton />

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />
    </div>
  );
}