// src/app/blog/[slug]/page.tsx
import BlogContent from "@/components/blog/blog-content";
import ShareButton from "@/components/shared/share-button";
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
        delay={3000} // 3 seconds total delay
        debug={process.env.NODE_ENV === "development"} // Enable debug mode
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
              <ShareButton
                title={post.title}
                description={post.excerpt || textContent.slice(0, 150) + "..."}
                variant="floating"
                size="lg"
                showLabel={false}
              />
              <button className="p-3 bg-background/10 hover:bg-background/20 border border-foreground/20 text-foreground backdrop-blur-md shadow-lg rounded-full transition-all duration-300 hover:scale-105">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-8 flex items-center justify-between">
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="gap-2 hover:shadow-lg transition-all duration-300"
                >
                  <ArrowLeft size={16} />
                  Back to Blog
                </Button>
              </Link>

              {/* Share button for posts without cover image */}
              {!post.cover_image_url && (
                <div className="flex items-center gap-3">
                  <ShareButton
                    title={post.title}
                    description={
                      post.excerpt || textContent.slice(0, 150) + "..."
                    }
                    variant="inline"
                    size="md"
                  />
                  <button className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-full transition-all duration-300 hover:scale-105">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              )}
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
                <span>{post.author?.full_name || "Raihan Sharif"}</span>
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

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <BlogContent content={post.content} />
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mb-12 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 mr-3">
                  <Hash size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Tags:
                  </span>
                </div>
                {tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover:shadow-md"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Inline Share Section */}
            <div className="border-t border-b border-border py-8 mb-12">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">
                  Found this helpful? Share it!
                </div>
                <ShareButton
                  title={post.title}
                  description={
                    post.excerpt || textContent.slice(0, 150) + "..."
                  }
                  variant="default"
                  size="lg"
                />
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost: any) => {
                    const relatedReadTime = getReadTime(
                      extractTextContent(relatedPost.content)
                    );
                    return (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="group"
                      >
                        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                          {relatedPost.cover_image_url && (
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={relatedPost.cover_image_url}
                                alt={relatedPost.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h3>
                            {relatedPost.excerpt && (
                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {relatedPost.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(relatedPost.created_at),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{relatedReadTime} min read</span>
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
