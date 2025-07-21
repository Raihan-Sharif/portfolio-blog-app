// src/app/projects/loading.tsx
import { ProjectCardSkeleton } from "@/components/ui/loading-states";

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto mb-6"></div>
          <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto mb-8"></div>

          {/* Search/Filter Skeleton */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-12">
            <div className="h-10 w-full bg-muted animate-pulse rounded mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
