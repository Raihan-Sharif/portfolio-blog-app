import BlogContent from "@/components/blog/blog-content";
import ViewTracker from "@/components/blog/view-tracker";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getReadTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Calendar, Clock, Hash, User } from "lucide-react";
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

  // Just extract the tags we need without complex mapping
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
    <div className="min-h-screen">
      {/* Add ViewTracker component for client-side view tracking */}
      <ViewTracker postId={post.id} />

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="relative h-[40vh] md:h-[50vh]">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </Link>

          {post.category && (
            <div className="mb-4">
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-sm font-medium text-primary"
              >
                {post.category.name}
              </Link>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
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
            <div>
              <span>{post.view_count || 0} views</span>
            </div>
          </div>

          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 border-l-4 border-primary pl-4 italic">
              {post.excerpt}
            </p>
          )}

          <BlogContent content={post.content} />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent hover:bg-primary/10"
                  >
                    <Hash size={12} className="mr-1" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          {post.author && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                {post.author.avatar_url && (
                  <div className="w-16 h-16 relative rounded-full overflow-hidden">
                    <Image
                      src={post.author.avatar_url}
                      alt={post.author.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{post.author.full_name}</h4>
                  {post.author.bio && (
                    <p className="text-muted-foreground">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-6">Related Posts</h3>
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
                      <div className="bg-card rounded-lg overflow-hidden shadow-md">
                        <div className="relative h-40 w-full">
                          {relatedPost.cover_image_url ? (
                            <Image
                              src={relatedPost.cover_image_url}
                              alt={relatedPost.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <span className="text-muted-foreground">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium group-hover:text-primary transition-colors mb-2">
                            {relatedPost.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(
                                new Date(relatedPost.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
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
  );
}
