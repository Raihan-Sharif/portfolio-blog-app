"use client";

import { Button } from "@/components/ui/button";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Hash,
  LayoutGrid,
  List,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Post interface
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  cover_image_url?: string;
  published: boolean;
  author_id: string;
  author?: {
    full_name: string;
  } | null;
  category_id?: number;
  category?: {
    name: string;
    slug: string;
  } | null;
  view_count: number;
  created_at: string;
  updated_at?: string;
}

// Tag interface
interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

interface BlogGridProps {
  posts: Post[];
  tags: Tag[];
  currentPage: number;
  totalPages: number;
  selectedTag?: string;
  searchQuery?: string;
}

// Helper function to extract text content
function extractTextContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") {
    return content.replace(/<[^>]*>/g, "");
  }
  if (content.html && typeof content.html === "string") {
    return content.html.replace(/<[^>]*>/g, "");
  }
  if (content.json && content.json.content) {
    const extractFromNodes = (nodes: any[]): string => {
      let text = "";
      nodes.forEach((node: any) => {
        if (node.type === "text") {
          text += node.text || "";
        } else if (node.content) {
          text += extractFromNodes(node.content);
        }
      });
      return text;
    };
    return extractFromNodes(content.json.content);
  }
  return "";
}

export default function BlogGrid({
  posts,
  tags,
  currentPage,
  totalPages,
  selectedTag,
  searchQuery,
}: BlogGridProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleCardClick = (slug: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "A" ||
      target.closest("a") ||
      target.tagName === "BUTTON" ||
      target.closest("button")
    ) {
      return;
    }
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results header with view toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : "Latest Articles"}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {posts.length} article{posts.length !== 1 ? "s" : ""} found
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`gap-2 ${viewMode === "grid" ? "shadow-md" : ""}`}
                >
                  <LayoutGrid size={16} />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`gap-2 ${viewMode === "list" ? "shadow-md" : ""}`}
                >
                  <List size={16} />
                  List
                </Button>
              </div>
            </div>

            {selectedTag && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full">
                <Hash size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  Tagged: {tags.find((tag) => tag.slug === selectedTag)?.name}
                </span>
              </div>
            )}
          </div>

          {posts.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or browse all articles.
              </p>
              <Link href="/blog">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft size={16} />
                  View All Articles
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* Posts Layout */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-8"
                  : "space-y-8"
              }
            >
              {posts.map((post, index) => {
                const textContent = extractTextContent(post.content);
                const readingTime = getReadTime(textContent);

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    onClick={(e) => handleCardClick(post.slug, e)}
                    className="group cursor-pointer"
                  >
                    {viewMode === "grid" ? (
                      /* Grid Card */
                      <div className="relative h-full overflow-hidden rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 hover:shadow-2xl transition-all duration-500">
                        {/* Glass overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          {post.cover_image_url ? (
                            <Image
                              src={post.cover_image_url}
                              alt={post.title}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                              <BookOpen className="w-12 h-12 text-primary/60" />
                            </div>
                          )}

                          {/* Category Badge */}
                          {post.category && (
                            <div className="absolute top-4 left-4">
                              <Link
                                href={`/blog?category=${post.category.slug}`}
                                className="inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-primary rounded-full text-xs font-semibold border border-white/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg">
                                  {post.category.name}
                                </div>
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 relative z-10">
                          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                            {post.title}
                          </h3>

                          <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {post.excerpt || textContent.slice(0, 120) + "..."}
                          </p>

                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/80 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>
                                {formatDistanceToNow(
                                  new Date(post.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{readingTime} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={12} />
                              <span>{post.view_count || 0}</span>
                            </div>
                          </div>

                          {/* Read More */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                              Read More
                            </span>
                            <ArrowRight
                              size={16}
                              className="text-primary group-hover:translate-x-1 transition-transform duration-300"
                            />
                          </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                      </div>
                    ) : (
                      /* List Card */
                      <div className="relative overflow-hidden rounded-3xl backdrop-blur-sm border border-white/20 shadow-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 hover:shadow-2xl transition-all duration-500">
                        {/* Glass overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
                            {post.cover_image_url ? (
                              <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                                <BookOpen className="w-16 h-16 text-primary/60" />
                              </div>
                            )}

                            {/* Category Badge */}
                            {post.category && (
                              <div className="absolute top-4 left-4">
                                <Link
                                  href={`/blog?category=${post.category.slug}`}
                                  className="inline-block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-primary rounded-full text-xs font-semibold border border-white/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg">
                                    {post.category.name}
                                  </div>
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-8 relative z-10">
                            <h3 className="text-2xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                              {post.title}
                            </h3>

                            <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed text-lg">
                              {post.excerpt ||
                                textContent.slice(0, 200) + "..."}
                            </p>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/80 mb-6">
                              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Calendar size={16} />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(post.created_at),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                <User size={16} />
                                <span>
                                  {post.author?.full_name || "Anonymous"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Clock size={16} />
                                <span>{readingTime} min read</span>
                              </div>

                              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Eye size={16} />
                                <span>{post.view_count || 0} views</span>
                              </div>
                            </div>

                            {/* Read More Button */}
                            <div className="flex items-center justify-between">
                              <span className="text-primary font-semibold group-hover:text-primary/80 transition-colors">
                                Continue Reading
                              </span>
                              <ArrowRight
                                size={20}
                                className="text-primary group-hover:translate-x-2 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16"
            >
              <div className="flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/blog?page=${currentPage - 1}`}>
                    <Button
                      variant="outline"
                      className="gap-2 backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </Button>
                  </Link>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <Link key={page} href={`/blog?page=${page}`}>
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`w-10 h-10 transition-all duration-300 ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30"
                        }`}
                      >
                        {page}
                      </Button>
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link href={`/blog?page=${currentPage + 1}`}>
                    <Button
                      variant="outline"
                      className="gap-2 backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="sticky top-8 space-y-8"
          >
            {/* Popular Tags */}
            <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-white" />
                  </div>
                  Popular Tags
                </h3>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl ${
                          selectedTag === tag.slug
                            ? "bg-primary text-primary-foreground border border-primary/30"
                            : "bg-white/20 hover:bg-white/30 border border-white/20 text-foreground hover:text-primary"
                        }`}
                      >
                        <Hash size={12} className="mr-1" />
                        {tag.name}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Content */}
            <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Trending Now
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-all duration-300">
                    <p className="text-sm text-muted-foreground mb-2">
                      Latest in Web Development
                    </p>
                    <h4 className="font-semibold text-sm">
                      Next.js 14 Features
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-all duration-300">
                    <p className="text-sm text-muted-foreground mb-2">
                      React Best Practices
                    </p>
                    <h4 className="font-semibold text-sm">
                      Component Architecture
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-all duration-300">
                    <p className="text-sm text-muted-foreground mb-2">
                      Backend Development
                    </p>
                    <h4 className="font-semibold text-sm">
                      API Design Patterns
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
