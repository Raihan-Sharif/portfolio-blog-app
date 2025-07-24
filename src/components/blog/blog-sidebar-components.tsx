// Shareable Blog Sidebar Components
// File: src/components/blog/blog-sidebar-components.tsx

"use client";

import { getReadTime } from "@/lib/utils";
import { BookOpen, Clock, Eye, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Interfaces
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  view_count: number;
  created_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface RelatedPostsProps {
  posts: Post[];
  currentPostId?: number;
  className?: string;
}

interface TrendingPostsProps {
  posts: Post[];
  currentPostId?: number;
  className?: string;
  showRanking?: boolean;
}

// Related Posts Component
export function RelatedPosts({
  posts,
  currentPostId,
  className = "",
}: RelatedPostsProps) {
  // Filter out current post if provided
  const filteredPosts = currentPostId
    ? posts.filter((post) => post.id !== currentPostId)
    : posts;

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl p-6 ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          Related Posts
        </h3>

        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const readingTime = getReadTime(post.excerpt || "");
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group p-4 rounded-xl bg-background/50 dark:bg-background/50 border border-border/30 hover:bg-accent/80 hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  {post.cover_image_url && (
                    <div className="relative w-full h-20 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                    {post.title}
                  </h4>
                  {post.category && (
                    <p className="text-xs text-primary mb-2 font-medium">
                      {post.category.name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {readingTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} />
                      {post.view_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Trending Posts Component
export function TrendingPosts({
  posts,
  currentPostId,
  className = "",
  showRanking = true,
}: TrendingPostsProps) {
  // Filter out current post if provided
  const filteredPosts = currentPostId
    ? posts.filter((post) => post.id !== currentPostId)
    : posts;

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl p-6 ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          Trending Now
        </h3>

        <div className="space-y-4">
          {filteredPosts.map((post, index) => {
            const readingTime = getReadTime(post.excerpt || "");
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group p-4 rounded-xl bg-background/50 dark:bg-background/50 border border-border/30 hover:bg-accent/80 hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start gap-3">
                    {showRanking && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-primary">
                          #{index + 1}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                        {post.title}
                      </h4>
                      {post.category && (
                        <p className="text-xs text-primary mb-2 font-medium">
                          {post.category.name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {readingTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={10} />
                          {post.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact Trending Posts (for small spaces)
export function CompactTrendingPosts({
  posts,
  currentPostId,
  className = "",
}: TrendingPostsProps) {
  // Filter out current post if provided
  const filteredPosts = currentPostId
    ? posts.filter((post) => post.id !== currentPostId).slice(0, 3)
    : posts.slice(0, 3);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {filteredPosts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <div className="p-4 rounded-xl bg-background/20 dark:bg-background/20 backdrop-blur-sm border border-border/20 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300">
            <p className="text-sm text-muted-foreground mb-2">
              Latest in {post.category?.name || "Development"}
            </p>
            <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors text-foreground">
              {post.title}
            </h4>
          </div>
        </Link>
      ))}
    </div>
  );
}
