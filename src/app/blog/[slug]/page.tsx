// src/app/blog/[slug]/page.tsx
import BlogContent from "@/components/blog/blog-content";
import { Button } from "@/components/ui/button";
import { ViewTracker } from "@/components/view-tracker";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Hash,
  Heart,
  Share2,
  User,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Helper function to extract text content from blog content
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

// Dynamic metadata
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles(*)
    `
    )
    .eq("slug", params.slug)
    .single();

  if (!post) {
    return {
      title: "Post Not Found | Raihan Sharif",
    };
  }

  return {
    title: `${post.title} | Raihan Sharif`,
    description: post.excerpt || undefined,
    openGraph: post.cover_image_url
      ? {
          images: [{ url: post.cover_image_url }],
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = createServerSupabaseClient();

  // Get post data
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles(*),
      category:categories(*)
    `
    )
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (error || !post) {
    notFound();
  }

  // Calculate reading time
  const textContent = extractTextContent(post.content);
  const readingTime = getReadTime(textContent);

  // Get post tags with simpler, explicit query
  const { data: tagList } = await supabase
    .from("post_tags")
    .select(
      `
      tag_id,
      tags:tags(id, name, slug)
    `
    )
    .eq("post_id", post.id);

  // Extract the tags
  const tags = tagList ? tagList.map((item) => item.tags) : [];

  // Get related posts
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      created_at,
      content,
      excerpt
    `
    )
    .eq("category_id", post.category_id)
    .neq("id", post.id)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background">
      {/* View Tracker - Client Component for tracking views */}
      <ViewTracker
        type="post"
        id={post.id}
        delay={2000}
        threshold={5000}
        debug={process.env.NODE_ENV === "development"}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh]">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>

            {/* Floating action buttons */}
            <div className="absolute bottom-8 right-8 flex gap-3">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group">
                <Share2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group">
                <Heart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-8">
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="gap-2 hover:shadow-lg transition-all duration-300"
                >
                  <ArrowLeft size={16} />
                  Back to Blog
                </Button>
              </Link>
            </div>

            {/* Category Badge */}
            {post.category && (
              <div className="mb-6">
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="inline-block"
                >
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg">
                    {post.category.name}
                  </div>
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author?.full_name || "Anonymous"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{readingTime} min read</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{post.view_count || 0} views</span>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-12">
                <div className="p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 border-l-4 border-primary rounded-lg">
                  <p className="text-xl text-muted-foreground italic leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <BlogContent content={post.content} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-12 p-6 bg-card/50 rounded-xl border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="group"
                    >
                      <div className="inline-flex items-center px-4 py-2 bg-accent hover:bg-primary/10 rounded-full text-sm transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                        <Hash size={12} className="mr-2" />
                        {tag.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author */}
            {post.author && (
              <div className="mb-12 p-6 bg-gradient-to-r from-card/80 to-card rounded-xl border shadow-lg">
                <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                <div className="flex items-start gap-6">
                  {post.author.avatar_url && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/20">
                      <Image
                        src={post.author.avatar_url}
                        alt={post.author.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">
                      {post.author.full_name}
                    </h4>
                    {post.author.bio && (
                      <p className="text-muted-foreground leading-relaxed">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-8">Related Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => {
                    const relatedReadTime = getReadTime(
                      extractTextContent(relatedPost.content)
                    );

                    return (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="group"
                      >
                        <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                          <div className="relative h-48 w-full">
                            {relatedPost.cover_image_url ? (
                              <Image
                                src={relatedPost.cover_image_url}
                                alt={relatedPost.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                <span className="text-muted-foreground">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h4 className="font-semibold text-lg group-hover:text-primary transition-colors mb-3 line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>
                                {formatDistanceToNow(
                                  new Date(relatedPost.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{relatedReadTime} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
