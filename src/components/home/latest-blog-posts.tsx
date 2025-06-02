"use client";

import { Button } from "@/components/ui/button";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Latest Blog Posts</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I write about web development, technology trends, and best practices
            in software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => {
            const textContent = extractTextContent(post.content);
            const readingTime = getReadTime(textContent);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative h-48 w-full">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {post.category && (
                    <div className="mb-2">
                      <Link
                        href={`/blog?category=${post.category.slug}`}
                        className="text-sm font-medium text-primary"
                      >
                        {post.category.name}
                      </Link>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{post.author?.full_name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button className="gap-2">
              View All Posts
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
