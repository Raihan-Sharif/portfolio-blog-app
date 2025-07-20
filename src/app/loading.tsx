// src/app/loading.tsx
import {
  ContactSkeleton,
  HeroSkeleton,
  ProjectCardSkeleton,
} from "@/components/ui/loading-states";

export default function Loading() {
  return (
    <>
      <HeroSkeleton />

      {/* Projects Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto mb-6"></div>
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section Skeleton */}
      <section className="py-20 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto mb-6"></div>
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card">
                <div className="w-16 h-16 bg-muted animate-pulse rounded-full mx-auto mb-4"></div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-xl"></div>
                  <div className="w-16 h-6 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-5 w-20 bg-muted animate-pulse rounded mb-3"></div>
                <div className="w-full h-2 bg-muted animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto mb-6"></div>
            <div className="h-4 w-96 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-lg overflow-hidden shadow-md"
              >
                <div className="h-48 w-full bg-muted animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-6 w-full bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-4"></div>
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded mb-4"></div>
                  <div className="flex gap-4 text-sm">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSkeleton />
    </>
  );
}
