"use client";

import { Button } from "@/components/ui/button";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the Post interface directly
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

interface LatestBlogPostsProps {
  posts: Post[];
}

// Helper function to extract text content from blog content
function extractTextContent(content: any): string {
  if (!content) return "";

  if (typeof content === "string") {
    // Remove HTML tags
    return content.replace(/<[^>]*>/g, "");
  }

  if (content.html && typeof content.html === "string") {
    // Remove HTML tags from html content
    return content.html.replace(/<[^>]*>/g, "");
  }

  if (content.json && content.json.content) {
    // Extract text from TipTap JSON structure
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

export default function LatestBlogPosts({ posts }: LatestBlogPostsProps) {
  const router = useRouter();

  // Handle card click - navigate to post
  const handleCardClick = (slug: string, e: React.MouseEvent) => {
    // Prevent navigation if clicking on links or buttons
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
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/20 to-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Latest Insights
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Latest Blog Posts
            </span>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 blur-sm animate-pulse" />
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover insights about web development, technology trends, and
            software engineering best practices through my latest articles and
            tutorials.
          </p>
        </motion.div>

        {/* Enhanced Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {posts.map((post, index) => {
            const textContent = extractTextContent(post.content);
            const readingTime = getReadTime(textContent);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12 }}
                onClick={(e) => handleCardClick(post.slug, e)}
                className="group cursor-pointer h-full"
              >
                <div className="relative h-full rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 shadow-xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 hover:shadow-2xl transition-all duration-500">
                  {/* Glass overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Enhanced Image Container */}
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10" />
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
                        <TrendingUp className="w-12 h-12 text-primary/60" />
                      </div>
                    )}

                    {/* Floating Category Badge */}
                    {post.category && (
                      <div className="absolute top-4 left-4 z-20">
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

                  {/* Enhanced Content */}
                  <div className="p-6 relative z-10">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {post.excerpt || textContent.slice(0, 150) + "..."}
                    </p>

                    {/* Enhanced Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/80 mb-4">
                      <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Calendar size={14} />
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <User size={14} />
                        <span>{post.author?.full_name || "Anonymous"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Clock size={14} />
                        <span>{readingTime} min read</span>
                      </div>

                      <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Eye size={14} />
                        <span>{post.view_count || 0} views</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                        Read Article
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-primary group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/blog">
            <Button
              size="lg"
              className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                View All Posts
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>

              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
