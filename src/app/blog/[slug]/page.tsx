// Enhanced Professional Blog Post Detail Page (Server Component)
// File: src/app/blog/[slug]/page.tsx

import BlogContent from "@/components/blog/blog-content";
import {
  RelatedPosts,
  TrendingPosts,
} from "@/components/blog/blog-sidebar-components";
import ShareButton from "@/components/shared/share-button";
import { Button } from "@/components/ui/button";
import { ViewTracker } from "@/components/view-tracker";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Eye,
  Hash,
  Heart,
  MessageCircle,
  Sparkles,
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

  // Get post tags
  const { data: tagList } = await supabase
    .from("post_tags")
    .select(
      `
      tag_id,
      tags:tags(id, name, slug)
    `
    )
    .eq("post_id", post.id);

  const tags = tagList?.map((item: any) => item.tags).filter(Boolean) || [];

  // Get related posts (same category) - Simple approach
  let relatedPosts: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image_url?: string;
    created_at: string;
    view_count: number;
    category?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }[] = [];

  if (post.category_id) {
    const { data: relatedPostsData } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        cover_image_url,
        created_at,
        view_count,
        category_id
      `
      )
      .eq("published", true)
      .eq("category_id", post.category_id)
      .neq("id", post.id)
      .limit(3);

    // Add category data to each post
    relatedPosts = (relatedPostsData || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      cover_image_url: p.cover_image_url,
      created_at: p.created_at,
      view_count: p.view_count,
      category: post.category, // Use the same category as current post
    }));
  }

  // Get trending posts (most viewed) - Simple approach
  const { data: trendingPostsData } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      created_at,
      view_count,
      category_id
    `
    )
    .eq("published", true)
    .neq("id", post.id)
    .order("view_count", { ascending: false })
    .limit(4);

  // Get categories for trending posts
  const categoryIds = [
    ...new Set(trendingPostsData?.map((p) => p.category_id).filter(Boolean)),
  ];
  const { data: categories } =
    categoryIds.length > 0
      ? await supabase
          .from("categories")
          .select("id, name, slug")
          .in("id", categoryIds)
      : { data: [] };

  // Map categories to posts
  const trendingPosts: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image_url?: string;
    created_at: string;
    view_count: number;
    category?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }[] = (trendingPostsData || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    cover_image_url: p.cover_image_url,
    created_at: p.created_at,
    view_count: p.view_count,
    category: categories?.find((c) => c.id === p.category_id) || null,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed ViewTracker */}
      <ViewTracker type="post" id={post.id} />

      {/* Enhanced Hero Section */}
      {post.cover_image_url && (
        <div className="relative h-[70vh] overflow-hidden">
          {/* Background Image with overlay */}
          <div className="absolute inset-0">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 h-full flex flex-col justify-end">
            <div className="container mx-auto px-4 pb-16">
              <div className="max-w-4xl">
                {/* Category Badge */}
                {post.category && (
                  <div className="mb-6">
                    <Link
                      href={`/blog?category=${post.category.slug}`}
                      className="inline-block"
                    >
                      <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-sm font-semibold shadow-xl hover:bg-white/30 transition-all duration-300">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {post.category.name}
                      </div>
                    </Link>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-white/90">
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
              </div>
            </div>

            {/* Floating action buttons */}
            <div className="absolute bottom-8 right-8 flex gap-3">
              <ShareButton
                title={post.title}
                description={post.excerpt || textContent.slice(0, 150) + "..."}
                variant="floating"
                size="lg"
                showLabel={false}
                className="p-4 rounded-full hover:scale-110"
              />
              <button className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-xl rounded-full transition-all duration-300 hover:scale-110">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-xl rounded-full transition-all duration-300 hover:scale-110">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative bg-background">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-background dark:from-slate-900/50">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] bg-foreground" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-3">
              {/* Navigation */}
              <div className="mb-12 flex items-center justify-between">
                <Link href="/blog">
                  <Button
                    variant="outline"
                    className="gap-2 bg-background/80 dark:bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/80 shadow-lg transition-all duration-300"
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
                    <button className="p-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Header for posts without cover image */}
              {!post.cover_image_url && (
                <div className="mb-12">
                  {/* Category Badge */}
                  {post.category && (
                    <div className="mb-6">
                      <Link
                        href={`/blog?category=${post.category.slug}`}
                        className="inline-block"
                      >
                        <div className="inline-flex items-center px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm border border-primary/20">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {post.category.name}
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
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
                </div>
              )}

              {/* Enhanced Content Container */}
              <div className="relative overflow-hidden rounded-3xl bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl p-8 md:p-12 mb-12">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10">
                  <BlogContent content={post.content} />
                </div>
              </div>

              {/* Enhanced Tags Section */}
              {tags.length > 0 && (
                <div className="mb-12">
                  <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl p-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <Hash className="w-4 h-4 text-white" />
                        </div>
                        Related Topics
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {tags.map((tag: any) => (
                          <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                            <div className="inline-flex items-center px-4 py-2 bg-background/50 dark:bg-background/50 hover:bg-accent/80 border border-border/50 text-foreground hover:text-primary rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-sm shadow-lg hover:scale-105">
                              <Hash size={12} className="mr-1" />
                              {tag.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Engagement Section */}
              <div className="text-center mb-12">
                <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />

                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      Enjoyed this article?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Share your thoughts, bookmark for later, or explore more
                      articles on similar topics.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                      <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-lg">
                        <Heart size={16} />
                        Like Article
                      </Button>

                      <ShareButton
                        title={post.title}
                        description={
                          post.excerpt || textContent.slice(0, 150) + "..."
                        }
                        variant="default"
                        size="md"
                        showLabel={true}
                        className="shadow-lg"
                      />

                      <Button
                        variant="outline"
                        className="gap-2 bg-background/50 dark:bg-background/50 border-border/50 hover:bg-accent/80"
                      >
                        <MessageCircle size={16} />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Related Posts - Using Shareable Component */}
                {relatedPosts && relatedPosts.length > 0 && (
                  <RelatedPosts
                    posts={relatedPosts}
                    currentPostId={post.id}
                    className=""
                  />
                )}

                {/* Trending Posts - Using Shareable Component */}
                {trendingPosts && trendingPosts.length > 0 && (
                  <TrendingPosts
                    posts={trendingPosts}
                    currentPostId={post.id}
                    showRanking={true}
                    className=""
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
