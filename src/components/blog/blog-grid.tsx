"use client";

import { Button } from "@/components/ui/button";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, Hash, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the types locally instead of importing from @/types
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  cover_image_url?: string;
  published: boolean;
  author_id: string;
  author?: any;
  category_id?: number;
  category?: Category;
  view_count: number;
  created_at: string;
  updated_at?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface BlogGridProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  tags: Tag[];
  selectedTag?: string;
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

export default function BlogGrid({
  posts,
  currentPage,
  totalPages,
  tags,
  selectedTag,
}: BlogGridProps) {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No posts found</h2>
          <p className="text-muted-foreground mb-8">
            Try changing your search or filter criteria.
          </p>
          <Link href="/blog">
            <Button>View All Posts</Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => {
              const textContent = extractTextContent(post.content);
              const readingTime = getReadTime(textContent);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={(e) => handleCardClick(post.slug, e)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    {post.category && (
                      <div className="mb-2">
                        <Link
                          href={`/blog?category=${post.category.slug}`}
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {post.category.name}
                        </Link>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User size={12} className="mr-1" />
                        <span>{post.author?.full_name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        <span>{readingTime} min read</span>
                      </div>
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        <span>{post.view_count || 0} views</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                {currentPage > 1 && (
                  <Link href={`/blog?page=${currentPage - 1}`}>
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link key={page} href={`/blog?page=${page}`}>
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                      >
                        {page}
                      </Button>
                    </Link>
                  )
                )}
                {currentPage < totalPages && (
                  <Link href={`/blog?page=${currentPage + 1}`}>
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-3">
          <div className="bg-card rounded-lg p-6 shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs transition-colors hover:shadow-sm ${
                    selectedTag === tag.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent hover:bg-primary/10"
                  }`}
                >
                  <Hash size={12} className="mr-1" />
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
