"use client";

import { Button } from "@/components/ui/button";
import { Post, Tag } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Hash, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogGridProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  tags: Tag[];
  selectedTag?: string;
}

export default function BlogGrid({
  posts,
  currentPage,
  totalPages,
  tags,
  selectedTag,
}: BlogGridProps) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col"
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
                <div className="p-6 flex-1 flex flex-col">
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
                  <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
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
                  </div>
                </div>
              </motion.div>
            ))}
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
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
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
