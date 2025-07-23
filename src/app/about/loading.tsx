// src/app/about/loading.tsx
import {
  AboutHeroSkeleton,
  AboutSectionSkeleton,
} from "@/components/ui/loading-states";

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* Hero Section Skeleton */}
      <AboutHeroSkeleton />

      {/* Experience Section Skeleton */}
      <AboutSectionSkeleton title="Professional Experience" />

      {/* Education Section Skeleton */}
      <AboutSectionSkeleton title="Education" />

      {/* Courses Section Skeleton */}
      <AboutSectionSkeleton title="Professional Development" />

      {/* Achievements Section Skeleton */}
      <section className="py-16 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-xl"></div>
                  <div className="w-16 h-6 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Summary Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
            <div className="h-4 w-80 bg-muted animate-pulse rounded mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-white/10"
              >
                <div className="w-12 h-12 bg-muted animate-pulse rounded-xl mx-auto mb-3"></div>
                <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
