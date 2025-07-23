// src/app/skills/loading.tsx
import {
  SkillCategorySkeleton,
  SkillsHeroSkeleton,
} from "@/components/ui/loading-states";

export default function SkillsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <SkillsHeroSkeleton />

        {/* Skills Categories */}
        <div className="container mx-auto px-4 space-y-16 pb-20">
          {/* Frontend Skills */}
          <section>
            <div className="text-center mb-12">
              <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
            <SkillCategorySkeleton />
          </section>

          {/* Backend Skills */}
          <section>
            <div className="text-center mb-12">
              <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
            <SkillCategorySkeleton />
          </section>

          {/* Database Skills */}
          <section>
            <div className="text-center mb-12">
              <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/60 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-xl"></div>
                    <div className="w-16 h-6 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded mb-3"></div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 bg-primary/20 rounded-full animate-pulse"
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tools & DevOps */}
          <section>
            <div className="text-center mb-12">
              <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/60 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-xl"></div>
                    <div className="w-16 h-6 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded mb-3"></div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 bg-primary/20 rounded-full animate-pulse"
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Summary Stats */}
          <section className="bg-accent/20 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="h-8 w-56 bg-muted animate-pulse rounded mx-auto mb-4"></div>
              <div className="h-4 w-80 bg-muted animate-pulse rounded mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                "Years of Experience",
                "Technologies Mastered",
                "Projects Completed",
              ].map((_, i) => (
                <div
                  key={i}
                  className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10"
                >
                  <div className="h-12 w-16 bg-muted animate-pulse rounded mx-auto mb-4"></div>
                  <div className="h-5 w-32 bg-muted animate-pulse rounded mx-auto mb-2"></div>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
